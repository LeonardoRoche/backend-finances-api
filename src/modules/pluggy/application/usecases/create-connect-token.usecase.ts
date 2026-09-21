import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PLUGGY_AUTH_GATEWAY_PORT } from '../../domain/ports/pluggy-auth.gateway.port.js';
import type { PluggyAuthGatewayPort } from '../../domain/ports/pluggy-auth.gateway.port.js';

type PluggyConnectTokenResponse = {
  accessToken: string;
};

@Injectable()
export class CreateConnectTokenUsecase {
  constructor(
    @Inject(PLUGGY_AUTH_GATEWAY_PORT)
    private readonly pluggyAuthGateway: PluggyAuthGatewayPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<{ accessToken: string }> {
    const apiKey = await this.pluggyAuthGateway.getApiKey();
    const apiUrl = this.configService.getOrThrow('PLUGGY_API_URL');
    const webhookUrl = this.configService.get<string>('PLUGGY_WEBHOOK_URL');
    const body: Record<string, string> = {};

    if (webhookUrl) {
      body.webhookUrl = webhookUrl;
    }

    const response = await fetch(`${apiUrl}/connect_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `Falha ao criar token de conexão: ${errorBody}`,
      );
    }

    const data = (await response.json()) as PluggyConnectTokenResponse;
    return { accessToken: data.accessToken };
  }
}
