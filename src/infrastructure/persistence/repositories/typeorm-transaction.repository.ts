import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity.js';
import { TransactionEntity } from '../../../modules/transactions/domain/entities/transaction.entity.js';
import type {
  ListTransactionsFilters,
  TransactionMetrics,
  TransactionRepositoryPort,
} from '../../../modules/transactions/domain/ports/transaction.repository.port.js';
import {
  buildOutgoingTransferDescriptionMatch,
  buildTransferDescriptionExclusions,
  PEER_TRANSFER_EXCLUSION_PATTERNS,
} from '../../../modules/pluggy/application/mappers/transfer-detection.js';

@Injectable()
export class TypeormTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async save(transaction: TransactionEntity): Promise<TransactionEntity> {
    const saved = await this.repository.save(this.toOrm(transaction));
    return this.toDomain(saved);
  }

  async upsertByPluggyId(
    transaction: TransactionEntity,
  ): Promise<{ transaction: TransactionEntity; created: boolean }> {
    if (!transaction.pluggyTransactionId) {
      const saved = await this.save(transaction);
      return { transaction: saved, created: true };
    }

    const existing = await this.repository.findOne({
      where: { pluggyTransactionId: transaction.pluggyTransactionId },
    });

    if (!existing) {
      const saved = await this.repository.save(this.toOrm(transaction));
      return { transaction: this.toDomain(saved), created: true };
    }

    existing.description = transaction.description;
    existing.category = transaction.category;
    existing.account = transaction.account;
    existing.date = transaction.date;
    existing.amount = transaction.amount.toString();

    const saved = await this.repository.save(existing);
    return { transaction: this.toDomain(saved), created: false };
  }

  async findById(id: string): Promise<TransactionEntity | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async update(
    id: string,
    transaction: TransactionEntity,
  ): Promise<TransactionEntity> {
    const existing = await this.repository.findOne({ where: { id } });

    if (!existing) {
      throw new Error('Transaction not found');
    }

    existing.description = transaction.description;
    existing.category = transaction.category;
    existing.account = transaction.account;
    existing.date = transaction.date;
    existing.amount = transaction.amount.toString();

    const saved = await this.repository.save(existing);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findAll(filters: ListTransactionsFilters = {}): Promise<TransactionEntity[]> {
    const query = this.repository.createQueryBuilder('transaction');

    if (filters.search) {
      query.andWhere('transaction.description ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.category && filters.category !== 'Todas as categorias') {
      query.andWhere('transaction.category = :category', {
        category: filters.category,
      });
    }

    if (filters.type === 'Entradas') {
      query.andWhere('transaction.amount > 0');
      query.andWhere('transaction.category = :incomeCategory', {
        incomeCategory: 'Renda',
      });
    }

    if (filters.type === 'Saídas') {
      const transferExclusions = buildTransferDescriptionExclusions();
      query.andWhere('transaction.amount < 0');
      query.andWhere('transaction.category != :transferCategory', {
        transferCategory: 'Transferências',
      });
      query.andWhere(transferExclusions.sql, transferExclusions.params);
    }

    if (filters.type === 'Transferências') {
      const outgoingMatch = buildOutgoingTransferDescriptionMatch();
      query.andWhere(
        new Brackets((qb) => {
          qb.where('transaction.category = :transferCategory', {
            transferCategory: 'Transferências',
          }).orWhere(outgoingMatch.sql, outgoingMatch.params);
        }),
      );
    }

    if (filters.month) {
      query.andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: filters.month,
      });
    }

    query.orderBy('transaction.date', 'DESC');

    if (filters.limit) {
      query.take(filters.limit);
    }

    const rows = await query.getMany();
    return rows.map((row) => this.toDomain(row));
  }

  async getTransactionMetrics(month?: string): Promise<TransactionMetrics> {
    const targetMonth = month ?? this.currentMonth();

    const salaryResult = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(transaction.amount), 0)', 'total')
      .where('transaction.amount > 0')
      .andWhere('transaction.category = :incomeCategory', {
        incomeCategory: 'Renda',
      })
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .getRawOne<{ total: string }>();

    const transferExclusions = buildTransferDescriptionExclusions();
    const expensesQuery = this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.amount < 0')
      .andWhere('transaction.category != :transferCategory', {
        transferCategory: 'Transferências',
      })
      .andWhere(transferExclusions.sql, transferExclusions.params)
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      });

    const expensesResult = await expensesQuery.getRawOne<{ total: string }>();
    const monthlyOutgoingTransfers = await this.sumOutgoingTransfers(targetMonth);
    const monthlyPeerTransfers = await this.sumPeerOutgoingTransfers(targetMonth);

    return {
      monthlySalary: Number(salaryResult?.total ?? 0),
      monthlyExpenses: Number(expensesResult?.total ?? 0),
      monthlyOutgoingTransfers,
      monthlyPeerTransfers,
    };
  }

  async sumOutgoingTransfers(month?: string): Promise<number> {
    const targetMonth = month ?? this.currentMonth();
    const outgoingMatch = buildOutgoingTransferDescriptionMatch();

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.amount < 0')
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('transaction.category = :transferCategory', {
            transferCategory: 'Transferências',
          }).orWhere(outgoingMatch.sql, outgoingMatch.params);
        }),
      )
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async sumPeerOutgoingTransfers(month?: string): Promise<number> {
    const targetMonth = month ?? this.currentMonth();
    const outgoingMatch = buildOutgoingTransferDescriptionMatch(
      'transaction.description',
      PEER_TRANSFER_EXCLUSION_PATTERNS,
    );
    const faturaExclusions = buildTransferDescriptionExclusions(
      'transaction.description',
      [
        'PAGAMENTO DE FATURA',
        'PAGAMENTO FATURA',
        'PAGAMENTO DE FAT',
        'PAGAMENTO RECEBIDO',
      ],
    );

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.amount < 0')
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .andWhere(faturaExclusions.sql, faturaExclusions.params)
      .andWhere(
        new Brackets((qb) => {
          qb.where('transaction.category = :transferCategory', {
            transferCategory: 'Transferências',
          }).orWhere(outgoingMatch.sql, outgoingMatch.params);
        }),
      )
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async sumCreditCardBillPayments(month?: string): Promise<number> {
    const targetMonth = month ?? this.currentMonth();
    const faturaMatch = buildOutgoingTransferDescriptionMatch(
      'transaction.description',
      ['PAGAMENTO DE FATURA', 'PAGAMENTO FATURA', 'PAGAMENTO DE FAT'],
    );

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.amount < 0')
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .andWhere(faturaMatch.sql, faturaMatch.params)
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async sumExpensesForAccounts(
    accountNames: string[],
    month?: string,
  ): Promise<number> {
    if (accountNames.length === 0) {
      return 0;
    }

    const targetMonth = month ?? this.currentMonth();

    const transferExclusions = buildTransferDescriptionExclusions();
    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.amount < 0')
      .andWhere('transaction.category != :transferCategory', {
        transferCategory: 'Transferências',
      })
      .andWhere(transferExclusions.sql, transferExclusions.params)
      .andWhere('transaction.account IN (:...accountNames)', { accountNames })
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async sumExpensesByCategory(category: string, month?: string): Promise<number> {
    const targetMonth = month ?? this.currentMonth();
    const transferExclusions = buildTransferDescriptionExclusions();

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('COALESCE(SUM(ABS(transaction.amount)), 0)', 'total')
      .where('transaction.category = :category', { category })
      .andWhere('transaction.amount < 0')
      .andWhere('transaction.category != :transferCategory', {
        transferCategory: 'Transferências',
      })
      .andWhere(transferExclusions.sql, transferExclusions.params)
      .andWhere("TO_CHAR(transaction.date, 'YYYY-MM') = :month", {
        month: targetMonth,
      })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  private currentMonth(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }

  private toDomain(orm: TransactionOrmEntity): TransactionEntity {
    return new TransactionEntity(
      orm.id,
      orm.description,
      orm.category,
      orm.account,
      orm.date,
      Number(orm.amount),
      orm.pluggyTransactionId,
    );
  }

  private toOrm(domain: TransactionEntity): TransactionOrmEntity {
    const orm = new TransactionOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.description = domain.description;
    orm.category = domain.category;
    orm.account = domain.account;
    orm.date = domain.date;
    orm.amount = domain.amount.toString();
    orm.pluggyTransactionId = domain.pluggyTransactionId;
    return orm;
  }
}
