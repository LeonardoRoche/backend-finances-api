import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConnectionEntity } from '../../../connections/domain/entities/connection.entity.js';
import {
  connectionRepositoryPort,
  type ConnectionRepositoryPort,
} from '../../../connections/domain/ports/connection.repository.port.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';
import {
  PLUGGY_API_GATEWAY_PORT,
  type PluggyApiGatewayPort,
} from '../../domain/ports/pluggy-api.gateway.port.js';
import { TransactionCategorizationService } from '../services/transaction-categorization.service.js';

type PluggyWebhookPayload = {
  event: string;
  itemId?: string;
  createdTransactionsLink?: string;
};

@Injectable()
export class HandlePluggyWebhookUsecase {
  private readonly logger = new Logger(HandlePluggyWebhookUsecase.name);

  constructor(
    @Inject(connectionRepositoryPort)
    private readonly connectionRepository: ConnectionRepositoryPort,
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PLUGGY_API_GATEWAY_PORT)
    private readonly pluggyApiGateway: PluggyApiGatewayPort,
    private readonly transactionCategorizationService: TransactionCategorizationService,
  ) {}

  async execute(payload: PluggyWebhookPayload): Promise<void> {
    switch (payload.event) {
      case 'item/created':
      case 'item/updated':
      case 'item/login_succeeded':
        await this.syncConnection(payload.itemId);
        break;
      case 'item/error':
      case 'item/waiting_user_input':
      case 'item/waiting_user_action':
        await this.updateConnectionStatus(payload.itemId, payload.event);
        break;
      case 'item/deleted':
        await this.deleteConnection(payload.itemId);
        break;
      case 'transactions/created':
        await this.syncTransactions(payload.createdTransactionsLink);
        break;
      default:
        this.logger.log(`Evento Pluggy ignorado: ${payload.event}`);
    }
  }

  private async syncConnection(itemId?: string): Promise<void> {
    if (!itemId) return;

    const item = await this.pluggyApiGateway.fetchItem(itemId);
    const existing = await this.connectionRepository.findByPluggyItemId(itemId);

    if (existing) {
      await this.connectionRepository.updateStatusByPluggyItemId(
        itemId,
        item.status,
      );
      return;
    }

    const connection = new ConnectionEntity(
      '',
      item.id,
      item.status,
      item.connector.name,
      new Date(),
      new Date(),
    );

    await this.connectionRepository.save(connection);
  }

  private async updateConnectionStatus(
    itemId?: string,
    status?: string,
  ): Promise<void> {
    if (!itemId || !status) return;

    const existing = await this.connectionRepository.findByPluggyItemId(itemId);
    if (!existing) return;

    await this.connectionRepository.updateStatusByPluggyItemId(itemId, status);
  }

  private async deleteConnection(itemId?: string): Promise<void> {
    if (!itemId) return;

    await this.connectionRepository.deleteByPluggyItemId(itemId);
  }

  private async syncTransactions(link?: string): Promise<void> {
    if (!link) return;

    const pluggyTransactions =
      await this.pluggyApiGateway.fetchTransactionsFromLink(link);

    const entities =
      await this.transactionCategorizationService.buildTransactionEntitiesBatch(
        pluggyTransactions.map((pluggyTransaction) => ({
          pluggyTransaction,
          accountName: 'Open Finance',
        })),
      );

    for (const entity of entities) {
      await this.transactionRepository.upsertByPluggyId(entity);
    }
  }
}
