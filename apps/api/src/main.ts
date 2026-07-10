import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  // Прод: закрепить origin через CORS_ORIGIN (список через запятую, напр. https://zovu.vercel.app).
  // Dev/по умолчанию: origin:true (рефлект любого) — удобно для локалки и превью.
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : true;
  app.enableCors({ origin: corsOrigin, credentials: true });

  // Единый ValidationPipe: whitelist + forbidNonWhitelisted + transform (стек-стандарт).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger + экспорт openapi.json в docs/api/ (04-api.md).
  const config = new DocumentBuilder()
    .setTitle('Zovu API')
    .setDescription('C2C-маркетплейс услуг — REST /v1. Source of truth: docs/04-api.md')
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, doc);

  if (process.env.EXPORT_OPENAPI !== 'false') {
    const outDir = join(process.cwd(), '..', '..', 'docs', 'api');
    try {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'openapi.json'), JSON.stringify(doc, null, 2));
    } catch {
      /* экспорт необязателен для рантайма */
    }
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Zovu API on http://localhost:${port}/v1 (docs: /v1/docs)`);
}
void bootstrap();
