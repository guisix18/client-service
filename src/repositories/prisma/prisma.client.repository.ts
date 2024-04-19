import { ClientDto } from 'src/client/dto/client.dto';
import { RecordWithId } from 'src/utils/record-with-id';
import { ClientRepository } from '../client/client.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { cpf } from 'cpf-cnpj-validator';
import { SearchFilters } from 'src/client/dto/search-filters.dto';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClient(dto: ClientDto): Promise<Client> {
    const data: Prisma.ClientCreateInput = {
      name: dto.name,
      password: bcrypt.hashSync(dto.password, 8),
      address: dto.address,
      cpf: cpf.format(dto.cpf),
      email: dto.email,
    };

    const client = await this.prisma.client.create({
      data,
    });

    await this.prisma.account.create({
      data: {
        agency: '000001',
        balance: dto.account.balance,
        account_holder: {
          connect: {
            id: client.id,
          },
        },
      },
    });

    return client;
  }

  async listOneClient(filters: SearchFilters): Promise<Client> {
    const findClient = this.prisma.client.findFirst({
      where: {
        id: filters.id,
      },
    });

    return findClient;
  }
}
