import type { BudgetEntity } from '../entities/budget.entity.js';

export interface BudgetRepositoryPort {
  save(budget: Omit<BudgetEntity, 'spent'>): Promise<BudgetEntity>;
  findAll(limit?: number): Promise<Omit<BudgetEntity, 'spent'>[]>;
  findById(id: string): Promise<Omit<BudgetEntity, 'spent'> | null>;
  update(
    id: string,
    data: Partial<Pick<BudgetEntity, 'limit' | 'period' | 'alertThreshold'>>,
  ): Promise<Omit<BudgetEntity, 'spent'>>;
  delete(id: string): Promise<void>;
}

export const budgetRepositoryPort = Symbol('BudgetRepositoryPort');
