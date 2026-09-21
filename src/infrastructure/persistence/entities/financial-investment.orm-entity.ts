import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('financial_investments')
export class FinancialInvestmentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pluggy_investment_id', unique: true })
  pluggyInvestmentId!: string;

  @Column({ name: 'pluggy_item_id' })
  pluggyItemId!: string;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance!: string;

  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  subtype!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
