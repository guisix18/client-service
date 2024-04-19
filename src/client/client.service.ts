import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientRepository } from 'src/repositories/prisma/prisma.client.repository';
import { ClientDto } from './dto/client.dto';
import { RecordWithId } from 'src/utils/record-with-id';
import { cpf } from 'cpf-cnpj-validator';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InitTransactionDto, TransactionDto } from './dto/init-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientRepository: PrismaClientRepository,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientKafka,
    private readonly prisma: PrismaService,
  ) {}

  async createClient(dto: ClientDto): Promise<RecordWithId> {
    const client = await this.clientRepository.createClient(dto);

    return {
      id: client.id,
    };
  }

  async initTransaction(data: InitTransactionDto) {
    await lastValueFrom(this.transactionClient.emit('init_transaction', data));

    return;
  }

  async makeTransaction(data: TransactionDto) {
    return await this.prisma.$transaction(
      async (prismaTx: Prisma.TransactionClient) => {
        const senderUser = await prismaTx.client.findUnique({
          where: {
            id: data.senderUserId,
          },
          include: {
            account: true,
          },
        });

        const receiverUser = await prismaTx.client.findUnique({
          where: {
            id: data.receiverUserId,
          },
          include: {
            account: true,
          },
        });

        if (!senderUser || !receiverUser) {
          await lastValueFrom(
            this.transactionClient.emit('status', {
              transactionId: data.id,
              option: 'ERRORED',
            }),
          );
          throw new NotFoundException('Client not found');
        }

        if (senderUser.account.balance < data.amount) {
          await lastValueFrom(
            this.transactionClient.emit('status', {
              transactionId: data.id,
              option: 'ERRORED',
            }),
          );
          throw new BadRequestException(
            'You do not have balance to do this transaction',
          );
        }

        await Promise.all([
          prismaTx.account.update({
            where: {
              client_id: senderUser.id,
            },
            data: {
              balance: senderUser.account.balance - data.amount,
            },
          }),
          prismaTx.account.update({
            where: {
              client_id: receiverUser.id,
            },
            data: {
              balance: receiverUser.account.balance + data.amount,
            },
          }),
        ]);

        await lastValueFrom(
          this.transactionClient.emit('status', {
            transactionId: data.id,
            option: 'COMPLETED',
          }),
        );
      },
    );
  }
}
