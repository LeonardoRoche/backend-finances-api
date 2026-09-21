import { Inject, Injectable } from '@nestjs/common';
import { BudgetEntity } from '../../domain/entities/budget.entity.js';
import { budgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';
import type { UpdateBudgetDto } from '../../dto/update-budget.dto.js';

@Injectable()
export class UpdateBudgetUsecase {
  constructor(
    @Inject(budgetRepositoryPort)
    private readonly budgetRepository: BudgetRepositoryPort,
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateBudgetDto): Promise<BudgetEntity> {
    const updated = await this.budgetRepository.update(id, input);
    const spent = await this.transactionRepository.sumExpensesByCategory(
      updated.category,
    );

    return new BudgetEntity(
      updated.id,
      updated.category,
      updated.limit,
      updated.period,
      updated.alertThreshold,
      spent,
    );
  }
}
