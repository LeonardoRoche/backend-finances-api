import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConnectionRepository } from '../../infrastructure/persistence/repositories/typeorm-connection.repository.js';
import { ConnectionOrmEntity } from '../../infrastructure/persistence/entities/connection.orm-entity.js';
import { connectionRepositoryPort } from './domain/ports/connection.repository.port.js';
import { CreateConnectionUsecase } from './application/usecases/create-connection.usecase.js';
import { ListConnectionsUsecase } from './application/usecases/list-connections.usecase.js';
import { ConnectionsController } from './adapters/http/connections.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectionOrmEntity])],
  controllers: [ConnectionsController],
  providers: [
    CreateConnectionUsecase,
    ListConnectionsUsecase,
    {
      provide: connectionRepositoryPort,
      useClass: TypeormConnectionRepository,
    },
  ],
  exports: [connectionRepositoryPort],
})
export class ConnectionsModule {}
