import { randomUUID } from 'crypto';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WithAccount } from './withAccount.entity';

@Entity({ name: 'category' })
export class Category extends WithAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({ name: 'created_at' })
  createdAt: Date = new Date();

  @BeforeInsert()
  beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
