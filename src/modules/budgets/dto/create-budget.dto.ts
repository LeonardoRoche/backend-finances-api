import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsPositive()
  limit: number;

  @IsIn(['monthly', 'weekly'])
  period: 'monthly' | 'weekly';

  @IsIn([80, 100])
  alertThreshold: 80 | 100;
}
