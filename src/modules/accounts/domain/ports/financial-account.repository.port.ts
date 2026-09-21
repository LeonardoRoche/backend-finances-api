import type { FinancialAccountEntity } from '../entities/financial-account.entity.js';

export interface FinancialAccountRepositoryPort {
  upsertByPluggyAccountId(
    account: FinancialAccountEntity,
  ): Promise<FinancialAccountEntity>;
  findAll(): Promise<FinancialAccountEntity[]>;
}

export const financialAccountRepositoryPort = Symbol(
  'FinancialAccountRepositoryPort',
);
