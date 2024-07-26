import { BankAccount } from '../entity/bankAccount.entity';
import { Bill } from '../entity/bill.entity';
import { Receipt } from '../entity/receipt.entity';
import { EntryType } from '../enumerated/entryType.enum';

export class BankAccountEntryDTO {
  bankAccount: Partial<BankAccount>;
  receipt: Receipt;
  bill: Bill;
  description: string;
  amount: number;
  type: EntryType;
}
