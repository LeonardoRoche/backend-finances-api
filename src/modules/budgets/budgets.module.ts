import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormBudgetRepository } from '../../infrastructure/persistence/repositories/typeorm-budget.repository.js';
import { BudgetOrmEntity } from '../../infrastructure/persistence/entities/budget.orm-entity.js';
import { budgetRepositoryPort } from './domain/ports/budget.repository.port.js';
import { BudgetsController } from './adapters/http/budgets.controller.js';
import { CreateBudgetUsecase } from './application/usecases/create-budget.usecase.js';
import { ListBudgetsUsecase } from './application/usecases/list-budgets.usecase.js';
import { UpdateBudgetUsecase } from './application/usecases/update-budget.usecase.js';
import { DeleteBudgetUsecase } from './application/usecases/delete-budget.usecase.js';
import { TransactionsModule } from '../transactions/transactions.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetOrmEntity]), TransactionsModule],
  controllers: [BudgetsController],
  providers: [
    CreateBudgetUsecase,
    ListBudgetsUsecase,
    UpdateBudgetUsecase,
    DeleteBudgetUsecase,
    {
      provide: budgetRepositoryPort,
      useClass: TypeormBudgetRepository,
    },
  ],
})
export class BudgetsModule {}
