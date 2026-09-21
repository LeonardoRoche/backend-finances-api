export interface PluggyAuthGatewayPort {
  getApiKey(): Promise<string>;
  clearCache(): void;
}

export const PLUGGY_AUTH_GATEWAY_PORT = Symbol('PLUGGY_AUTH_GATEWAY_PORT');
