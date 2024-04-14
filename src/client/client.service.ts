import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClientRepository } from 'src/repositories/prisma/prisma.client.repository';
import { ClientDto } from './dto/client.dto';
import { RecordWithId } from 'src/utils/record-with-id';
import { cpf } from 'cpf-cnpj-validator';

@Injectable()
export class ClientsService {
  constructor(private readonly clientRepository: PrismaClientRepository) {}

  async createClient(dto: ClientDto): Promise<RecordWithId> {
    if (!cpf.isValid(dto.cpf)) {
      throw new BadRequestException('This cpf is not valid');
    }

    const client_exists = await this.clientRepository.listOneClient({
      cpf: dto.cpf,
      email: dto.email,
    });

    if (client_exists) {
      throw new BadRequestException('This client already exists');
    }

    return this.clientRepository.createClient(dto);
  }
}
