import { MERCHANT_CATEGORY_RULES } from './merchant-category.rules.js';
import { mapSalaryIncome } from './salary-income.rules.js';
import {
  looksLikeIncomingTransfer,
  looksLikeNubankPeerTransfer,
  looksLikeOutgoingTransfer,
} from './transfer-detection.js';

export const APP_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Assinaturas',
  'Despesas Fixas',
  'Renda',
  'Transferências',
  'Outros',
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type CategorizationInput = {
  category?: string;
  categoryId?: string;
  description: string;
  amount: number;
  operationType?: string | null;
  merchantName?: string | null;
};

const STRICT_TRANSFER_OPERATIONS = new Set([
  'TED',
  'DOC',
  'BOLETO',
  'TRANSFERENCIA',
  'TRANSFERENCIA_MESMA_INSTITUICAO',
  'TRANSFERENCIA_MESMA_TITULARIDADE',
  'PAGAMENTO_FATURA',
  'TARIFA',
  'OPERACOES_CREDITO_CONTRATADAS_CARTAO',
]);

const INCOME_OPERATION_HINTS = ['DEPOSITO', 'RENDIMENTO', 'DIVIDENDO', 'RESGATE'];

const CATEGORY_ID_PREFIX_MAP: Record<string, AppCategory> = {
  '01': 'Renda',
  '02': 'Despesas Fixas',
  '03': 'Outros',
  '04': 'Transferências',
  '05': 'Transferências',
  '06': 'Outros',
  '07': 'Assinaturas',
  '08': 'Lazer',
  '09': 'Assinaturas',
  '10': 'Alimentação',
  '11': 'Alimentação',
  '12': 'Lazer',
  '13': 'Outros',
  '14': 'Lazer',
  '15': 'Despesas Fixas',
  '16': 'Despesas Fixas',
  '17': 'Despesas Fixas',
  '18': 'Saúde',
  '19': 'Transporte',
  '20': 'Despesas Fixas',
  '21': 'Lazer',
};

const EXACT_CATEGORY_MAP: Record<string, AppCategory> = {
  Alimentação: 'Alimentação',
  Transporte: 'Transporte',
  Lazer: 'Lazer',
  Saúde: 'Saúde',
  Assinaturas: 'Assinaturas',
  'Despesas Fixas': 'Despesas Fixas',
  Renda: 'Renda',
  Transferências: 'Transferências',
  Outros: 'Outros',
  Income: 'Renda',
  Salary: 'Renda',
  Transfers: 'Transferências',
  Transfer: 'Transferências',
  Groceries: 'Alimentação',
  'Food and drinks': 'Alimentação',
  'Eating out': 'Alimentação',
  'Food delivery': 'Alimentação',
  Transportation: 'Transporte',
  Healthcare: 'Saúde',
  Housing: 'Despesas Fixas',
  Utilities: 'Despesas Fixas',
  Services: 'Assinaturas',
  'Digital services': 'Assinaturas',
  Shopping: 'Lazer',
  Travel: 'Lazer',
  Leisure: 'Lazer',
  Entertainment: 'Lazer',
  Education: 'Lazer',
  Restaurants: 'Alimentação',
  'Gas stations': 'Transporte',
  Pharmacy: 'Saúde',
  Insurance: 'Despesas Fixas',
  Taxes: 'Despesas Fixas',
  'Bank fees': 'Despesas Fixas',
  'Same person transfer': 'Transferências',
  'Transfer - PIX': 'Transferências',
  'Transfer - TED': 'Transferências',
  'Transfer - DOC': 'Transferências',
  'Transfer - Cash': 'Transferências',
  'Transfer - Internal': 'Transferências',
  'Credit card payment': 'Transferências',
  Investments: 'Outros',
  'Taxi and ride-hailing': 'Transporte',
  'Online shopping': 'Lazer',
};

const CATEGORY_KEYWORD_RULES: Array<{ category: AppCategory; keywords: string[] }> = [
  { category: 'Renda', keywords: ['income', 'salary', 'payroll', 'retirement'] },
  {
    category: 'Transferências',
    keywords: ['transfer -', 'same person', 'credit card payment'],
  },
  {
    category: 'Alimentação',
    keywords: ['food', 'grocery', 'restaurant', 'eating', 'delivery', 'drink'],
  },
  {
    category: 'Transporte',
    keywords: ['transport', 'fuel', 'taxi', 'ride', 'parking', 'toll', 'vehicle'],
  },
  { category: 'Saúde', keywords: ['health', 'pharmacy', 'medical', 'hospital'] },
  {
    category: 'Assinaturas',
    keywords: ['subscription', 'streaming', 'telecom', 'internet', 'software'],
  },
  {
    category: 'Despesas Fixas',
    keywords: ['housing', 'rent', 'utility', 'insurance', 'tax', 'loan'],
  },
  { category: 'Lazer', keywords: ['leisure', 'travel', 'shopping', 'entertainment'] },
];

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase();
}

