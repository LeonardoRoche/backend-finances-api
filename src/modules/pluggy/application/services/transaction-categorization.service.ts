import { Injectable } from '@nestjs/common';
import { TransactionEntity } from '../../../transactions/domain/entities/transaction.entity.js';
import type { PluggyTransaction } from '../../domain/ports/pluggy-api.gateway.port.js';
import { normalizePluggyAmount } from '../mappers/pluggy-transaction.mapper.js';
import {
  resolveAppCategory,
  shouldValidateWithAi,
  type AppCategory,
  type CategorizationInput,
} from '../mappers/smart-transaction-categorizer.js';
import { OpenAiCategorizerService } from '../../infrastructure/ai/openai-categorizer.service.js';

@Injectable()
export class TransactionCategorizationService {
  constructor(private readonly openAiCategorizer: OpenAiCategorizerService) {}

  private toInput(
    pluggyTransaction: PluggyTransaction,
    amount: number,
  ): CategorizationInput {
    return {
      category: pluggyTransaction.category,
      categoryId: pluggyTransaction.categoryId,
      description: pluggyTransaction.description,
      amount,
      operationType: pluggyTransaction.operationType,
      merchantName: pluggyTransaction.merchant?.name,
    };
  }

  async resolveCategory(input: CategorizationInput): Promise<AppCategory> {
    const ruleCategory = resolveAppCategory(input);

    if (
      !this.openAiCategorizer.isEnabled() ||
      !shouldValidateWithAi(ruleCategory, input)
    ) {
      return ruleCategory;
    }

    return this.openAiCategorizer.categorizeOne(input, ruleCategory);
  }

  async buildTransactionEntity(
    pluggyTransaction: PluggyTransaction,
    accountName: string,
  ): Promise<TransactionEntity> {
    const amount = normalizePluggyAmount(pluggyTransaction);
    const input = this.toInput(pluggyTransaction, amount);
    const category = await this.resolveCategory(input);

    return new TransactionEntity(
      '',
      pluggyTransaction.description,
      category,
      accountName,
      pluggyTransaction.date.slice(0, 10),
      amount,
      pluggyTransaction.id,
    );
  }

  async buildTransactionEntitiesBatch(
    items: Array<{ pluggyTransaction: PluggyTransaction; accountName: string }>,
  ): Promise<TransactionEntity[]> {
    const prepared = items.map(({ pluggyTransaction, accountName }) => {
      const amount = normalizePluggyAmount(pluggyTransaction);
      const input = this.toInput(pluggyTransaction, amount);
      const ruleCategory = resolveAppCategory(input);

      return {
        pluggyTransaction,
        accountName,
        amount,
        input,
        ruleCategory,
      };
    });

    const aiBatch: Array<{ input: CategorizationInput; ruleCategory: AppCategory }> =
      [];
    const aiPreparedIndexes: number[] = [];

    prepared.forEach((item, index) => {
      if (
        this.openAiCategorizer.isEnabled() &&
        shouldValidateWithAi(item.ruleCategory, item.input)
      ) {
        aiPreparedIndexes.push(index);
        aiBatch.push({
          input: item.input,
          ruleCategory: item.ruleCategory,
        });
      }
    });

    const aiCategories = await this.openAiCategorizer.categorizeBatch(aiBatch);

    return prepared.map((item, index) => {
      const aiIndex = aiPreparedIndexes.indexOf(index);
      const category =
        aiIndex >= 0 ? (aiCategories[aiIndex] ?? item.ruleCategory) : item.ruleCategory;

      return new TransactionEntity(
        '',
        item.pluggyTransaction.description,
        category,
        item.accountName,
        item.pluggyTransaction.date.slice(0, 10),
        item.amount,
        item.pluggyTransaction.id,
      );
    });
  }

  async recategorizeFromDescription(
    description: string,
    amount: number,
    currentCategory: string,
  ): Promise<AppCategory> {
    const input: CategorizationInput = {
      description,
      amount,
      category: currentCategory,
    };

    return this.resolveCategory(input);
  }
}
