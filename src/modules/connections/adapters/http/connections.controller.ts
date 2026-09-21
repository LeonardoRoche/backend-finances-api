import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateConnectionDto } from '../../../dto/connection.dto.js';
import { CreateConnectionUsecase } from '../../application/usecases/create-connection.usecase.js';
import { ListConnectionsUsecase } from '../../application/usecases/list-connections.usecase.js';

@Controller('connections')
export class ConnectionsController {
  constructor(
    private readonly createConnectionUsecase: CreateConnectionUsecase,
    private readonly listConnectionsUsecase: ListConnectionsUsecase,
  ) {}

  @Post()
  createConnection(@Body() createConnectionDto: CreateConnectionDto) {
    return this.createConnectionUsecase.execute(createConnectionDto);
  }

  @Get()
  list() {
    return this.listConnectionsUsecase.execute();
  }
}
