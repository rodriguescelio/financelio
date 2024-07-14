import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BillDTO } from 'src/model/dto/bill.dto';
import { Bill } from 'src/model/entity/bill.entity';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import * as moment from 'moment';
import { BillType } from 'src/model/enumerated/billType.enum';
import { Category } from 'src/model/entity/category.entity';
import { Card } from 'src/model/entity/card.entity';
import { BillDeleteRequestDTO } from 'src/model/dto/billDeleteRequest.dto';
import { Tag } from 'src/model/entity/tag.entity';
import { warn } from 'console';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    private readonly authService: AuthService,
  ) {}

  async create(billDTO: BillDTO): Promise<Bill[]> {
    const date = moment(billDTO.date);
    const payDate = moment(billDTO.payDate, 'DD/MM/YYYY');

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

    let tags = [];
    if (billDTO.tags && billDTO.tags.length) {
      tags = await this.tagRepository.findBy({ id: In(billDTO.tags) });
    }

    const result = [];

    if (billDTO.type === BillType.INSTALLMENTS) {
      const amount = billDTO.isInstallmentAmount
        ? billDTO.amount
        : billDTO.amount / billDTO.installments;

      const installmentDate = payDate.clone();

      for (let i = 0; i < billDTO.installments; i++) {
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
        bill.tags = tags;

        if (i !== 0) {
          bill.rootBill = result[0];
        }

        await this.billRepository.save(bill);

        result.push(bill);

        installmentDate.add(1, 'month');
      }
    } else {
      const bill = new Bill();

      bill.account = this.authService.sessionAccount;
      bill.category = category;
      bill.card = card;
      bill.type = billDTO.type;
      bill.buyDate = date.toDate();
      bill.billDate = payDate.toDate();
      bill.description = billDTO.description;
      bill.amount = billDTO.amount;
      bill.tags = tags;

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
        tags: true,
      },
      where: {
        account: {
          id: this.authService.sessionAccount.id,
        },
        generatedViaRecurrence: false,
      },
      order: {
        buyDate: 'ASC',
        installmentIndex: 'ASC',
      },
    });
  }

  async deleteSingle(billId: string): Promise<void> {
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

  async delete(
    billId: string,
    billDeleteRequest: BillDeleteRequestDTO,
  ): Promise<void> {
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
