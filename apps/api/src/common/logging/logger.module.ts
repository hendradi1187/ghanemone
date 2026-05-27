import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { AppConfigService } from '../../config/config.service';
import { AppConfigModule } from '../../config/config.module';

/**
 * Structured logging via nestjs-pino (Pino under the hood).
 * - Development: pretty-printed human-readable output (pino-pretty)
 * - Production: JSON structured logs (machine-readable for log aggregators)
 *
 * Sensitive fields are automatically redacted from request/response logs.
 */
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logLevel,
          ...(config.isDevelopment()
            ? {
                transport: {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
              }
            : {}),
          // Redact sensitive fields from logs
          redact: {
            paths: [
              'req.headers.authorization',
              'req.body.password',
              'req.body.passwordHash',
              'req.body.token',
              'req.body.refreshToken',
              'req.body.secret',
            ],
            censor: '[REDACTED]',
          },
          // Custom serializers to strip internal implementation details
          serializers: {
            req: (req: {
              method: string;
              url: string;
              headers: Record<string, unknown>;
              remoteAddress?: string;
            }) => ({
              method: req.method,
              url: req.url,
              userAgent: req.headers['user-agent'],
              ip: req.remoteAddress,
            }),
            res: (res: { statusCode: number }) => ({
              statusCode: res.statusCode,
            }),
          },
        },
      }),
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
