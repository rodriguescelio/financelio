import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BillDTO } from 'src/model/dto/bill.dto';
import { Bill } from 'src/model/entity/bill.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import * as moment from 'moment';
import { BillType } from 'src/model/enumerated/billType.enum';
import { Category } from 'src/model/entity/category.entity';
import { Card } from 'src/model/entity/card.entity';
import { BillDeleteRequestDTO } from 'src/model/dto/billDeleteRequest.dto';

@Injectable()
export class BillService {

  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly authService: AuthService
  ) {}

  async create(billDTO: BillDTO): Promise<Bill[]> {
    const date = moment(billDTO.date);
    
    let card: Card = null;
    let category = null;

    if (billDTO.card) {
      card = await this.cardRepository.findOneBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
        id: billDTO.card,
      });
    }

    if (billDTO.category) {
      category = await this.categoryRepository.findOneBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
        id: billDTO.category,
      });
    }

    const result = [];

    if (billDTO.type === BillType.INSTALLMENTS) {

      const amount = billDTO.isInstallmentAmount 
        ? billDTO.amount 
        : billDTO.amount / billDTO.installments;
      
      for (let i = 0; i < billDTO.installments; i++) {
        let installmentDate = date.clone().add(i + 1, 'month');

        if (card) {
          installmentDate.date(card.payDay);
          if (installmentDate.date() > card.closeDay) {
            installmentDate.add(1, 'month');
          }
        }

        const bill = new Bill();

        bill.account = this.authService.sessionAccount;
        bill.category = category;
        bill.card = card;
        bill.type = billDTO.type;
        bill.buyDate = date.toDate();
        bill.billDate = installmentDate.toDate();
        bill.description = billDTO.description;
        bill.amount = amount;
        bill.installments = billDTO.installments;
        bill.installmentIndex = i + 1;

        if (i !== 0) {
          bill.rootBill = result[0];
        }

        await this.billRepository.save(bill);

        result.push(bill);
      }
    } else {
      const bill = new Bill();

      bill.account = this.authService.sessionAccount;
      bill.category = category;
      bill.card = card;
      bill.type = billDTO.type;
      bill.buyDate = date.toDate();
      bill.billDate = date.toDate();
      bill.description = billDTO.description;
      bill.amount = billDTO.amount;

      await this.billRepository.save(bill);

      result.push(bill);
    }
    
    return result;
  }

  async findAll(): Promise<Bill[]> {
    return await this.billRepository.find({
      relations: {
        card: true,
        category: true,
      },
      where: {
        account: {
          id: this.authService.sessionAccount.id
        },
      },
    });
  }

  async deleteSingle(billId): Promise<void> {
    const bill = await this.billRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: billId,
    });

    if (!bill) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.billRepository.remove(bill);
  }

  async deleteAll(id: string) {
    await this.billRepository.delete({ rootBill: { id } });
    await this.billRepository.delete({ id });
  }

  async delete(billId, billDeleteRequest: BillDeleteRequestDTO): Promise<void> {
    const bill = await this.billRepository.findOne({
      relations: {
        rootBill: true,
      },
      where: {
        account: {
          id: this.authService.sessionAccount.id,
        },
        id: billId,
      },
    });

    if (!bill) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    if (billDeleteRequest.type === 'all') {
      const id = bill.rootBill ? bill.rootBill.id : bill.id;
      await this.deleteAll(id);
    } else if (billDeleteRequest.type === 'next') {
      if (bill.rootBill) {
        await this.billRepository.delete({
          rootBill: {
            id: bill.rootBill.id, 
          },
          installmentIndex: MoreThanOrEqual(bill.installmentIndex),
        });
      } else {
        await this.deleteAll(bill.id);
      }
    }
  }
}
