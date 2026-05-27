import { Injectable } from '@nestjs/common';
import { AlertSeverity, DatasetStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ComplianceStatusDto,
  DatasetsByCategoryItemDto,
  DatasetsByMonthItemDto,
  OverviewStatsDto,
  UploadsByProviderItemDto,
} from './dto/stats-response.dto';

// Category display labels
const CATEGORY_LABELS: Record<string, string> = {
  SEISMIC: 'Seismic',
  WELL_LOG: 'Well Log',
  PRODUCTION: 'Production',
  CONCESSION: 'Concession',
  GEOLOGY: 'Geology',
  DOCUMENT: 'Document',
  INFRASTRUCTURE: 'Infrastructure',
};

// Month label formatter
function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // overview — aggregate counts for dashboard hero section
  // ---------------------------------------------------------------------------
  async getOverview(): Promise<OverviewStatsDto> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalDatasets,
      totalProviders,
      totalWorkAreas,
      totalWells,
      totalFacilities,
      totalPipelines,
      growthLastMonth,
      pendingApprovals,
      activeAlerts,
    ] = await this.prisma.$transaction([
      this.prisma.dataset.count(),
      this.prisma.organization.count(),
      this.prisma.workArea.count(),
      this.prisma.well.count(),
      this.prisma.facility.count(),
      this.prisma.pipeline.count(),
      this.prisma.dataset.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.dataset.count({
        where: { status: DatasetStatus.PENDING_REVIEW },
      }),
      this.prisma.alert.count({
        where: {
          acknowledged: false,
          severity: {
            in: [AlertSeverity.WARNING, AlertSeverity.ERROR, AlertSeverity.CRITICAL],
          },
        },
      }),
    ]);

    // dataAvailability: ratio of APPROVED datasets vs total (min 0, max 100)
    const approvedCount = await this.prisma.dataset.count({
      where: { status: DatasetStatus.APPROVED },
    });
    const dataAvailability =
      totalDatasets > 0 ? Math.round((approvedCount / totalDatasets) * 100) : 0;

    return {
      totalDatasets,
      totalProviders,
      totalWorkAreas,
      totalWells,
      totalFacilities,
      totalPipelines,
      dataAvailability,
      growthLastMonth,
      pendingApprovals,
      activeAlerts,
    };
  }

  // ---------------------------------------------------------------------------
  // datasetsByCategory — Prisma groupBy
  // ---------------------------------------------------------------------------
  async getDatasetsByCategory(): Promise<DatasetsByCategoryItemDto[]> {
    const groups = await this.prisma.dataset.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    });

    return groups.map((g) => ({
      category: g.category,
      count: g._count.category,
      label: CATEGORY_LABELS[g.category] ?? g.category,
    }));
  }

  // ---------------------------------------------------------------------------
  // datasetsByMonth — raw SQL DATE_TRUNC for last 12 months
  // ---------------------------------------------------------------------------
  async getDatasetsByMonth(): Promise<DatasetsByMonthItemDto[]> {
    type MonthRow = { month: string; count: string };

    const rows = await this.prisma.$queryRaw<MonthRow[]>(Prisma.sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*)::text AS count
      FROM datasets
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    return rows.map((r) => ({
      month: r.month,
      count: parseInt(r.count, 10),
      label: monthLabel(r.month),
    }));
  }

  // ---------------------------------------------------------------------------
  // uploadsByProvider — top 10 organizations by dataset count
  // ---------------------------------------------------------------------------
  async getUploadsByProvider(): Promise<UploadsByProviderItemDto[]> {
    const groups = await this.prisma.dataset.groupBy({
      by: ['organizationId'],
      _count: { organizationId: true },
      orderBy: { _count: { organizationId: 'desc' } },
      take: 10,
    });

    // Batch fetch organization names — no N+1
    const orgIds = groups
      .map((g) => g.organizationId)
      .filter((id): id is string => id !== null);

    const orgs = await this.prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    });

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

    return groups
      .filter((g) => g.organizationId !== null)
      .map((g) => ({
        providerId: g.organizationId as string,
        providerName: orgMap.get(g.organizationId as string) ?? 'Unknown',
        count: g._count.organizationId,
      }));
  }

  // ---------------------------------------------------------------------------
  // complianceStatus — dataset counts per status
  // ---------------------------------------------------------------------------
  async getComplianceStatus(): Promise<ComplianceStatusDto> {
    const groups = await this.prisma.dataset.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const counts: ComplianceStatusDto = {
      draft: 0,
      pendingReview: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
      total: 0,
    };

    for (const g of groups) {
      const n = g._count.status;
      counts.total += n;
      switch (g.status) {
        case DatasetStatus.DRAFT:
          counts.draft = n;
          break;
        case DatasetStatus.PENDING_REVIEW:
          counts.pendingReview = n;
          break;
        case DatasetStatus.APPROVED:
          counts.approved = n;
          break;
        case DatasetStatus.REJECTED:
          counts.rejected = n;
          break;
        case DatasetStatus.ARCHIVED:
          counts.archived = n;
          break;
      }
    }

    return counts;
  }
}
