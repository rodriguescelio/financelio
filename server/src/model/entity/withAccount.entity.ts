import { JoinColumn, ManyToOne } from 'typeorm';
import { Account } from './account.entity';

export class WithAccount {
  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
