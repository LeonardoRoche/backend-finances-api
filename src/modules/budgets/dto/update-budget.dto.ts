import { IsIn, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsIn(['monthly', 'weekly'])
  period?: 'monthly' | 'weekly';

  @IsOptional()
  @IsIn([80, 100])
  alertThreshold?: 80 | 100;
}
