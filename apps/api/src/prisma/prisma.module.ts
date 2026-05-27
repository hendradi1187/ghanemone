import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global PrismaModule — import once in AppModule, PrismaService available everywhere.
 * Domain modules (AuthModule, UserModule, etc.) do NOT need to re-import PrismaModule.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
