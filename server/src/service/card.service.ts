import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { CardDTO } from 'src/model/dto/card.dto';
import { InvoiceDTO } from 'src/model/dto/invoice.dto';
import { InvoicePaymentDTO } from 'src/model/dto/invoicePayment.dto';
import { ManualAmountDTO } from 'src/model/dto/manualAmount.dto';
import { BankAccount } from 'src/model/entity/bankAccount.entity';
import { BankAccountEntry } from 'src/model/entity/bankAccountEntry.entity';
import { Bill } from 'src/model/entity/bill.entity';
import { Card } from 'src/model/entity/card.entity';
import { Receipt } from 'src/model/entity/receipt.entity';
import { BillType } from 'src/model/enumerated/billType.enum';
import { EntryType } from 'src/model/enumerated/entryType.enum';
import { InvoiceInsertMode } from 'src/model/enumerated/invoiceInsertMode.enum';
import { InvoiceStatus } from 'src/model/enumerated/invoiceStatus.enum';
import { formatRef } from 'src/util/mask.util';
import { Between, Not, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { BankAccountService } from './bankAccount.service';
import { BillService } from './bill.service';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(BankAccountEntry)
    private bankAccountEntryRepository: Repository<BankAccountEntry>,
    private readonly authService: AuthService,
    private readonly bankAccountService: BankAccountService,
    private readonly billService: BillService,
  ) {}

  async findAll(): Promise<CardDTO[]> {
    const bills = await this.billRepository
      .createQueryBuilder('bill')
      .select('bill.amount', 'amount')
      .addSelect('bill.card.id', 'card')
      .where('bill.account.id = :id', {
        id: this.authService.sessionAccount.id,
      })
      .andWhere('bill.paid != true')
      .andWhere('bill.type != :type', { type: 'recurrence' })
      .getRawMany();

    const receipts = await this.receiptRepository.find({
      where: {
        reference: moment().format('MMYYYY'),
      },
      relations: { card: true },
    });

    return (
      await this.cardRepository.findBy({
        account: {
          id: this.authService.sessionAccount.id,
        },
      })
    ).map((card) => {
      const cardBills = bills.filter((it) => it.card === card.id);

      const reduce = (list: any[]) =>
        list.reduce((total, it) => total + parseFloat(it.amount), 0);

      const startDate = moment().startOf('month');
      const endDate = moment().endOf('month');

      const monthTotal = reduce(
        cardBills.filter((it) => {
          const d = moment(it.billDate);
          return d.isSameOrAfter(startDate) && d.isSameOrBefore(endDate);
        }),
      );

      return {
        ...card,
        status: this.getStatus(
          moment().date(card.closeDay + 1),
          receipts.find((it) => it.card.id === card.id),
          monthTotal,
        ),
        amountUsed: reduce(cardBills),
      };
    });
  }

  async persist(card: Card): Promise<Card> {
    const cardDB = card.id
      ? await this.cardRepository.findOneBy({ id: card.id })
      : new Card();

    cardDB.label = card.label;
    cardDB.amountLimit = card.amountLimit;
    cardDB.closeDay = card.closeDay;
    cardDB.payDay = card.payDay;

    if (!card.id) {
      cardDB.account = this.authService.sessionAccount;
    }

    await this.cardRepository.save(cardDB);

    return cardDB;
  }

  async delete(cardId): Promise<void> {
    const card = await this.cardRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id: cardId,
    });

    if (!card) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    await this.cardRepository.remove(card);
  }

  getStatus(
    date: moment.Moment,
    receipt: Receipt,
    total: number,
  ): InvoiceStatus {
    let status = InvoiceStatus.OPEN;

    if (total === 0 && (!receipt || receipt.totalAmount === 0)) {
      status = InvoiceStatus.EMPTY;
    } else if (date < moment()) {
      if (receipt && receipt.paid) {
        status =
          receipt.paidAmount >= receipt.totalAmount
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;
      } else {
        status = InvoiceStatus.CLOSED;
      }
    }

    return status;
  }

  async getInvoice(id: string, ref: string): Promise<InvoiceDTO> {
    const card = await this.cardRepository.findOneBy({
      account: {
        id: this.authService.sessionAccount.id,
      },
      id,
    });

    if (!card) {
      throw new HttpException('Invalid request!', HttpStatus.BAD_REQUEST);
    }

    const toDate = moment(ref, 'MMYYYY').date(card.closeDay + 1);
    const fromDate = toDate.clone().subtract(1, 'month');

    const bills = await this.billRepository.find({
      where: {
        account: { id: this.authService.sessionAccount.id },
        card: { id: card.id },
        billDate: Between(fromDate.toDate(), toDate.toDate()),
        type: Not(BillType.RECURRENCE),
      },
      order: {
        buyDate: 'DESC',
      },
    });

    const receipt = await this.receiptRepository.findOne({
      where: {
        account: { id: this.authService.sessionAccount.id },
        card: { id: card.id },
        reference: ref,
      },
      relations: { card: true },
    });

    const total = bills.reduce((t, i) => t + i.amount, 0);

    return new InvoiceDTO(
      card,
      ref,
      bills,
      total,
      receipt,
      this.getStatus(toDate, receipt, total),
    );
  }

  private newReceipt(invoice: InvoiceDTO): Receipt {
    const receipt = new Receipt();

    receipt.account = this.authService.sessionAccount;
    receipt.card = invoice.card;
    receipt.reference = invoice.ref;

    return receipt;
  }

  async persistManualAmount(
    id: string,
    manualAmount: ManualAmountDTO,
  ): Promise<InvoiceDTO> {
    const invoice = await this.getInvoice(id, manualAmount.ref);

    if (invoice) {
      let receipt: Receipt;
      let total = invoice.total;

      if (invoice.receipt) {
        receipt = invoice.receipt;
        total = invoice.receipt.totalAmount;
      } else {
        receipt = this.newReceipt(invoice);
      }

      if (total != manualAmount.amount) {
        receipt.totalAmount = manualAmount.amount;
        invoice.receipt = await this.receiptRepository.save(receipt);
      }
    }

    return invoice;
  }

  async persistPayment(
    id: string,
    data: InvoicePaymentDTO,
  ): Promise<InvoiceDTO> {
    const invoice = await this.getInvoice(id, data.ref);

    if (invoice) {
      if (!invoice.receipt) {
        invoice.receipt = this.newReceipt(invoice);
        invoice.receipt.totalAmount = invoice.total;
      }

      invoice.receipt.paid = true;
      invoice.receipt.paymentDate = moment(data.date).toDate();
      invoice.receipt.paidAmount = data.paid;
      invoice.receipt.debited = data.debit;

      let bankAccount = null;

      if (data.bankAccount) {
        bankAccount = await this.bankAccountRepository.findOneBy({
          id: data.bankAccount,
        });

        if (bankAccount) {
          invoice.receipt.bankAccount = bankAccount;
        }
      }

      switch (data.insertMode) {
        case InvoiceInsertMode.UPDATE_AMOUNT:
          invoice.receipt.totalAmount = invoice.receipt.paidAmount;
          break;
        case InvoiceInsertMode.CREATE_REMAINING_BILL:
          await this.billService.create({
            card: invoice.card.id,
            type: BillType.SINGLE,
            date: moment().format(),
            payDate: moment(`01${data.ref}`, 'DDMMYYYY')
              .add(1, 'month')
              .format('DD/MM/YYYY'),
            amount: invoice.receipt.totalAmount - invoice.receipt.paidAmount,
            description: `Valor restante da fatura de referência ${formatRef(
              data.ref,
            )} paga parcialmente`,
          });
          break;
      }

      invoice.receipt = await this.receiptRepository.save(invoice.receipt);

      if (bankAccount && data.debit) {
        const entry = new BankAccountEntry();

        entry.receipt = invoice.receipt;
        entry.bankAccount = bankAccount;
        entry.type = EntryType.DEBIT;
        entry.amount = invoice.receipt.paidAmount;
        entry.description = `Pagamento da fatura do cartão "${
          invoice.card.label
        }" na referência ${formatRef(data.ref)}`;

        await this.bankAccountService.persistEntry(entry);
      }

      invoice.bills.forEach((it) => {
        it.paid = true;
        it.paidDate = invoice.receipt.paymentDate;
      });

      await this.billRepository.save(invoice.bills);
    }

    return invoice;
  }

  async resetPayment(cardId: string, receiptId: string): Promise<void> {
    const receipt = await this.receiptRepository.findOne({
      where: {
        account: { id: this.authService.sessionAccount.id },
        card: { id: cardId },
        id: receiptId,
      },
      relations: {
        card: true,
        bankAccount: true,
      },
    });

    if (receipt) {
      const invoice = await this.getInvoice(cardId, receipt.reference);
      if (invoice) {
        invoice.bills.forEach((it) => {
          it.paid = false;
          it.paidDate = null;
        });
        await this.billRepository.save(invoice.bills);
      }

      if (receipt.debited) {
        let entry = await this.bankAccountEntryRepository.findOneBy({
          bankAccount: { id: receipt.bankAccount.id },
          receipt: { id: receipt.id },
        });

        if (entry) {
          await this.bankAccountEntryRepository.remove(entry);
        } else {
          entry = new BankAccountEntry();

          entry.type = EntryType.CREDIT;
          entry.bankAccount = receipt.bankAccount;
          entry.amount = receipt.paidAmount;
          entry.description = `Reversão do pagamento da fatura do cartão "${
            receipt.card.label
          }" na referência ${formatRef(receipt.reference)}`;

          await this.bankAccountService.persistEntry(entry);
        }
      }

      await this.receiptRepository.remove(receipt);
    }
  }
}
