import { Controller, Get, Query } from '@nestjs/common';
import { GetDashboardSummaryUsecase } from '../../application/usecases/get-dashboard-summary.usecase.js';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardSummaryUsecase: GetDashboardSummaryUsecase,
  ) {}

  @Get('summary')
  getSummary(@Query('month') month?: string) {
    return this.getDashboardSummaryUsecase.execute(month);
  }
}
