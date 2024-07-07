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
import { BillType } from '../enumerated/billType.enum';
import { Account } from './account.entity';
import { Card } from './card.entity';
import { Category } from './category.entity';

@Entity({ name: 'bill' })
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Card)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @ManyToOne(() => Bill)
  @JoinColumn({ name: 'root_bill_id' })
  rootBill: Bill;

  @Column()
  type: BillType;

  @Column({ name: 'buy_date' })
  buyDate: Date;

  @Column({ name: 'bill_date' })
  billDate: Date;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  installments: number;

  @Column({ name: 'installment_index' })
  installmentIndex: number;

  @Column()
  active: boolean = true;

  @Column({ name: 'generated_via_recurrence' })
  generatedViaRecurrence: boolean = false;

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
