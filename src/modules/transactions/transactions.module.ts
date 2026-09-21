import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormTransactionRepository } from '../../infrastructure/persistence/repositories/typeorm-transaction.repository.js';
import { TransactionOrmEntity } from '../../infrastructure/persistence/entities/transaction.orm-entity.js';
import { transactionRepositoryPort } from './domain/ports/transaction.repository.port.js';
import { TransactionsController } from './adapters/http/transactions.controller.js';
import { CreateTransactionUsecase } from './application/usecases/create-transaction.usecase.js';
import { DeleteTransactionUsecase } from './application/usecases/delete-transaction.usecase.js';
import { ListTransactionsUsecase } from './application/usecases/list-transactions.usecase.js';
import { UpdateTransactionUsecase } from './application/usecases/update-transaction.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionOrmEntity])],
  controllers: [TransactionsController],
  providers: [
    CreateTransactionUsecase,
    ListTransactionsUsecase,
    UpdateTransactionUsecase,
    DeleteTransactionUsecase,
    {
      provide: transactionRepositoryPort,
      useClass: TypeormTransactionRepository,
    },
  ],
  exports: [transactionRepositoryPort],
})
export class TransactionsModule {}
