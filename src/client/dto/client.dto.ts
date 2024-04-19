import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsCPF } from '../decorators/isCpf';

export class AccountDto {
  @IsNumber()
  @Min(1)
  @Max(100000)
  balance: number;
}

export class ClientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  address: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsCPF()
  @MinLength(11)
  @MaxLength(11)
  cpf: string;

  @ValidateNested()
  @Type(() => AccountDto)
  account: AccountDto;
}
