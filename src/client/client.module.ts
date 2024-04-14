import { Module } from '@nestjs/common';
import { RedisService } from '../config/redis.config';
import { PrismaClientRepository } from 'src/repositories/prisma/prisma.client.repository';
import { ClientRepository } from 'src/repositories/client/client.repository';
import { ClientsService } from './client.service';
import { ClientsController } from './client.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [
    ClientsService,
    RedisService,
    PrismaClientRepository,
    {
      provide: ClientRepository,
      useClass: PrismaClientRepository,
    },
  ],
  exports: [PrismaClientRepository],
})
export class ClientModule {}
