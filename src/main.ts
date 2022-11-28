import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { telemetry } from './telemetry';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await telemetry.start();
  console.log('Tracing started...');

  await app.listen(3000);
}
bootstrap();
