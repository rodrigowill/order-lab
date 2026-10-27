import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { NotFoundErrorFilter } from './not-found-error/not-found-error.filter.js';
import { InvalidOrderStepErrorFilter } from './not-found-error/invalid-order-step.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: 422,
  }));

  app.useGlobalFilters(
    new NotFoundErrorFilter(),
    new InvalidOrderStepErrorFilter(),
  );

  app.enableCors({
    origin: ['http://localhost', 'http://localhost:5173'],
  })

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
