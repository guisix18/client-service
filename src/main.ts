import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'transaction-consumer',
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Client Services')
    .setDescription('API to access client services')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Bearer ',
      },
      'access_token',
    )
    .build();

  app.useGlobalPipes(new ValidationPipe());

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc/client', app, doc);

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
