import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetOrmEntity } from './entities/budget.orm-entity.js';
import { ConnectionOrmEntity } from './entities/connection.orm-entity.js';
import { FinancialAccountOrmEntity } from './entities/financial-account.orm-entity.js';
import { TransactionOrmEntity } from './entities/transaction.orm-entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: parseInt(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      ConnectionOrmEntity,
      TransactionOrmEntity,
      BudgetOrmEntity,
      FinancialAccountOrmEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DataBaseModule {}
