import { TransactionEntity } from '../../../transactions/domain/entities/transaction.entity.js';
import type { PluggyTransaction } from '../../domain/ports/pluggy-api.gateway.port.js';
import {
  APP_CATEGORIES,
  resolveAppCategory,
  type AppCategory,
} from './smart-transaction-categorizer.js';

export { APP_CATEGORIES, type AppCategory };

export function mapPluggyCategory(
  category: string | undefined,
  amount: number,
  categoryId?: string,
  description = '',
  operationType?: string | null,
  merchantName?: string | null,
): AppCategory {
  return resolveAppCategory({
    category,
    categoryId,
    description,
    amount,
    operationType,
    merchantName,
  });
}

export function normalizePluggyAmount(pluggyTransaction: {
  amount: number;
  type?: string;
}): number {
  if (pluggyTransaction.type === 'CREDIT') {
    return Math.abs(pluggyTransaction.amount);
  }

  if (pluggyTransaction.type === 'DEBIT') {
    return -Math.abs(pluggyTransaction.amount);
  }

  return pluggyTransaction.amount;
}

export function toTransactionEntity(
  pluggyTransaction: PluggyTransaction,
  accountName: string,
): TransactionEntity {
  const amount = normalizePluggyAmount(pluggyTransaction);

  return new TransactionEntity(
    '',
    pluggyTransaction.description,
    mapPluggyCategory(
      pluggyTransaction.category,
      amount,
      pluggyTransaction.categoryId,
      pluggyTransaction.description,
      pluggyTransaction.operationType,
      pluggyTransaction.merchant?.name,
    ),
    accountName,
    pluggyTransaction.date.slice(0, 10),
    amount,
    pluggyTransaction.id,
  );
}
