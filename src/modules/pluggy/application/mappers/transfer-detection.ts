/** Padrões usados na categorização (inclui variações de bancos). */
export const OUTGOING_TRANSFER_PATTERNS = [
  'PIX ENVI',
  'ENVIO PIX',
  'PIX ENVIADO',
  'PIX TRANSF',
  'TRANSFERENCIA ENVIADA',
  'TRANSFERENCIA ENV',
  'TRANSF ENVIADA',
  'TRANSF ENV',
  'TED ENVI',
  'DOC ENVI',
  'ENVIO TED',
  'ENVIO DOC',
  'DEBITO TRANSF',
  'TRANSFERENCIA PIX',
  'TRANSF PIX',
  'PIX PARA',
  'PIX - ENV',
  'PAGAMENTO DE FATURA',
  'PAGAMENTO FATURA',
  'PAGAMENTO DE FAT',
];

/** Padrões seguros para excluir de gastos (sem risco de compras via PIX). */
export const STRICT_OUTGOING_TRANSFER_PATTERNS = [
  'TRANSFERENCIA ENVIADA',
  'TRANSFERENCIA ENV',
  'TRANSFERENCIA PIX',
  'TRANSF ENVIADA',
  'TRANSF ENV',
  'TRANSF PIX',
  'PIX ENVIADO',
  'PIX ENVI',
  'ENVIO PIX',
  'TED ENVI',
  'DOC ENVI',
  'ENVIO TED',
  'ENVIO DOC',
  'PAGAMENTO DE FATURA',
  'PAGAMENTO FATURA',
  'PAGAMENTO DE FAT',
];

export const PEER_TRANSFER_EXCLUSION_PATTERNS = [
  ...STRICT_OUTGOING_TRANSFER_PATTERNS,
  'PIX ENVI',
  'PIX PARA',
];

export const INCOMING_TRANSFER_PATTERNS = [
  'TRANSFERENCIA RECEBIDA',
  'TRANSFERENCIA REC',
  'TRANSF RECEBIDA',
  'PIX RECEB',
  'PIX RECEBIDO',
  'TED RECEB',
  'CREDITO PIX',
  'CREDITO TRANSF',
];

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase();
}

function matchesAnyPattern(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text);
  return patterns.some((pattern) =>
    normalized.includes(normalizeText(pattern)),
  );
}

export function looksLikeOutgoingTransfer(
  description: string,
  amount: number,
): boolean {
  if (amount >= 0) {
    return false;
  }

  return (
    matchesAnyPattern(description, OUTGOING_TRANSFER_PATTERNS) ||
    looksLikeNubankPeerTransfer(description)
  );
}

/** Formato Nubank: "Transferência enviada|Nome" ou "Transferência Recebida|Nome". */
export function looksLikeNubankPeerTransfer(description: string): boolean {
  const normalized = normalizeText(description);
  return (
    normalized.startsWith('TRANSFERENCIA ENVIADA|') ||
    normalized.startsWith('TRANSFERENCIA RECEBIDA|') ||
    normalized.includes('TRANSFERENCIA ENVIADA|') ||
    normalized.includes('TRANSFERENCIA RECEBIDA|')
  );
}

export function isOutgoingTransferTransaction(input: {
  description: string;
  category: string;
  amount: number;
}): boolean {
  if (input.amount >= 0) {
    return false;
  }

  if (input.category === 'Transferências') {
    return true;
  }

  return looksLikeOutgoingTransfer(input.description, input.amount);
}

export function isPeerOutgoingTransferTransaction(input: {
  description: string;
  category: string;
  amount: number;
}): boolean {
  if (!isOutgoingTransferTransaction(input)) {
    return false;
  }

  return !matchesAnyPattern(input.description, [
    'PAGAMENTO DE FATURA',
    'PAGAMENTO FATURA',
    'PAGAMENTO DE FAT',
    'PAGAMENTO RECEBIDO',
  ]);
}

export function looksLikeIncomingTransfer(
  description: string,
  amount: number,
): boolean {
  if (amount <= 0) {
    return false;
  }

  return matchesAnyPattern(description, INCOMING_TRANSFER_PATTERNS);
}

export function looksLikeAnyTransfer(description: string): boolean {
  const normalized = normalizeText(description);
  const generic = [
    'TRANSFERENCIA',
    'TRANSFERENCIA',
    'TRANSF ',
    ' TED',
    ' DOC',
    'PIX ENVI',
    'PIX RECEB',
    'ENVIO PIX',
    'PAGTO FAT',
    'FATURA CART',
    'CREDITO CONTA',
    'DEBITO CONTA',
  ];

  return generic.some((pattern) => normalized.includes(normalizeText(pattern)));
}

/** Cláusulas ILIKE para excluir transferências das métricas de gasto. */
export function buildTransferDescriptionExclusions(
  columnAlias = 'transaction.description',
  patterns: string[] = STRICT_OUTGOING_TRANSFER_PATTERNS,
): { sql: string; params: Record<string, string> } {
  const params: Record<string, string> = {};
  const clauses = patterns.map((pattern, index) => {
    const key = `transferPattern${index}`;
    params[key] = `%${pattern}%`;
    return `${columnAlias} NOT ILIKE :${key}`;
  });

  return {
    sql: clauses.join(' AND '),
    params,
  };
}

/** Cláusulas ILIKE para identificar saídas que são transferências (OR). */
export function buildOutgoingTransferDescriptionMatch(
  columnAlias = 'transaction.description',
  patterns: string[] = OUTGOING_TRANSFER_PATTERNS,
): { sql: string; params: Record<string, string> } {
  const params: Record<string, string> = {};
  const clauses = patterns.map((pattern, index) => {
    const key = `outTransferPattern${index}`;
    params[key] = `%${pattern}%`;
    return `${columnAlias} ILIKE :${key}`;
  });

  return {
    sql: `(${clauses.join(' OR ')})`,
    params,
  };
}
