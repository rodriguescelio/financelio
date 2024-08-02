import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BillDTO } from 'src/model/dto/bill.dto';
import { Bill } from 'src/model/entity/bill.entity';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import * as moment from 'moment';
import { BillType } from 'src/model/enumerated/billType.enum';
import { Category } from 'src/model/entity/category.entity';
import { Card } from 'src/model/entity/card.entity';
import { BillDeleteRequestDTO } from 'src/model/dto/billDeleteRequest.dto';
import { Tag } from 'src/model/entity/tag.entity';
import { EntryType } from 'src/model/enumerated/entryType.enum';
import { BankAccountService } from './bankAccount.service';
import { BankAccountEntryDTO } from 'src/model/dto/bankAccountEntry.dto';
import { PLAIN_DATE_FORMAT } from 'src/util/mask.util';
import { BillingFilterType } from 'src/model/enumerated/billingFilterType.enum';

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
    private readonly bankAccountService: BankAccountService,
  ) {}

  async create(billDTO: Partial<BillDTO>): Promise<Bill[]> {
    const date = moment(billDTO.date);
    const payDate = moment(billDTO.payDate);

    let card: Card = null;
    let category = null;

    if (billDTO.card) {
      card = await this.cardRepository.findOneBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
        id: billDTO.card,
      });

      if (card) {
        payDate.date(card.closeDay);
      }
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

      const currentDate = moment();
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

        if (billDTO.markPreviousPaid && installmentDate.isBefore(currentDate)) {
          bill.paid = true;
          bill.paidDate = installmentDate.toDate();
        }

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

      if (billDTO.paid) {
        bill.paid = true;
        bill.paidDate = payDate.toDate();
      }

      await this.billRepository.save(bill);

      if (billDTO.paid && billDTO.bankAccount && billDTO.debit) {
        const entry = new BankAccountEntryDTO();

        entry.bankAccount = { id: billDTO.bankAccount };
        entry.type = EntryType.DEBIT;
        entry.amount = bill.amount;
        entry.description = `Lançamento de cobrança já paga com débito em conta${
          bill.description ? ` - ${bill.description}` : ''
        }`;

        await this.bankAccountService.persistEntry(entry);
      }

      result.push(bill);
    }

    return result;
  }

  async findAll(query: any): Promise<Bill[]> {
    const period = Between(
      moment(query.start, PLAIN_DATE_FORMAT).toDate(),
      moment(query.end, PLAIN_DATE_FORMAT).toDate(),
    );

    const where: any = {
      account: {
        id: this.authService.sessionAccount.id,
      },
    };

    let field = '';

    switch (query.filterType) {
      case BillingFilterType.BUY:
        where.buyDate = period;
        field = 'buyDate';
        break;
      case BillingFilterType.BILLING:
        where.billDate = period;
        field = 'billDate';
        break;
    }

    if (query.cards && query.cards.length) {
      where.card = { id: In(query.cards) };
    }

    if (query.categories && query.categories.length) {
      where.category = { id: In(query.categories) };
    }

    if (query.tags && query.tags.length) {
      where.tags = { id: In(query.tags) };
    }

    if (query.unpaid === 'true' && query.paid === 'false') {
      where.paid = false;
    } else if (query.unpaid === 'false' && query.paid === 'true') {
      where.paid = true;
    }

    if (query.types && query.types.length) {
      // TODO: ajuste para cobranças do tipo recorrência
      where.type = In(query.types);
    }

    return await this.billRepository.find({
      relations: {
        card: true,
        category: true,
        tags: true,
      },
      where,
      order: {
        [field]: 'DESC',
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
