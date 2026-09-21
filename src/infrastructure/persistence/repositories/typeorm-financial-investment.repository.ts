import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialInvestmentOrmEntity } from '../entities/financial-investment.orm-entity.js';
import type {
  FinancialInvestmentRecord,
  FinancialInvestmentRepositoryPort,
  UpsertFinancialInvestmentInput,
} from '../../../modules/accounts/domain/ports/financial-investment.repository.port.js';

@Injectable()
export class TypeormFinancialInvestmentRepository
  implements FinancialInvestmentRepositoryPort
{
  constructor(
    @InjectRepository(FinancialInvestmentOrmEntity)
    private readonly repository: Repository<FinancialInvestmentOrmEntity>,
  ) {}

  async findAll(): Promise<FinancialInvestmentRecord[]> {
    const rows = await this.repository.find({ order: { name: 'ASC' } });
    return rows.map((row) => this.toDomain(row));
  }

  async replaceForItem(
    pluggyItemId: string,
    investments: UpsertFinancialInvestmentInput[],
  ): Promise<void> {
    await this.repository.delete({ pluggyItemId });

    if (investments.length === 0) {
      return;
    }

    await this.repository.save(
      investments.map((investment) => this.toOrm(investment)),
    );
  }

  private toDomain(
    orm: FinancialInvestmentOrmEntity,
  ): FinancialInvestmentRecord {
    return {
      id: orm.id,
      pluggyInvestmentId: orm.pluggyInvestmentId,
      pluggyItemId: orm.pluggyItemId,
      name: orm.name,
      balance: Number(orm.balance),
      type: orm.type,
      subtype: orm.subtype,
      status: orm.status,
    };
  }

  private toOrm(
    investment: UpsertFinancialInvestmentInput,
  ): FinancialInvestmentOrmEntity {
    const orm = new FinancialInvestmentOrmEntity();
    if (investment.id) orm.id = investment.id;
    orm.pluggyInvestmentId = investment.pluggyInvestmentId;
    orm.pluggyItemId = investment.pluggyItemId;
    orm.name = investment.name;
    orm.balance = investment.balance.toString();
    orm.type = investment.type;
    orm.subtype = investment.subtype;
    orm.status = investment.status;
    return orm;
  }
}
