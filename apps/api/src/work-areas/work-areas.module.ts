import { Module } from '@nestjs/common';
import { WorkAreasController } from './work-areas.controller';
import { WorkAreasService } from './work-areas.service';

@Module({
  controllers: [WorkAreasController],
  providers: [WorkAreasService],
  exports: [WorkAreasService],
})
export class WorkAreasModule {}
