import { Injectable } from '@nestjs/common';
import { ConnectionRepositoryPort } from '../../../modules/connections/domain/ports/connection.repository.port.js';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionOrmEntity } from '../entities/connection.orm-entity.js';
import { Repository } from 'typeorm';
import { ConnectionEntity } from '../../../modules/connections/domain/entities/connection.entity.js';

@Injectable()
export class TypeormConnectionRepository implements ConnectionRepositoryPort {
  constructor(
    @InjectRepository(ConnectionOrmEntity)
    private readonly repository: Repository<ConnectionOrmEntity>,
  ) {}

  async save(connection: ConnectionEntity): Promise<void> {
    const ormEntity = this.toOrm(connection);
    await this.repository.save(ormEntity);
  }

  async findByPluggyItemId(
    pluggyItemId: string,
  ): Promise<ConnectionEntity | null> {
    const ormEntity = await this.repository.findOne({
      where: { pluggyItemId },
    });
    return ormEntity ? this.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<ConnectionEntity[]> {
    const ormEntities = await this.repository.find();
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
  }

  async updateStatusByPluggyItemId(
    pluggyItemId: string,
    status: string,
  ): Promise<void> {
    await this.repository.update({ pluggyItemId }, { status });
  }

  async deleteByPluggyItemId(pluggyItemId: string): Promise<void> {
    await this.repository.delete({ pluggyItemId });
  }

  private toDomain(ormEntity: ConnectionOrmEntity): ConnectionEntity {
    return new ConnectionEntity(
      ormEntity.id,
      ormEntity.pluggyItemId,
      ormEntity.status,
      ormEntity.connectorName,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  private toOrm(domain: ConnectionEntity): ConnectionOrmEntity {
    const orm = new ConnectionOrmEntity();
    if (domain.id) orm.id = domain.id;
    orm.pluggyItemId = domain.pluggyItemId;
    orm.status = domain.status;
    orm.connectorName = domain.connectorName;
    return orm;
  }
}
