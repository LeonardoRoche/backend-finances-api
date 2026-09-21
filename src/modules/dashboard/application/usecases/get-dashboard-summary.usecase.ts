import { Inject, Injectable } from '@nestjs/common';
import {
  financialAccountRepositoryPort,
  type FinancialAccountRepositoryPort,
} from '../../../accounts/domain/ports/financial-account.repository.port.js';
import {
  transactionRepositoryPort,
  type TransactionRepositoryPort,
} from '../../../transactions/domain/ports/transaction.repository.port.js';
import type {
  BankAccountSummary,
  CreditCardSummary,
  DashboardSummary,
  InvestmentAccountSummary,
} from '../../domain/dashboard-summary.types.js';

@Injectable()
export class GetDashboardSummaryUsecase {
  constructor(
    @Inject(transactionRepositoryPort)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(financialAccountRepositoryPort)
    private readonly financialAccountRepository: FinancialAccountRepositoryPort,
  ) {}

  async execute(month?: string): Promise<DashboardSummary> {
    const accounts = await this.financialAccountRepository.findAll();
    const bankAccounts = accounts.filter((account) => account.type === 'BANK');
    const creditAccounts = accounts.filter((account) => account.type === 'CREDIT');
    const investmentAccounts = accounts.filter(
      (account) => account.type === 'INVESTMENT',
    );

    const bankBalance = bankAccounts.reduce(
      (total, account) => total + account.balance,
      0,
    );

    const creditCards: CreditCardSummary[] = creditAccounts.map((account) => {
      const creditLimit = account.creditLimit ?? account.balance;
      const availableLimit = account.availableCreditLimit ?? 0;
      const utilizationPercent =
        creditLimit > 0
          ? Math.min(100, Math.round((account.balance / creditLimit) * 100))
          : 0;

      return {
        id: account.id,
        name: account.name,
        brand: account.brand,
        currentInvoice: account.balance,
        creditLimit,
        availableLimit,
        utilizationPercent,
        dueDate: account.balanceDueDate,
      };
    });

    const creditCardTotalInvoice = creditCards.reduce(
      (total, card) => total + card.currentInvoice,
      0,
    );
    const creditCardTotalLimit = creditCards.reduce(
      (total, card) => total + card.creditLimit,
      0,
    );

    const metrics = await this.transactionRepository.getTransactionMetrics(month);
    const creditAccountNames = creditAccounts.map((account) => account.name);

    const [monthlyCardSpending, monthlyCreditCardBillPaid] = await Promise.all([
      this.transactionRepository.sumExpensesForAccounts(
        creditAccountNames,
        month,
      ),
      this.transactionRepository.sumCreditCardBillPayments(month),
    ]);

    const monthlySalary = metrics.monthlySalary;
    const monthlyBalance = bankBalance + monthlySalary;
    const monthlyExpenses = metrics.monthlyExpenses;
    const monthlyPeerTransfers = metrics.monthlyPeerTransfers;

    const bankAccountSummaries: BankAccountSummary[] = bankAccounts.map(
      (account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        subtype: account.subtype,
      }),
    );

    const investmentAccountSummaries: InvestmentAccountSummary[] =
      investmentAccounts.map((account) => ({
        id: account.id,
        name: account.name,
        balance: account.balance,
        subtype: account.subtype,
      }));

    const investmentTotal = investmentAccounts.reduce(
      (total, account) => total + account.balance,
      0,
    );

    return {
      bankBalance,
      bankAccounts: bankAccountSummaries,
      investmentTotal,
      investmentAccounts: investmentAccountSummaries,
      monthlySalary,
      monthlyBalance,
      monthlyExpenses,
      monthlyPeerTransfers,
      monthlyCardSpending,
      monthlyCreditCardBillPaid,
      creditCards,
      creditCardTotalInvoice,
      creditCardTotalLimit,
      totalValue: bankBalance,
      monthlyRevenue: monthlySalary,
    };
  }
}
