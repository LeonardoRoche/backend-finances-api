export class BudgetEntity {
  constructor(
    public readonly id: string,
    public readonly category: string,
    public readonly limit: number,
    public readonly period: string,
    public readonly alertThreshold: number,
    public readonly spent: number,
  ) {}
}
