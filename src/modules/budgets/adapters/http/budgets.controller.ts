import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateBudgetUsecase } from '../../application/usecases/create-budget.usecase.js';
import { DeleteBudgetUsecase } from '../../application/usecases/delete-budget.usecase.js';
import { ListBudgetsUsecase } from '../../application/usecases/list-budgets.usecase.js';
import { UpdateBudgetUsecase } from '../../application/usecases/update-budget.usecase.js';
import { CreateBudgetDto } from '../../dto/create-budget.dto.js';
import { UpdateBudgetDto } from '../../dto/update-budget.dto.js';

@Controller('budgets')
export class BudgetsController {
  constructor(
    private readonly createBudgetUsecase: CreateBudgetUsecase,
    private readonly listBudgetsUsecase: ListBudgetsUsecase,
    private readonly updateBudgetUsecase: UpdateBudgetUsecase,
    private readonly deleteBudgetUsecase: DeleteBudgetUsecase,
  ) {}

  @Get()
  async list(@Query('limit') limit?: string, @Query('month') month?: string) {
    const budgets = await this.listBudgetsUsecase.execute(
      limit ? Number(limit) : undefined,
      month,
    );

    return budgets.map((budget) => ({
      id: budget.id,
      title: budget.category,
      amount: budget.spent,
      totalAmount: budget.limit,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    }));
  }

  @Post()
  async create(@Body() body: CreateBudgetDto) {
    const budget = await this.createBudgetUsecase.execute(body);

    return {
      id: budget.id,
      title: budget.category,
      amount: budget.spent,
      totalAmount: budget.limit,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBudgetDto) {
    const budget = await this.updateBudgetUsecase.execute(id, body);

    return {
      id: budget.id,
      title: budget.category,
      amount: budget.spent,
      totalAmount: budget.limit,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteBudgetUsecase.execute(id);
  }
}
