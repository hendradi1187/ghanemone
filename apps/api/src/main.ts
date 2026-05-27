import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // Disable default NestJS logger; nestjs-pino takes over
    bufferLogs: true,
  });

  // Use Pino structured logger
  app.useLogger(app.get(Logger));

  // Global API prefix — health/readiness are excluded (see HealthController for route setup)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'readiness'],
  });

  // Global CORS
  const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    credentials: true,
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

  // Global exception filter — consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global guards — JwtAuthGuard + RolesGuard applied to all routes
  // @Public() decorator on controller/handler skips JwtAuthGuard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ghanem.one API')
    .setDescription(
      'Spatial Intelligence Platform for Indonesia Upstream Oil & Gas (SKK Migas + KKKS). ' +
        'All endpoints require Bearer JWT unless marked @Public().',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization' },
      'Bearer',
    )
    .addTag('auth', 'Authentication — login, refresh, logout, profile')
    .addTag('users', 'User management CRUD (RBAC-enforced)')
    .addTag('organizations', 'Organization CRUD (RBAC-enforced)')
    .addTag('health', 'Health + readiness probes for K8s')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = Number(process.env['PORT'] ?? 3000);
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`Application running on http://localhost:${port}`);
  logger.log(`Swagger UI: http://localhost:${port}/api/v1/docs`);
}

void bootstrap();
