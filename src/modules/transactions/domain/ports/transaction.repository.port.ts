import type { TransactionEntity } from '../entities/transaction.entity.js';

export type ListTransactionsFilters = {
  search?: string;
  type?: string;
  category?: string;
  month?: string;
  limit?: number;
};

export type TransactionMetrics = {
  monthlySalary: number;
  monthlyExpenses: number;
  monthlyOutgoingTransfers: number;
  monthlyPeerTransfers: number;
};

export type UpsertPluggyTransactionResult = {
  transaction: TransactionEntity;
  created: boolean;
};

export interface TransactionRepositoryPort {
  save(transaction: TransactionEntity): Promise<TransactionEntity>;
  upsertByPluggyId(
    transaction: TransactionEntity,
  ): Promise<UpsertPluggyTransactionResult>;
  findById(id: string): Promise<TransactionEntity | null>;
  update(id: string, transaction: TransactionEntity): Promise<TransactionEntity>;
  delete(id: string): Promise<void>;
  findAll(filters?: ListTransactionsFilters): Promise<TransactionEntity[]>;
  getTransactionMetrics(month?: string): Promise<TransactionMetrics>;
  sumOutgoingTransfers(month?: string): Promise<number>;
  sumPeerOutgoingTransfers(month?: string): Promise<number>;
  sumCreditCardBillPayments(month?: string): Promise<number>;
  sumExpensesForAccounts(accountNames: string[], month?: string): Promise<number>;
  sumExpensesByCategory(category: string, month?: string): Promise<number>;
}

export const transactionRepositoryPort = Symbol('TransactionRepositoryPort');
