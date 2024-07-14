import { Account } from '../entity/account.entity';

export class CardDTO {
  id: string;
  account: Account;
  label: string;
  amountLimit: number;
  amountUsed: number;
  closeDay: number;
  payDay: number;
  createdAt: Date;
}
