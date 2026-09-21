export type BankAccountSummary = {
  id: string;
  name: string;
  balance: number;
  subtype: string;
};

export type InvestmentAccountSummary = {
  id: string;
  name: string;
  balance: number;
  subtype: string;
};

export type CreditCardSummary = {
  id: string;
  name: string;
  brand: string | null;
  currentInvoice: number;
  creditLimit: number;
  availableLimit: number;
  utilizationPercent: number;
  dueDate: string | null;
};

export type DashboardSummary = {
  bankBalance: number;
  bankAccounts: BankAccountSummary[];
  investmentTotal: number;
  investmentAccounts: InvestmentAccountSummary[];
  monthlySalary: number;
  monthlyBalance: number;
  monthlyExpenses: number;
  monthlyPeerTransfers: number;
  monthlyCardSpending: number;
  monthlyCreditCardBillPaid: number;
  creditCards: CreditCardSummary[];
  creditCardTotalInvoice: number;
  creditCardTotalLimit: number;
  /** @deprecated use bankBalance */
  totalValue: number;
  /** @deprecated use monthlySalary */
  monthlyRevenue: number;
};
