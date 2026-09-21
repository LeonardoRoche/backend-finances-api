export type PluggyItem = {
  id: string;
  status: string;
  connector: {
    name: string;
  };
};

export type PluggyAccount = {
  id: string;
  itemId: string;
  name: string;
  type: 'BANK' | 'CREDIT' | 'INVESTMENT';
  subtype: string;
  balance: number;
  creditData?: {
    creditLimit?: number | null;
    availableCreditLimit?: number | null;
    balanceDueDate?: string | null;
    brand?: string | null;
  } | null;
};

export type PluggyTransaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  categoryId?: string;
  type?: string;
  operationType?: string | null;
  merchant?: { name?: string | null } | null;
};

export interface PluggyApiGatewayPort {
  fetchAllItems(): Promise<PluggyItem[]>;
  fetchItem(itemId: string): Promise<PluggyItem>;
  fetchAccountsByItemId(itemId: string): Promise<PluggyAccount[]>;
  fetchTransactionsByAccountId(accountId: string): Promise<PluggyTransaction[]>;
  fetchTransactionsFromLink(link: string): Promise<PluggyTransaction[]>;
}

export const PLUGGY_API_GATEWAY_PORT = Symbol('PluggyApiGatewayPort');
