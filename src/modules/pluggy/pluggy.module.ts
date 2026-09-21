import { Module } from '@nestjs/common';
import { PluggyController } from './adapters/http/pluggy.controller.js';
import { CreateConnectTokenUsecase } from './application/usecases/create-connect-token.usecase.js';
import { HandlePluggyWebhookUsecase } from './application/usecases/handle-pluggy-webhook.usecase.js';
import { SyncPluggyDataUsecase } from './application/usecases/sync-pluggy-data.usecase.js';
import { RecategorizeTransactionsUsecase } from './application/usecases/recategorize-transactions.usecase.js';
import { TransactionCategorizationService } from './application/services/transaction-categorization.service.js';
import { OpenAiCategorizerService } from './infrastructure/ai/openai-categorizer.service.js';
import { PluggyAuthGatewayAdapter } from '../../infrastructure/pluggy/pluggy-auth.gateway.js';
import { PluggyApiGatewayAdapter } from '../../infrastructure/pluggy/pluggy-api.gateway.js';
import { PLUGGY_AUTH_GATEWAY_PORT } from './domain/ports/pluggy-auth.gateway.port.js';
import { PLUGGY_API_GATEWAY_PORT } from './domain/ports/pluggy-api.gateway.port.js';
import { ConnectionsModule } from '../connections/connections.module.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { AccountsModule } from '../accounts/accounts.module.js';

@Module({
  imports: [ConnectionsModule, TransactionsModule, AccountsModule],
  controllers: [PluggyController],
  providers: [
    CreateConnectTokenUsecase,
    HandlePluggyWebhookUsecase,
    SyncPluggyDataUsecase,
    RecategorizeTransactionsUsecase,
    TransactionCategorizationService,
    OpenAiCategorizerService,
    PluggyAuthGatewayAdapter,
    PluggyApiGatewayAdapter,
    {
      provide: PLUGGY_AUTH_GATEWAY_PORT,
      useExisting: PluggyAuthGatewayAdapter,
    },
    {
      provide: PLUGGY_API_GATEWAY_PORT,
      useExisting: PluggyApiGatewayAdapter,
    },
  ],
})
export class PluggyModule {}
