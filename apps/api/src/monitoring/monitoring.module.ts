import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PipelineRunsService } from './pipeline-runs.service';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [MonitoringController],
  providers: [PipelineRunsService, AlertsService],
  exports: [PipelineRunsService, AlertsService],
})
export class MonitoringModule {}
