import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  PluggyAccount,
  PluggyApiGatewayPort,
  PluggyInvestment,
  PluggyItem,
  PluggyTransaction,
} from '../../modules/pluggy/domain/ports/pluggy-api.gateway.port.js';
import { PluggyAuthGatewayAdapter } from './pluggy-auth.gateway.js';

type PaginatedResponse<T> = {
  results: T[];
  totalPages: number;
};

type CursorResponse<T> = {
  results: T[];
  next: string | null;
};

@Injectable()
export class PluggyApiGatewayAdapter implements PluggyApiGatewayPort {
  constructor(
    private readonly pluggyAuthGateway: PluggyAuthGatewayAdapter,
    private readonly configService: ConfigService,
  ) {}

  async fetchAllItems(): Promise<PluggyItem[]> {
    return this.fetchCursorPaginated<PluggyItem>('/v2/items');
  }

  async fetchItem(itemId: string): Promise<PluggyItem> {
    const response = await this.request(`/items/${itemId}`);

    if (!response.ok) {
      await this.handlePluggyError(response, `item ${itemId}`);
    }

    return response.json() as Promise<PluggyItem>;
  }

  async fetchAccountsByItemId(itemId: string): Promise<PluggyAccount[]> {
    return this.fetchPagePaginated<PluggyAccount>(`/accounts?itemId=${itemId}`);
  }

  async fetchInvestmentsByItemId(itemId: string): Promise<PluggyInvestment[]> {
    try {
      return await this.fetchPagePaginated<PluggyInvestment>(
        `/investments?itemId=${itemId}`,
      );
    } catch {
      return [];
    }
  }

  async fetchTransactionsByAccountId(
    accountId: string,
  ): Promise<PluggyTransaction[]> {
    return this.fetchCursorPaginated<PluggyTransaction>(
      `/v2/transactions?accountId=${accountId}`,
    );
  }

  async fetchTransactionsFromLink(link: string): Promise<PluggyTransaction[]> {
    const url = new URL(link);
    const accountId = url.searchParams.get('accountId');

    if (!accountId) {
      throw new BadRequestException(
        'Link de transações Pluggy inválido: accountId ausente.',
      );
    }

    const params = new URLSearchParams({ accountId });
    const createdAtFrom = url.searchParams.get('createdAtFrom');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    if (createdAtFrom) params.set('createdAtFrom', createdAtFrom);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    return this.fetchCursorPaginated<PluggyTransaction>(
      `/v2/transactions?${params.toString()}`,
    );
  }

  private async fetchCursorPaginated<T>(initialPath: string): Promise<T[]> {
    const results: T[] = [];
    const basePath = initialPath.split('?')[0] ?? initialPath;
    let path = initialPath;

    do {
      const response = await this.request(path);

      if (!response.ok) {
        await this.handlePluggyError(response, path);
      }

      const data = (await response.json()) as CursorResponse<T>;
      results.push(...data.results);
      path = data.next ? `${basePath}${data.next}` : '';
    } while (path);

    return results;
  }

  private async fetchPagePaginated<T>(path: string): Promise<T[]> {
    const results: T[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const separator = path.includes('?') ? '&' : '?';
      const response = await this.request(
        `${path}${separator}page=${page}&pageSize=500`,
      );

      if (!response.ok) {
        await this.handlePluggyError(response, path);
      }

      const data = (await response.json()) as PaginatedResponse<T>;
      results.push(...data.results);
      totalPages = data.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return results;
  }

  private async request(
    path: string,
    options: { absoluteUrl?: boolean; retry?: boolean } = {},
  ): Promise<Response> {
    const apiKey = await this.pluggyAuthGateway.getApiKey();
    const apiUrl = this.configService
      .getOrThrow('PLUGGY_API_URL')
      .replace(/\/$/, '');
    const url = options.absoluteUrl ? path : `${apiUrl}${path}`;

    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
      },
    });

    if (response.status === 401 && !options.retry) {
      this.pluggyAuthGateway.clearCache();
      return this.request(path, { ...options, retry: true });
    }

    return response;
  }

  private async handlePluggyError(
    response: Response,
    context: string,
  ): Promise<never> {
    const errorBody = await response.text();

    if (response.status === 401) {
      throw new UnauthorizedException(
        `Pluggy recusou a autenticação ao buscar ${context}. Verifique PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env e reinicie o backend. ${errorBody}`,
      );
    }

    if (response.status === 403 && context.includes('/v2/items')) {
      throw new BadRequestException(
        'Listagem de items não habilitada na sua conta Pluggy. Conecte um banco pelo widget em /connections ou peça à Pluggy para habilitar GET /v2/items.',
      );
    }

    if (response.status === 400) {
      throw new BadRequestException(
        `Requisição inválida para Pluggy (${context}). Use um Item ID UUID real do dashboard da Pluggy. ${errorBody}`,
      );
    }

    if (response.status === 410) {
      throw new BadRequestException(
        `Endpoint Pluggy depreciado (${context}). Atualize o backend para usar a API v2. ${errorBody}`,
      );
    }

    throw new InternalServerErrorException(
      `Falha ao buscar dados Pluggy (${context}): ${errorBody}`,
    );
  }
}
