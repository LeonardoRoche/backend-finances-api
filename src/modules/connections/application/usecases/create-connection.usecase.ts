import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConnectionEntity } from '../../domain/entities/connection.entity.js';
import { connectionRepositoryPort } from '../../domain/ports/connection.repository.port.js';
import type { ConnectionRepositoryPort } from '../../domain/ports/connection.repository.port.js';

export type CreateConnectionUsecaseInput = {
  pluggyItemId: string;
  status: string;
  connectorName: string;
};

@Injectable()
export class CreateConnectionUsecase {
  constructor(
    @Inject(connectionRepositoryPort)
    private readonly connectionRepository: ConnectionRepositoryPort,
  ) {}

  async execute(input: CreateConnectionUsecaseInput): Promise<ConnectionEntity> {
    const existing = await this.connectionRepository.findByPluggyItemId(
      input.pluggyItemId,
    );

    if (existing) {
      throw new ConflictException('Connection já existe para este item Pluggy');
    }
    const connection = new ConnectionEntity(
      '',
      input.pluggyItemId,
      input.status,
      input.connectorName,
      new Date(),
      new Date(),
    );

    await this.connectionRepository.save(connection);
    const saved = await this.connectionRepository.findByPluggyItemId(
      input.pluggyItemId,
    );

    if (!saved) {
      throw new InternalServerErrorException(
        'Falha ao recuperar connection após salvar',
      );
    }

    return saved;
  }
}
