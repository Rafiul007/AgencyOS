import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? true, credentials: true });

  // Versioned API prefix: /api/v1
  const prefix = process.env.API_PREFIX ?? 'api';
  const version = process.env.API_VERSION ?? 'v1';
  app.setGlobalPrefix(`${prefix}/${version}`);

  // Validate all incoming DTOs at the edge; strip unknown properties.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Consistent error envelope for every failure.
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
