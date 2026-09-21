import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateConnectionDto {
  @IsUUID()
  pluggyItemId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  connectorName: string;
}
