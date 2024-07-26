import { randomUUID } from 'crypto';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BankAccount } from './bankAccount.entity';
import { Card } from './card.entity';
import { WithAccount } from './withAccount.entity';

@Entity({ name: 'receipt' })
export class Receipt extends WithAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;

  @Column()
  reference: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column()
  paid: boolean = false;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 15, scale: 2 })
  paidAmount: number;

  @Column({ name: 'payment_date', type: 'decimal', precision: 15, scale: 2 })
  paymentDate: Date;

  @Column()
  debited: boolean = false;

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @AfterLoad()
  afterLoad() {
    this.totalAmount = parseFloat(this.totalAmount as unknown as string);
    this.paidAmount = parseFloat(this.paidAmount as unknown as string);
  }
}
