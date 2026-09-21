import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialAccountOrmEntity } from '../../infrastructure/persistence/entities/financial-account.orm-entity.js';
import { FinancialInvestmentOrmEntity } from '../../infrastructure/persistence/entities/financial-investment.orm-entity.js';
import { TypeormFinancialAccountRepository } from '../../infrastructure/persistence/repositories/typeorm-financial-account.repository.js';
import { TypeormFinancialInvestmentRepository } from '../../infrastructure/persistence/repositories/typeorm-financial-investment.repository.js';
import { financialAccountRepositoryPort } from './domain/ports/financial-account.repository.port.js';
import { financialInvestmentRepositoryPort } from './domain/ports/financial-investment.repository.port.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FinancialAccountOrmEntity,
      FinancialInvestmentOrmEntity,
    ]),
  ],
  providers: [
    TypeormFinancialAccountRepository,
    TypeormFinancialInvestmentRepository,
    {
      provide: financialAccountRepositoryPort,
      useExisting: TypeormFinancialAccountRepository,
    },
    {
      provide: financialInvestmentRepositoryPort,
      useExisting: TypeormFinancialInvestmentRepository,
    },
  ],
  exports: [financialAccountRepositoryPort, financialInvestmentRepositoryPort],
})
export class AccountsModule {}
