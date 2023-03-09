import { randomUUID } from 'crypto';
import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EntryType } from '../enumerated/entryType.enum';
import { BankAccount } from './bankAccount.entity';

@Entity({ name: 'bank_account_entry' })
export class BankAccountEntry {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.entries)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  type: EntryType;

  @Column({ name: 'created_at' })
  createdAt: Date = new Date();

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @AfterLoad()
  afterLoad() {
    this.amount = parseFloat(this.amount as unknown as string);
  }
}
