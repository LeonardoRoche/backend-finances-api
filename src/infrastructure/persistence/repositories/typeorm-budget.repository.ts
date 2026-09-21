import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetOrmEntity } from '../entities/budget.orm-entity.js';
import { BudgetEntity } from '../../../modules/budgets/domain/entities/budget.entity.js';
import type { BudgetRepositoryPort } from '../../../modules/budgets/domain/ports/budget.repository.port.js';

type BudgetWithoutSpent = Omit<BudgetEntity, 'spent'>;

@Injectable()
export class TypeormBudgetRepository implements BudgetRepositoryPort {
  constructor(
    @InjectRepository(BudgetOrmEntity)
    private readonly repository: Repository<BudgetOrmEntity>,
  ) {}

  async save(budget: BudgetWithoutSpent): Promise<BudgetEntity> {
    const saved = await this.repository.save(this.toOrm(budget));
    return this.toDomain(saved, 0);
  }

  async findAll(limit?: number): Promise<BudgetWithoutSpent[]> {
    const rows = await this.repository.find({
      order: { category: 'ASC' },
      take: limit,
    });

    return rows.map((row) => this.toDomainWithoutSpent(row));
  }

  async findById(id: string): Promise<BudgetWithoutSpent | null> {
    const row = await this.repository.findOne({ where: { id } });
    return row ? this.toDomainWithoutSpent(row) : null;
  }

  async update(
    id: string,
    data: Partial<Pick<BudgetEntity, 'limit' | 'period' | 'alertThreshold'>>,
  ): Promise<BudgetWithoutSpent> {
    const existing = await this.repository.findOne({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    if (data.limit !== undefined) existing.limit = data.limit.toString();
    if (data.period !== undefined) existing.period = data.period;
    if (data.alertThreshold !== undefined) {
      existing.alertThreshold = data.alertThreshold;
    }

    const saved = await this.repository.save(existing);
    return this.toDomainWithoutSpent(saved);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException('Orçamento não encontrado');
    }
  }

  private toDomainWithoutSpent(orm: BudgetOrmEntity): BudgetWithoutSpent {
    return {
      id: orm.id,
      category: orm.category,
      limit: Number(orm.limit),
      period: orm.period,
      alertThreshold: orm.alertThreshold,
    };
  }

  private toDomain(orm: BudgetOrmEntity, spent: number): BudgetEntity {
    return new BudgetEntity(
      orm.id,
      orm.category,
      Number(orm.limit),
      orm.period,
      orm.alertThreshold,
      spent,
    );
  }

  private toOrm(budget: BudgetWithoutSpent): BudgetOrmEntity {
    const orm = new BudgetOrmEntity();
    if (budget.id) orm.id = budget.id;
    orm.category = budget.category;
    orm.limit = budget.limit.toString();
    orm.period = budget.period;
    orm.alertThreshold = budget.alertThreshold;
    return orm;
  }
}
