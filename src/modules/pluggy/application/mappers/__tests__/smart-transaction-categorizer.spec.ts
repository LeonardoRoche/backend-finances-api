import { describe, expect, it } from 'vitest';
import { resolveAppCategory } from '../smart-transaction-categorizer.js';

describe('resolveAppCategory', () => {
  it('classifica Uber como Transporte mesmo com PIX', () => {
    expect(
      resolveAppCategory({
        description: 'UBER TRIP HELP.UBER.COM',
        amount: -25.9,
        operationType: 'PIX',
      }),
    ).toBe('Transporte');
  });

  it('classifica drogaria como Saúde', () => {
    expect(
      resolveAppCategory({
        description: 'DROGARIA SAO PAULO',
        amount: -42.5,
        category: 'Shopping',
        categoryId: '08010000',
      }),
    ).toBe('Saúde');
  });

  it('classifica Mercado Livre como Lazer', () => {
    expect(
      resolveAppCategory({
        description: 'MP*MERCADOLIVRE',
        amount: -189.9,
        operationType: 'PIX',
      }),
    ).toBe('Lazer');
  });

  it('classifica supermercado como Alimentação', () => {
    expect(
      resolveAppCategory({
        description: 'MERCADO EXTRA 123',
        amount: -230.4,
        operationType: 'PIX',
      }),
    ).toBe('Alimentação');
  });

  it('classifica salário recebido de Leonardo Roche Lima como Renda', () => {
    expect(
      resolveAppCategory({
        description: 'Transferência Recebida|54.985.969 LEONARDO ROCHE LIMA',
        amount: 8500,
        operationType: 'PIX',
        categoryId: '05080000',
      }),
    ).toBe('Renda');
  });

  it('classifica PIX enviado como Transferências', () => {
    expect(
      resolveAppCategory({
        description: 'PIX ENVIADO - Joao Silva',
        amount: -150,
        operationType: 'PIX',
      }),
    ).toBe('Transferências');
  });

  it('classifica formato Nubank Transferência enviada como Transferências', () => {
    expect(
      resolveAppCategory({
        description: 'Transferência enviada|MARIA PAULA ROCHE LIMA',
        amount: -800,
        operationType: 'PIX',
      }),
    ).toBe('Transferências');
  });

  it('classifica PIX enviado sem palavra-chave como Transferências', () => {
    expect(
      resolveAppCategory({
        description: 'Joao Silva',
        amount: -50,
        operationType: 'PIX',
      }),
    ).toBe('Transferências');
  });

  it('mantém compra no débito fora de Transferências', () => {
    expect(
      resolveAppCategory({
        description: 'Compra no débito|DROGARIA PAULISTA',
        amount: -7.99,
        operationType: 'PIX',
      }),
    ).toBe('Saúde');
  });

  it('mantém TED como Transferências', () => {
    expect(
      resolveAppCategory({
        description: 'TRANSFERENCIA TED',
        amount: -500,
        operationType: 'TED',
      }),
    ).toBe('Transferências');
  });
});
