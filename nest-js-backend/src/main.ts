import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1');

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Accept,x-api-key',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Sport Aggregator B2B API')
    .setDescription(
      'Fantasy sports data API — FPL, Premier League, and Formula 1 data for B2B partners.',
    )
    .setVersion('1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'api-key',
    )
    .addTag('Football', 'Premier League teams, players, fixtures, standings')
    .addTag('FPL', 'Fantasy Premier League player data, live points, prices')
    .addTag('F1', 'Formula 1 standings, races, live telemetry')
    .addTag('Auth', 'API key management')
    .addTag('Health', 'Service health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Sport Aggregator API Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #060D18; }
      .swagger-ui .topbar .download-url-wrapper .select-label { color: #D4A847; }
    `,
  });

  const port: number = parseInt(process.env['PORT'] ?? '3000', 10);
  await app.listen(port);
  console.log(`🚀 B2B API running on http://localhost:${port}`);
  console.log(`📖 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
