export class FinancialAccountEntity {
  constructor(
    public readonly id: string,
    public readonly pluggyAccountId: string,
    public readonly pluggyItemId: string,
    public readonly name: string,
    public readonly type: 'BANK' | 'CREDIT',
    public readonly subtype: string,
    public readonly balance: number,
    public readonly creditLimit: number | null,
    public readonly availableCreditLimit: number | null,
    public readonly balanceDueDate: string | null,
    public readonly brand: string | null,
  ) {}
}
