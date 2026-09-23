import { Inject, Injectable } from '@nestjs/common';
import {
  transactionRepositoryPort,
  type ListTransactionsFilters,
  type PaginatedTransactionsResult,
  type TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port.js';

@Injectable()
export class ListTransactionsUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    filters: ListTransactionsFilters = {},
  ): Promise<PaginatedTransactionsResult> {
    return this.transactionRepository.findPaginated(filters);
  }
}
