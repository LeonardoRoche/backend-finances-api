import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DataBaseModule } from './infrastructure/persistence/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { PluggyModule } from './modules/pluggy/pluggy.module.js';
import { BudgetsModule } from './modules/budgets/budgets.module.js';
import { ConnectionsModule } from './modules/connections/connections.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PluggyModule,
    ConnectionsModule,
    TransactionsModule,
    BudgetsModule,
    DashboardModule,
    DataBaseModule,
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend-payment-api',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
