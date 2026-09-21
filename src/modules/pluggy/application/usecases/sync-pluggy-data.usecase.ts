import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConnectionEntity } from '../../../connections/domain/entities/connection.entity.js';
import {
  connectionRepositoryPort,
  type ConnectionRepositoryPort,
} from '../../../connections/domain/ports/connection.repository.port.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';
import type { PluggyItem } from '../../domain/ports/pluggy-api.gateway.port.js';
import {
  PLUGGY_API_GATEWAY_PORT,
  type PluggyApiGatewayPort,
} from '../../domain/ports/pluggy-api.gateway.port.js';
import {
  financialAccountRepositoryPort,
  type FinancialAccountRepositoryPort,
} from '../../../accounts/domain/ports/financial-account.repository.port.js';
import { toFinancialAccountEntity } from '../mappers/pluggy-account.mapper.js';
import { TransactionCategorizationService } from '../services/transaction-categorization.service.js';
import { isPluggyItemId } from '../utils/pluggy-id.util.js';

export type SyncPluggyDataResult = {
  itemsSynced: number;
  connectionsCreated: number;
  connectionsUpdated: number;
  transactionsImported: number;
  transactionsUpdated: number;
  transactionsSkipped: number;
  invalidConnectionsSkipped: number;
  source: 'pluggy-list' | 'local-connections' | 'item-ids';
};

@Injectable()
export class SyncPluggyDataUsecase {
  private readonly logger = new Logger(SyncPluggyDataUsecase.name);

  constructor(
    @Inject(connectionRepositoryPort)
    private readonly connectionRepository: ConnectionRepositoryPort,
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PLUGGY_API_GATEWAY_PORT)
    private readonly pluggyApiGateway: PluggyApiGatewayPort,
    private readonly transactionCategorizationService: TransactionCategorizationService,
    @Inject(financialAccountRepositoryPort)
    private readonly financialAccountRepository: FinancialAccountRepositoryPort,
  ) {}

  async execute(itemIds?: string[]): Promise<SyncPluggyDataResult> {
    const result: SyncPluggyDataResult = {
      itemsSynced: 0,
      connectionsCreated: 0,
      connectionsUpdated: 0,
      transactionsImported: 0,
      transactionsUpdated: 0,
      transactionsSkipped: 0,
      invalidConnectionsSkipped: 0,
      source: 'pluggy-list',
    };

    const { items, source, invalidConnectionsSkipped } =
      await this.resolveItems(itemIds);
    result.source = source;
    result.invalidConnectionsSkipped = invalidConnectionsSkipped;

    if (items.length === 0) {
      throw new BadRequestException(
        'Nenhum item Pluggy válido para sincronizar. Conecte um banco em /connections ou informe itemIds UUID reais do dashboard da Pluggy.',
      );
    }

    this.logger.log(`Encontrados ${items.length} items para sincronizar`);

    for (const item of items) {
      result.itemsSynced += 1;

      const connectionResult = await this.upsertConnection(item);
      if (connectionResult === 'created') {
        result.connectionsCreated += 1;
      }
      if (connectionResult === 'updated') {
        result.connectionsUpdated += 1;
      }

      const accounts = await this.pluggyApiGateway.fetchAccountsByItemId(
        item.id,
      );

      for (const account of accounts) {
        await this.financialAccountRepository.upsertByPluggyAccountId(
          toFinancialAccountEntity(account, item.id),
        );

        const transactions =
          await this.pluggyApiGateway.fetchTransactionsByAccountId(account.id);

        const entities =
          await this.transactionCategorizationService.buildTransactionEntitiesBatch(
            transactions.map((pluggyTransaction) => ({
              pluggyTransaction,
              accountName: account.name,
            })),
          );

        for (const entity of entities) {
          const upserted =
            await this.transactionRepository.upsertByPluggyId(entity);

          if (upserted.created) {
            result.transactionsImported += 1;
          } else {
            result.transactionsUpdated += 1;
          }
        }
      }
    }

    this.logger.log(
      `Sync concluído: ${result.transactionsImported} transações importadas, ${result.transactionsSkipped} ignoradas`,
    );

    return result;
  }

  private async resolveItems(itemIds?: string[]): Promise<{
    items: PluggyItem[];
    source: SyncPluggyDataResult['source'];
    invalidConnectionsSkipped: number;
  }> {
    if (itemIds?.length) {
      const invalidIds = itemIds.filter((itemId) => !isPluggyItemId(itemId));

      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Item ID inválido: ${invalidIds.join(', ')}. Copie o UUID real do dashboard da Pluggy (ex.: a5c763cb-0952-457b-9936-630f79c5b016).`,
        );
      }

      const items = await Promise.all(
        itemIds.map((itemId) => this.pluggyApiGateway.fetchItem(itemId)),
      );

      return { items, source: 'item-ids', invalidConnectionsSkipped: 0 };
    }

    try {
      const items = await this.pluggyApiGateway.fetchAllItems();
      return { items, source: 'pluggy-list', invalidConnectionsSkipped: 0 };
    } catch (error) {
      const connections = await this.connectionRepository.findAll();
      const validConnections = connections.filter((connection) =>
        isPluggyItemId(connection.pluggyItemId),
      );
      const invalidConnectionsSkipped =
        connections.length - validConnections.length;

      if (invalidConnectionsSkipped > 0) {
        this.logger.warn(
          `Ignorando ${invalidConnectionsSkipped} conexão(ões) local(is) com Item ID inválido.`,
        );
      }

      if (validConnections.length === 0) {
        throw error;
      }

      this.logger.warn(
        'Listagem Pluggy indisponível. Sincronizando conexões válidas salvas localmente.',
      );

      const items = await Promise.all(
        validConnections.map((connection) =>
          this.pluggyApiGateway.fetchItem(connection.pluggyItemId),
        ),
      );

      return {
        items,
        source: 'local-connections',
        invalidConnectionsSkipped,
      };
    }
  }

  private async upsertConnection(item: {
    id: string;
    status: string;
    connector: { name: string };
  }): Promise<'created' | 'updated' | 'unchanged'> {
    const existing = await this.connectionRepository.findByPluggyItemId(item.id);

    if (existing) {
      if (existing.status !== item.status) {
        await this.connectionRepository.updateStatusByPluggyItemId(
          item.id,
          item.status,
        );
        return 'updated';
      }

      return 'unchanged';
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
    return 'created';
  }
}
