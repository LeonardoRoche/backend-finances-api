import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialAccountOrmEntity } from '../../infrastructure/persistence/entities/financial-account.orm-entity.js';
import { TypeormFinancialAccountRepository } from '../../infrastructure/persistence/repositories/typeorm-financial-account.repository.js';
import { financialAccountRepositoryPort } from './domain/ports/financial-account.repository.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialAccountOrmEntity])],
  providers: [
    TypeormFinancialAccountRepository,
    {
      provide: financialAccountRepositoryPort,
      useExisting: TypeormFinancialAccountRepository,
    },
  ],
  exports: [financialAccountRepositoryPort],
})
export class AccountsModule {}
