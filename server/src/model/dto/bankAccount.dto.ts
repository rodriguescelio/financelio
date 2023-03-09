import { BankAccount } from "../entity/bankAccount.entity";

export class BankAccountDTO {

  id: string;
  label: string;
  createdAt: Date;
  amount: number = 0;

  constructor(bankAccount: BankAccount) {
    this.id = bankAccount.id;
    this.label = bankAccount.label;
    this.createdAt = bankAccount.createdAt;
  }
}
