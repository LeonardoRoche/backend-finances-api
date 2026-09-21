import { Inject, Injectable } from '@nestjs/common';
import { ConnectionEntity } from '../../domain/entities/connection.entity.js';
import { connectionRepositoryPort } from '../../domain/ports/connection.repository.port.js';
import type { ConnectionRepositoryPort } from '../../domain/ports/connection.repository.port.js';

@Injectable()
export class ListConnectionsUsecase {
  constructor(
    @Inject(connectionRepositoryPort)
    private readonly connectionRepository: ConnectionRepositoryPort,
  ) {}

  async execute(): Promise<ConnectionEntity[]> {
    return this.connectionRepository.findAll();
  }
}
