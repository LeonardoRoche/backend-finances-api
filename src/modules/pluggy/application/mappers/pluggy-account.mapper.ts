import { FinancialAccountEntity } from '../../../accounts/domain/entities/financial-account.entity.js';
import type { PluggyAccount } from '../../domain/ports/pluggy-api.gateway.port.js';

export function toFinancialAccountEntity(
  pluggyAccount: PluggyAccount,
  pluggyItemId: string,
): FinancialAccountEntity {
  const dueDate = pluggyAccount.creditData?.balanceDueDate
    ? pluggyAccount.creditData.balanceDueDate.slice(0, 10)
    : null;

  return new FinancialAccountEntity(
    '',
    pluggyAccount.id,
    pluggyItemId,
    pluggyAccount.name,
    pluggyAccount.type,
    pluggyAccount.subtype,
    pluggyAccount.balance,
    pluggyAccount.creditData?.creditLimit ?? null,
    pluggyAccount.creditData?.availableCreditLimit ?? null,
    dueDate,
    pluggyAccount.creditData?.brand ?? null,
  );
}
