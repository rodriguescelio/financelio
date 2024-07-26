import { randomUUID } from 'crypto';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WithAccount } from './withAccount.entity';

@Entity({ name: 'tag' })
export class Tag extends WithAccount {
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
