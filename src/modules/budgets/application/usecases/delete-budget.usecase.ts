import { Inject, Injectable } from '@nestjs/common';
import { budgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';

@Injectable()
export class DeleteBudgetUsecase {
  constructor(
    @Inject(budgetRepositoryPort)
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    await this.budgetRepository.delete(id);
  }
}
