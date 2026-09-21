import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialAccountOrmEntity } from '../entities/financial-account.orm-entity.js';
import { FinancialAccountEntity } from '../../../modules/accounts/domain/entities/financial-account.entity.js';
import type { FinancialAccountRepositoryPort } from '../../../modules/accounts/domain/ports/financial-account.repository.port.js';

@Injectable()
export class TypeormFinancialAccountRepository
  implements FinancialAccountRepositoryPort
{
  constructor(
    @InjectRepository(FinancialAccountOrmEntity)
    private readonly repository: Repository<FinancialAccountOrmEntity>,
  ) {}

  async upsertByPluggyAccountId(
    account: FinancialAccountEntity,
  ): Promise<FinancialAccountEntity> {
    const existing = await this.repository.findOne({
      where: { pluggyAccountId: account.pluggyAccountId },
    });

    if (existing) {
      existing.pluggyItemId = account.pluggyItemId;
      existing.name = account.name;
      existing.type = account.type;
      existing.subtype = account.subtype;
      existing.balance = account.balance.toString();
      existing.creditLimit = account.creditLimit?.toString() ?? null;
      existing.availableCreditLimit =
        account.availableCreditLimit?.toString() ?? null;
      existing.balanceDueDate = account.balanceDueDate;
      existing.brand = account.brand;

      const saved = await this.repository.save(existing);
      return this.toDomain(saved);
    }

    const orm = this.toOrm(account);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findAll(): Promise<FinancialAccountEntity[]> {
    const rows = await this.repository.find({ order: { name: 'ASC' } });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(orm: FinancialAccountOrmEntity): FinancialAccountEntity {
    return new FinancialAccountEntity(
      orm.id,
      orm.pluggyAccountId,
      orm.pluggyItemId,
      orm.name,
      orm.type,
      orm.subtype,
      Number(orm.balance),
      orm.creditLimit ? Number(orm.creditLimit) : null,
      orm.availableCreditLimit ? Number(orm.availableCreditLimit) : null,
      orm.balanceDueDate,
      orm.brand,
    );
  }

  private toOrm(domain: FinancialAccountEntity): FinancialAccountOrmEntity {
    const orm = new FinancialAccountOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.pluggyAccountId = domain.pluggyAccountId;
    orm.pluggyItemId = domain.pluggyItemId;
    orm.name = domain.name;
    orm.type = domain.type;
    orm.subtype = domain.subtype;
    orm.balance = domain.balance.toString();
    orm.creditLimit = domain.creditLimit?.toString() ?? null;
    orm.availableCreditLimit = domain.availableCreditLimit?.toString() ?? null;
    orm.balanceDueDate = domain.balanceDueDate;
    orm.brand = domain.brand;
    return orm;
  }
}
