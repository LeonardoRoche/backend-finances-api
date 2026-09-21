import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port.js';
import type { UpdateTransactionDto } from '../../dto/update-transaction.dto.js';

@Injectable()
export class UpdateTransactionUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    id: string,
    input: UpdateTransactionDto,
  ): Promise<TransactionEntity> {
    const existing = await this.transactionRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Transação não encontrada');
    }

    const updated = new TransactionEntity(
      existing.id,
      input.description ?? existing.description,
      input.category ?? existing.category,
      input.account ?? existing.account,
      input.date ?? existing.date,
      input.amount ?? existing.amount,
      existing.pluggyTransactionId,
    );

    return this.transactionRepository.update(id, updated);
  }
}
