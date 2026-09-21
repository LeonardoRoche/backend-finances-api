import { Inject, Injectable } from '@nestjs/common';
import { BudgetEntity } from '../../domain/entities/budget.entity.js';
import { budgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import type { BudgetRepositoryPort } from '../../domain/ports/budget.repository.port.js';
import type { CreateBudgetDto } from '../../dto/create-budget.dto.js';

@Injectable()
export class CreateBudgetUsecase {
  constructor(
    @Inject(budgetRepositoryPort)
    private readonly budgetRepository: BudgetRepositoryPort,
  ) {}

  async execute(input: CreateBudgetDto): Promise<BudgetEntity> {
    const saved = await this.budgetRepository.save({
      id: '',
      category: input.category,
      limit: input.limit,
      period: input.period,
      alertThreshold: input.alertThreshold,
    });

    return new BudgetEntity(
      saved.id,
      saved.category,
      saved.limit,
      saved.period,
      saved.alertThreshold,
      0,
    );
  }
}
