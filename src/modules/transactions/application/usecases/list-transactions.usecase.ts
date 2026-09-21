import { Inject, Injectable } from '@nestjs/common';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import {
  transactionRepositoryPort,
  type ListTransactionsFilters,
  type TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port.js';

@Injectable()
export class ListTransactionsUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(filters: ListTransactionsFilters = {}): Promise<TransactionEntity[]> {
    return this.transactionRepository.findAll(filters);
  }
}
