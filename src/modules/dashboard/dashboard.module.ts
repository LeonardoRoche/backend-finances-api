import { Module } from '@nestjs/common';
import { DashboardController } from './adapters/http/dashboard.controller.js';
import { GetDashboardSummaryUsecase } from './application/usecases/get-dashboard-summary.usecase.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { AccountsModule } from '../accounts/accounts.module.js';

@Module({
  imports: [TransactionsModule, AccountsModule],
  controllers: [DashboardController],
  providers: [GetDashboardSummaryUsecase],
})
export class DashboardModule {}
