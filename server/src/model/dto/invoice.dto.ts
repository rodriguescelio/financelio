import { Bill } from '../entity/bill.entity';
import { Card } from '../entity/card.entity';
import { Receipt } from '../entity/receipt.entity';
import { InvoiceStatus } from '../enumerated/invoiceStatus.enum';

export class InvoiceDTO {
  card?: Card;
  ref?: string;
  bills?: Bill[];
  total: number;
  receipt?: Receipt;
  status?: InvoiceStatus;

  constructor(
    card: Card,
    ref: string,
    bills: Bill[],
    total: number,
    receipt: Receipt,
    status: InvoiceStatus,
  ) {
    this.card = card;
    this.ref = ref;
    this.bills = bills;
    this.total = total;
    this.receipt = receipt;
    this.status = status;
  }
}
