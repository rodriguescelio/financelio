import { randomUUID } from 'crypto';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';
import { BankAccountEntry } from './bankAccountEntry.entity';

@Entity({ name: 'bank_account' })
export class BankAccount {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  label: string;

  @Column({ name: 'created_at' })
  createdAt: Date = new Date();

  @OneToMany(() => BankAccountEntry, (bankAccountEntry) => bankAccountEntry.bankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  entries: BankAccountEntry[];

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
