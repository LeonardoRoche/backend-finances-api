import { Inject, Injectable } from '@nestjs/common';
import { BudgetEntity } from '../../domain/entities/budget.entity.js';
import { budgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';

@Injectable()
export class ListBudgetsUsecase {
  constructor(
    @Inject(budgetRepositoryPort)
    private readonly budgetRepository: BudgetRepositoryPort,
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(limit?: number, month?: string): Promise<BudgetEntity[]> {
    const budgets = await this.budgetRepository.findAll(limit);

    return Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.transactionRepository.sumExpensesByCategory(
          budget.category,
          month,
        );

        return new BudgetEntity(
          budget.id,
          budget.category,
          budget.limit,
          budget.period,
          budget.alertThreshold,
          spent,
        );
      }),
    );
  }
}
