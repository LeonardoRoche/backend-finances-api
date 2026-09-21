import { Inject, Injectable } from '@nestjs/common';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import { transactionRepositoryPort } from '../../domain/ports/transaction.repository.port.js';
import type { TransactionRepositoryPort } from '../../domain/ports/transaction.repository.port.js';
import type { CreateTransactionDto } from '../../dto/create-transaction.dto.js';

@Injectable()
export class CreateTransactionUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(input: CreateTransactionDto): Promise<TransactionEntity> {
    const transaction = new TransactionEntity(
      '',
      input.description,
      input.category,
      input.account,
      input.date,
      input.amount,
    );

    return this.transactionRepository.save(transaction);
  }
}
