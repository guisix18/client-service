import { IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';

export class InitTransactionDto {
  @IsString()
  @IsUUID()
  senderUserId: string;

  @IsString()
  @IsUUID()
  receiverUserId: string;

  @IsNumber()
  @Max(100000)
  @Min(1)
  amount: number;
}

export class TransactionDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsUUID()
  senderUserId: string;

  @IsString()
  @IsUUID()
  receiverUserId: string;

  @IsNumber()
  @Max(100000)
  @Min(1)
  amount: number;
}
