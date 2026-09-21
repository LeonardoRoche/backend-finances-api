export class TransactionEntity {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly category: string,
    public readonly account: string,
    public readonly date: string,
    public readonly amount: number,
    public readonly pluggyTransactionId: string | null = null,
  ) {}
}