function matchesPattern(text: string, pattern: string): boolean {
  return normalizeText(text).includes(normalizeText(pattern));
}

export function mapMerchantDescription(text: string): AppCategory | null {
  for (const rule of MERCHANT_CATEGORY_RULES) {
    if (matchesPattern(text, rule.pattern)) {
      return rule.category;
    }
  }

  return null;
}

export function hasMerchantSignal(text: string): boolean {
  return mapMerchantDescription(text) !== null;
}

function mapCategoryId(categoryId?: string): AppCategory | null {
  if (!categoryId) {
    return null;
  }

  const prefix = categoryId.slice(0, 2);
  return CATEGORY_ID_PREFIX_MAP[prefix] ?? null;
}

function mapExactCategory(category?: string): AppCategory | null {
  if (!category) {
    return null;
  }

  const trimmed = category.trim();
  if (EXACT_CATEGORY_MAP[trimmed]) {
    return EXACT_CATEGORY_MAP[trimmed];
  }

  const normalized = normalizeText(trimmed);
  for (const [key, value] of Object.entries(EXACT_CATEGORY_MAP)) {
    if (normalizeText(key) === normalized) {
      return value;
    }
  }

  return null;
}

function mapCategoryKeywords(category: string): AppCategory | null {
  const normalized = normalizeText(category);

  for (const rule of CATEGORY_KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) {
      return rule.category;
    }
  }

  return null;
}

function looksLikePeerTransfer(text: string): boolean {
  if (looksLikeNubankPeerTransfer(text)) {
    return true;
  }

  return [
    'TRANSFER',
    'TRANSF',
    'ENTRE CONTAS',
    'MESMA TITULAR',
    'ENVIO PIX',
    'RECEB PIX',
    'PIX RECEB',
    'PIX ENVI',
    'DEVOLUCAO',
  ].some((pattern) => matchesPattern(text, pattern));
}

function mapOperationType(
  operationType: string | null | undefined,
  combinedText: string,
  amount: number,
): AppCategory | null {
  if (!operationType) {
    return null;
  }

  const normalized = normalizeText(operationType);

  if (STRICT_TRANSFER_OPERATIONS.has(normalized)) {
    return 'Transferências';
  }

  if (normalized === 'PIX') {
    if (hasMerchantSignal(combinedText)) {
      return null;
    }

    if (matchesPattern(combinedText, 'COMPRA NO DEBITO')) {
      return null;
    }

    if (looksLikePeerTransfer(combinedText)) {
      return 'Transferências';
    }

    if (amount < 0) {
      return 'Transferências';
    }

    return null;
  }

  if (INCOME_OPERATION_HINTS.some((hint) => normalized.includes(hint))) {
    return 'Renda';
  }

  return null;
}

/**
 * Categorização determinística — merchants/descrição têm prioridade sobre PIX genérico.
 */
export function resolveAppCategory(input: CategorizationInput): AppCategory {
  const combinedText = [input.description, input.merchantName, input.category]
    .filter(Boolean)
    .join(' ');

  const fromSalary = mapSalaryIncome(combinedText, input.amount);
  if (fromSalary) {
    return fromSalary;
  }

  const fromMerchant = mapMerchantDescription(combinedText);
  if (fromMerchant) {
    return fromMerchant;
  }

  const fromExact = mapExactCategory(input.category);
  if (fromExact) {
    return fromExact;
  }

  const fromCategoryId = mapCategoryId(input.categoryId);
  if (fromCategoryId) {
    return fromCategoryId;
  }

  const fromOperation = mapOperationType(
    input.operationType,
    combinedText,
    input.amount,
  );
  if (fromOperation) {
    return fromOperation;
  }

  if (looksLikeOutgoingTransfer(combinedText, input.amount)) {
    return 'Transferências';
  }

  if (looksLikeIncomingTransfer(combinedText, input.amount)) {
    return 'Transferências';
  }

  if (input.category) {
    const fromKeywords = mapCategoryKeywords(input.category);
    if (fromKeywords) {
      return fromKeywords;
    }
  }

  return 'Outros';
}

export function shouldValidateWithAi(
  ruleCategory: AppCategory,
  input: CategorizationInput,
): boolean {
  if (input.amount >= 0) {
    return false;
  }

  const combinedText = [input.description, input.merchantName, input.category]
    .filter(Boolean)
    .join(' ');

  const merchantCategory = mapMerchantDescription(combinedText);

  if (merchantCategory && merchantCategory !== ruleCategory) {
    return true;
  }

  const ambiguousCategories: AppCategory[] = [
    'Transferências',
    'Outros',
    'Lazer',
    'Transporte',
  ];

  return ambiguousCategories.includes(ruleCategory);
}
