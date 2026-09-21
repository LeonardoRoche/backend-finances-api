import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTransactionUsecase } from '../../application/usecases/create-transaction.usecase.js';
import { DeleteTransactionUsecase } from '../../application/usecases/delete-transaction.usecase.js';
import { ListTransactionsUsecase } from '../../application/usecases/list-transactions.usecase.js';
import { UpdateTransactionUsecase } from '../../application/usecases/update-transaction.usecase.js';
import { CreateTransactionDto } from '../../dto/create-transaction.dto.js';
import { ListTransactionsQueryDto } from '../../dto/list-transactions.query.dto.js';
import { UpdateTransactionDto } from '../../dto/update-transaction.dto.js';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUsecase: CreateTransactionUsecase,
    private readonly listTransactionsUsecase: ListTransactionsUsecase,
    private readonly updateTransactionUsecase: UpdateTransactionUsecase,
    private readonly deleteTransactionUsecase: DeleteTransactionUsecase,
  ) {}

  @Get()
  list(@Query() query: ListTransactionsQueryDto) {
    return this.listTransactionsUsecase.execute(query);
  }

  @Post()
  create(@Body() body: CreateTransactionDto) {
    return this.createTransactionUsecase.execute(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTransactionDto) {
    return this.updateTransactionUsecase.execute(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.deleteTransactionUsecase.execute(id);
  }
}
