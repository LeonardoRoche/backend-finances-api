import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../domain/ports/transaction.repository.port.js';

@Injectable()
export class DeleteTransactionUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.transactionRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Transação não encontrada');
    }

    await this.transactionRepository.delete(id);
  }
}
