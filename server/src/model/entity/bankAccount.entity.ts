import { randomUUID } from 'crypto';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BankAccountEntry } from './bankAccountEntry.entity';
import { WithAccount } from './withAccount.entity';

@Entity({ name: 'bank_account' })
export class BankAccount extends WithAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({ name: 'created_at' })
  createdAt: Date = new Date();

  @OneToMany(
    () => BankAccountEntry,
    (bankAccountEntry) => bankAccountEntry.bankAccount,
  )
  @JoinColumn({ name: 'bank_account_id' })
  entries: BankAccountEntry[];

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
