import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';
import { IsCPF } from '../decorators/isCpf';

export class SearchFilters {
  @IsOptional()
  @IsString()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  @IsCPF()
  cpf?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
