import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateConnectTokenUsecase } from '../../application/usecases/create-connect-token.usecase.js';
import { HandlePluggyWebhookUsecase } from '../../application/usecases/handle-pluggy-webhook.usecase.js';
import { SyncPluggyDataUsecase } from '../../application/usecases/sync-pluggy-data.usecase.js';
import { RecategorizeTransactionsUsecase } from '../../application/usecases/recategorize-transactions.usecase.js';

@Controller('pluggy')
export class PluggyController {
  constructor(
    private readonly createConnectTokenUsecase: CreateConnectTokenUsecase,
    private readonly handlePluggyWebhookUsecase: HandlePluggyWebhookUsecase,
    private readonly syncPluggyDataUsecase: SyncPluggyDataUsecase,
    private readonly recategorizeTransactionsUsecase: RecategorizeTransactionsUsecase,
  ) {}

  @Post('connect-token')
  createConnectToken() {
    return this.createConnectTokenUsecase.execute();
  }

  @Post('webhooks')
  @HttpCode(200)
  async handleWebhook(@Body() body: Record<string, unknown>) {
    await this.handlePluggyWebhookUsecase.execute(body as never);
    return { received: true };
  }

  @Post('sync')
  syncFromPluggy(@Body() body?: { itemIds?: string[] }) {
    return this.syncPluggyDataUsecase.execute(body?.itemIds);
  }

  @Post('recategorize')
  recategorizeTransactions() {
    return this.recategorizeTransactionsUsecase.execute();
  }
}
