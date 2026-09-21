import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';
import { TransactionEntity } from '../../../transactions/domain/entities/transaction.entity.js';
import { TransactionCategorizationService } from '../services/transaction-categorization.service.js';

export type RecategorizeTransactionsResult = {
  processed: number;
  updated: number;
  aiEnabled: boolean;
};

@Injectable()
export class RecategorizeTransactionsUsecase {
  private readonly logger = new Logger(RecategorizeTransactionsUsecase.name);

  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
    private readonly transactionCategorizationService: TransactionCategorizationService,
  ) {}

  async execute(): Promise<RecategorizeTransactionsResult> {
    const transactions = await this.transactionRepository.findAll();
    let updated = 0;

    for (const transaction of transactions) {
      const nextCategory =
        await this.transactionCategorizationService.recategorizeFromDescription(
          transaction.description,
          transaction.amount,
          transaction.category,
        );

      if (nextCategory === transaction.category) {
        continue;
      }

      await this.transactionRepository.update(
        transaction.id,
        new TransactionEntity(
          transaction.id,
          transaction.description,
          nextCategory,
          transaction.account,
          transaction.date,
          transaction.amount,
          transaction.pluggyTransactionId,
        ),
      );

      updated += 1;
    }

    this.logger.log(
      `Recategorização concluída: ${updated}/${transactions.length} transações atualizadas`,
    );

    return {
      processed: transactions.length,
      updated,
      aiEnabled: Boolean(process.env.OPENAI_API_KEY),
    };
  }
}
