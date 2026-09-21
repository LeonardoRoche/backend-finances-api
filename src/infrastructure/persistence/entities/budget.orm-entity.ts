import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('budgets')
export class BudgetOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  limit: string;

  @Column({ default: 'monthly' })
  period: string;

  @Column({ name: 'alert_threshold', default: 80 })
  alertThreshold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
