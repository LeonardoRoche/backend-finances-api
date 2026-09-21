export type FinancialInvestmentRecord = {
  id: string;
  pluggyInvestmentId: string;
  pluggyItemId: string;
  name: string;
  balance: number;
  type: string;
  subtype: string | null;
  status: string;
};

export type UpsertFinancialInvestmentInput = Omit<
  FinancialInvestmentRecord,
  'id'
> & {
  id?: string;
};

export interface FinancialInvestmentRepositoryPort {
  findAll(): Promise<FinancialInvestmentRecord[]>;
  replaceForItem(
    pluggyItemId: string,
    investments: UpsertFinancialInvestmentInput[],
  ): Promise<void>;
}

export const financialInvestmentRepositoryPort = Symbol(
  'FinancialInvestmentRepositoryPort',
);
