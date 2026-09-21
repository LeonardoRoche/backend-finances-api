import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('financial_accounts')
export class FinancialAccountOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pluggy_account_id', unique: true })
  pluggyAccountId!: string;

  @Column({ name: 'pluggy_item_id' })
  pluggyItemId!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  type!: 'BANK' | 'CREDIT';

  @Column({ type: 'varchar', length: 32 })
  subtype!: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balance!: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 14, scale: 2, nullable: true })
  creditLimit!: string | null;

  @Column({
    name: 'available_credit_limit',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  availableCreditLimit!: string | null;

  @Column({ name: 'balance_due_date', type: 'date', nullable: true })
  balanceDueDate!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  brand!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
