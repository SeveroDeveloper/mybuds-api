import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap() {
  // bufferLogs: hold startup logs until pino is plugged in (configureApp), so even
  // the first lines come out as JSON instead of Nest's default console format.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApp(app);
  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.listen(port);
}
await bootstrap();
