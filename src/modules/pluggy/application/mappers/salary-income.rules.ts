import type { AppCategory } from './smart-transaction-categorizer.js';

/**
 * Fontes de pagamento reconhecidas como salário/renda (entradas).
 * CNPJ/CPF pode vir com ou sem pontuação na descrição bancária.
 */
const SALARY_SOURCE_PATTERNS = [
  '54985969',
  '54.985.969',
  'LEONARDO ROCHE LIMA',
];

const INCOMING_TRANSFER_HINTS = [
  'TRANSFERENCIA RECEBIDA',
  'TRANSFERENCIA REC',
  'TRANSF RECEBIDA',
  'TRANSF REC',
  'PIX RECEBIDO',
  'PIX RECEB',
  'TED RECEBIDA',
  'CREDITO EM CONTA',
  'CREDITO C/C',
  'CREDITO CONTA',
];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase();
}

/**
 * Identifica salário/renda proveniente de transferência recebida
 * de fontes configuradas (ex.: empregador via PIX/TED).
 */
export function mapSalaryIncome(
  text: string,
  amount: number,
): AppCategory | null {
  if (amount <= 0) {
    return null;
  }

  const normalized = normalizeText(text);

  const fromSalarySource = SALARY_SOURCE_PATTERNS.some((pattern) =>
    normalized.includes(normalizeText(pattern)),
  );

  if (!fromSalarySource) {
    return null;
  }

  const isIncomingTransfer = INCOMING_TRANSFER_HINTS.some((hint) =>
    normalized.includes(normalizeText(hint)),
  );

  if (isIncomingTransfer || amount > 0) {
    return 'Renda';
  }

  return null;
}
