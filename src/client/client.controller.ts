import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ClientDto } from './dto/client.dto';
import { RecordWithId } from 'src/utils/record-with-id';
import { ClientsService } from './client.service';

@ApiTags('Clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createClient(@Body() data: ClientDto): Promise<RecordWithId> {
    return await this.clientService.createClient(data);
  }
}
