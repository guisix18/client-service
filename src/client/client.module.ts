import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RedisService } from '../config/redis.config';
import { PrismaClientRepository } from 'src/repositories/prisma/prisma.client.repository';
import { ClientRepository } from 'src/repositories/client/client.repository';
import { ClientsService } from './client.service';
import { ClientsController } from './client.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { VerifyEmailOrCpfAvailability } from 'src/middleware/verify-email-or-cpf-availability.middleware';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'TRANSACTION_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'transaction',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'transaction-consumer',
          },
        },
      },
    ]),
  ],
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
export class ClientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyEmailOrCpfAvailability)
      .forRoutes({ path: '/clients', method: RequestMethod.POST });
  }
}
