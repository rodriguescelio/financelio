import { randomUUID } from 'crypto';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntryType } from '../enumerated/entryType.enum';
import { BankAccount } from './bankAccount.entity';
import { Bill } from './bill.entity';
import { Receipt } from './receipt.entity';

@Entity({ name: 'bank_account_entry' })
export class BankAccountEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.entries)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @OneToOne(() => Receipt)
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;

  @OneToOne(() => Bill)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

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
