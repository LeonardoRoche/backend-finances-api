import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { PluggyAuthGatewayPort } from '../../modules/pluggy/domain/ports/pluggy-auth.gateway.port.js';

import { ConfigService } from '@nestjs/config';

type PluggyAuthResponse = {
  apiKey?: string;
  ApiKey?: string;
};

@Injectable()
export class PluggyAuthGatewayAdapter implements PluggyAuthGatewayPort {
  private cachedApiKey: string | null = null;

  private expiresAt = 0;

  constructor(private readonly configService: ConfigService) {}

  clearCache(): void {
    this.cachedApiKey = null;
    this.expiresAt = 0;
  }

  async getApiKey(): Promise<string> {
    const now = Date.now();

    if (this.cachedApiKey && now < this.expiresAt) {
      return this.cachedApiKey;
    }

    const apiUrl = this.configService
      .getOrThrow('PLUGGY_API_URL')
      .replace(/\/$/, '');

    const response = await fetch(`${apiUrl}/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.configService.getOrThrow('PLUGGY_CLIENT_ID'),
          clientSecret: this.configService.getOrThrow('PLUGGY_CLIENT_SECRET'),
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new UnauthorizedException(
        `Credenciais Pluggy inválidas. Verifique PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET. ${errorBody}`,
      );
    }

    const data = (await response.json()) as PluggyAuthResponse;
    const apiKey = data.apiKey ?? data.ApiKey;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'Pluggy auth não retornou apiKey na resposta.',
      );
    }

    this.cachedApiKey = apiKey;
    // API key Pluggy expira em 2h; renovamos um pouco antes.
    this.expiresAt = now + 1000 * 60 * 105;

    return apiKey;
  }
}
