import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  OnModuleInit,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientDto } from './dto/client.dto';
import { RecordWithId } from 'src/utils/record-with-id';
import { ClientsService } from './client.service';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InitTransactionDto, TransactionDto } from './dto/init-transaction.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController implements OnModuleInit {
  constructor(
    private readonly clientService: ClientsService,
    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientKafka,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createClient(@Body() data: ClientDto): Promise<RecordWithId> {
    return await this.clientService.createClient(data);
  }

  @Post('/init-transaction')
  @HttpCode(HttpStatus.OK)
  async initTransaction(@Body() data: InitTransactionDto): Promise<any> {
    await this.clientService.initTransaction(data);
    return { message: 'Transaction will be processed' };
  }

  @MessagePattern('transaction_created')
  async makeTransaction(@Payload() message: TransactionDto) {
    console.log(message);
    return await this.clientService.makeTransaction(message);
  }

  @Get('/clients-transactions/:userId')
  async clientsTransactions(@Param('userId') userId: string) {
    const transactions = await lastValueFrom(
      this.transactionClient.send('clients_transactions', userId),
    );

    return transactions;
  }

  onModuleInit() {
    this.transactionClient.subscribeToResponseOf('clients_transactions');
  }
}
