import { randomUUID } from 'crypto';
import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity({ name: 'card' })
export class Card {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  label: string;

  @Column({ name: 'amount_limit', type: 'decimal', precision: 15, scale: 2 })
  amountLimit: number;

  @Column({ name: 'close_day' })
  closeDay: number;

  @Column({ name: 'pay_day' })
  payDay: number;

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
    this.amountLimit = parseFloat(this.amountLimit as unknown as string);
  }
}
