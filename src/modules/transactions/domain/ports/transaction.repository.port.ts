import type { TransactionEntity } from '../entities/transaction.entity.js';

export type ListTransactionsFilters = {
  search?: string;
  type?: string;
  category?: string;
  month?: string;
  page?: number;
  pageSize?: number;
  /** @deprecated use pageSize */
  limit?: number;
};

export type PaginatedTransactionsResult = {
  data: TransactionEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  findAll(): Promise<TransactionEntity[]>;
  findPaginated(
    filters?: ListTransactionsFilters,
  ): Promise<PaginatedTransactionsResult>;
  getTransactionMetrics(month?: string): Promise<TransactionMetrics>;
  sumOutgoingTransfers(month?: string): Promise<number>;
  sumPeerOutgoingTransfers(month?: string): Promise<number>;
  sumCreditCardBillPayments(month?: string): Promise<number>;
  sumExpensesForAccounts(accountNames: string[], month?: string): Promise<number>;
  sumExpensesByCategory(category: string, month?: string): Promise<number>;
}

export const transactionRepositoryPort = Symbol('TransactionRepositoryPort');
