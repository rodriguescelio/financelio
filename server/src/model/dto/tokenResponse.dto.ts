import { Account } from "../entity/account.entity";

export class TokenResponseDTO {
  account: Account;
  token: string;

  constructor(account?: Account, token?: string) {
    this.account = account;
    this.token = token;
  }
}
