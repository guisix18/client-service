import { Client } from '@prisma/client';
import { ClientDto } from 'src/client/dto/client.dto';
import { SearchFilters } from 'src/client/dto/search-filters.dto';
import { RecordWithId } from 'src/utils/record-with-id';

export abstract class ClientRepository {
  abstract createClient(dto: ClientDto): Promise<RecordWithId>;
  abstract listOneClient(filters: SearchFilters): Promise<Client>;
}
