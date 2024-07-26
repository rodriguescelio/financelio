import { randomUUID } from 'crypto';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WithAccount } from './withAccount.entity';

@Entity({ name: 'card' })
export class Card extends WithAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
