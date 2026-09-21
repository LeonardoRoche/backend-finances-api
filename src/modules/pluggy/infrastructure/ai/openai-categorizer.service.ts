import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  APP_CATEGORIES,
  type AppCategory,
  type CategorizationInput,
  normalizeText,
} from '../../application/mappers/smart-transaction-categorizer.js';

type CacheEntry = {
  category: AppCategory;
  expiresAt: number;
};

@Injectable()
export class OpenAiCategorizerService {
  private readonly logger = new Logger(OpenAiCategorizerService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24 * 7;

  constructor(private readonly configService: ConfigService) {}

  isEnabled(): boolean {
    return Boolean(this.configService.get<string>('OPENAI_API_KEY'));
  }

  private buildCacheKey(input: CategorizationInput): string {
    return normalizeText(
      [input.description, input.merchantName, input.category, String(input.amount)]
        .filter(Boolean)
        .join('|'),
    );
  }

  private readCache(key: string): AppCategory | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cached.category;
  }

  private writeCache(key: string, category: AppCategory): void {
    this.cache.set(key, {
      category,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }

  private buildPrompt(
    items: Array<{ id: number; input: CategorizationInput; ruleCategory: AppCategory }>,
  ): string {
    const lines = items.map(({ id, input, ruleCategory }) => {
      const parts = [
        `id=${id}`,
        `desc="${input.description}"`,
        input.merchantName ? `loja="${input.merchantName}"` : null,
        input.category ? `pluggy="${input.category}"` : null,
        input.operationType ? `operacao="${input.operationType}"` : null,
        `valor=${input.amount}`,
        `regra="${ruleCategory}"`,
      ].filter(Boolean);

      return `- ${parts.join(' | ')}`;
    });

    return [
      'Você classifica transações financeiras brasileiras.',
      `Use SOMENTE uma destas categorias: ${APP_CATEGORIES.join(', ')}.`,
      'Regras importantes:',
      '- Uber/99/Cabify/InDriver = Transporte (mobilidade), NUNCA Transferências.',
      '- Mercado Livre, Shopee, Amazon, Magazine Luiza = Lazer (compras online).',
      '- Supermercado, mercado, Carrefour, Assaí, Pão de Açúcar = Alimentação.',
      '- Drogaria, farmácia, Drogasil, Raia, Pacheco = Saúde, NUNCA Lazer.',
      '- PIX para loja/estabelecimento NÃO é Transferências.',
      '- Transferências = apenas movimentação entre contas, TED/DOC, pagamento de fatura, Mercado Pago como carteira.',
      '- Transferência recebida de 54.985.969 LEONARDO ROCHE LIMA = Renda (salário).',
      '- Posto/combustível = Transporte.',
      '',
      'Transações:',
      ...lines,
      '',
      'Responda APENAS JSON válido no formato:',
      '[{"id":0,"category":"Transporte"}]',
    ].join('\n');
  }

  private parseAiCategories(
    content: string,
    expectedIds: number[],
  ): Map<number, AppCategory> {
    const result = new Map<number, AppCategory>();

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return result;
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        id: number;
        category: string;
      }>;

      for (const item of parsed) {
        if (!expectedIds.includes(item.id)) {
          continue;
        }

        const normalized = item.category.trim();
        if ((APP_CATEGORIES as readonly string[]).includes(normalized)) {
          result.set(item.id, normalized as AppCategory);
        }
      }
    } catch (error) {
      this.logger.warn(`Falha ao parsear resposta da IA: ${String(error)}`);
    }

    return result;
  }

  async categorizeOne(
    input: CategorizationInput,
    ruleCategory: AppCategory,
  ): Promise<AppCategory> {
    const batch = await this.categorizeBatch([{ input, ruleCategory }]);
    return batch[0] ?? ruleCategory;
  }

  async categorizeBatch(
    items: Array<{ input: CategorizationInput; ruleCategory: AppCategory }>,
  ): Promise<AppCategory[]> {
    if (!this.isEnabled() || items.length === 0) {
      return items.map((item) => item.ruleCategory);
    }

    const results: AppCategory[] = items.map((item) => item.ruleCategory);
    const pending: Array<{
      index: number;
      id: number;
      input: CategorizationInput;
      ruleCategory: AppCategory;
    }> = [];

    items.forEach((item, index) => {
      const cacheKey = this.buildCacheKey(item.input);
      const cached = this.readCache(cacheKey);
      if (cached) {
        results[index] = cached;
        return;
      }

      pending.push({
        index,
        id: pending.length,
        input: item.input,
        ruleCategory: item.ruleCategory,
      });
    });

    if (pending.length === 0) {
      return results;
    }

    const apiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
    const model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em categorização de finanças pessoais no Brasil. Responda somente JSON.',
            },
            {
              role: 'user',
              content: this.buildPrompt(pending),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(
          `OpenAI indisponível (${response.status}). Mantendo categorias por regra. ${errorBody}`,
        );
        return results;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = payload.choices?.[0]?.message?.content ?? '';
      const aiMap = this.parseAiCategories(
        content,
        pending.map((item) => item.id),
      );

      for (const item of pending) {
        const aiCategory = aiMap.get(item.id) ?? item.ruleCategory;
        results[item.index] = aiCategory;
        this.writeCache(this.buildCacheKey(item.input), aiCategory);
      }
    } catch (error) {
      this.logger.warn(
        `Erro ao chamar OpenAI. Mantendo categorias por regra. ${String(error)}`,
      );
    }

    return results;
  }
}
