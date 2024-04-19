import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerifyEmailOrCpfAvailability implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _: Response, next: NextFunction) {
    const { cpf, email } = req.body;

    const client_exists = await this.prisma.client.findFirst({
      where: {
        OR: [
          {
            cpf: cpf || null,
          },
          {
            email: email || null,
          },
        ],
      },
    });

    if (client_exists) {
      throw new BadRequestException('This client already exists');
    }

    return next();
  }
}
