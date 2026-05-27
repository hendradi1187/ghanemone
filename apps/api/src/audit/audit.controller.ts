import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditService } from './audit.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';
import { PaginatedAuditLogsDto } from './dto/audit-log-response.dto';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/v1/audit-logs
   * Paginated, filterable audit log. ADMIN and REGULATOR only.
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR)
  @ApiOperation({
    summary: 'List audit log entries (Admin + Regulator only)',
    description:
      'Returns an immutable, paginated audit trail. Supports filtering by userId, entity, action, and date range.',
  })
  @ApiResponse({ status: 200, type: PaginatedAuditLogsDto })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin/Regulator role required' })
  findMany(@Query() query: ListAuditLogsDto): Promise<PaginatedAuditLogsDto> {
    return this.auditService.findMany(query);
  }
}
