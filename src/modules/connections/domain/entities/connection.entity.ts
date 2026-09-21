export class ConnectionEntity {
  constructor(
    public readonly id: string,
    public readonly pluggyItemId: string,
    public readonly status: string,
    public readonly connectorName: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
