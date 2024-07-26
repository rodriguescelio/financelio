import { InvoiceInsertMode } from '../enumerated/invoiceInsertMode.enum';

export class InvoicePaymentDTO {
  ref: string;
  paid: number;
  date: string;
  bankAccount: string;
  debit: boolean;
  insertMode: InvoiceInsertMode;
}
