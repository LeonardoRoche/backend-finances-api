import { ConnectionEntity } from '../entities/connection.entity.js';

export interface ConnectionRepositoryPort {
  save(connection: ConnectionEntity): Promise<void>;
  findByPluggyItemId(pluggyItemId: string): Promise<ConnectionEntity | null>;
  findAll(): Promise<ConnectionEntity[]>;
  updateStatusByPluggyItemId(
    pluggyItemId: string,
    status: string,
  ): Promise<void>;
  deleteByPluggyItemId(pluggyItemId: string): Promise<void>;
}

export const connectionRepositoryPort = Symbol('ConnectionRepositoryPort');
