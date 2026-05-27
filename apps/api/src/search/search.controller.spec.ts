import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { MeilisearchService } from './meilisearch.service';
import { SearchIndexerService } from './search-indexer.service';
import { UserRole } from '@prisma/client';
import type { JwtPayload } from '../auth/dto/jwt-payload.interface';

const makeUser = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
  sub: 'user-001',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.KKKS_OPERATOR,
  orgId: 'org-001',
  orgName: 'Test Org',
  orgSlug: 'test-org',
  ...overrides,
});

describe('SearchController', () => {
  let controller: SearchController;
  let meili: jest.Mocked<MeilisearchService>;
  let indexer: jest.Mocked<SearchIndexerService>;

  const mockSearchResult = {
    hits: [],
    total: 0,
    page: 1,
    limit: 20,
    facetDistribution: null,
  };

  beforeEach(async () => {
    const meiliMock = {
      search: jest.fn().mockResolvedValue(mockSearchResult),
    };

    const indexerMock = {
      reindexAll: jest.fn().mockResolvedValue({ indexed: 45 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: MeilisearchService, useValue: meiliMock },
        { provide: SearchIndexerService, useValue: indexerMock },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    meili = module.get(MeilisearchService);
    indexer = module.get(SearchIndexerService);
  });

  describe('search', () => {
    it('delegates to MeilisearchService.search with user context', async () => {
      const user = makeUser();
      const query = { q: 'seismic' };

      const result = await controller.search(query, user);

      expect(meili.search).toHaveBeenCalledWith(query, user);
      expect(result).toEqual(mockSearchResult);
    });
  });

  describe('reindex', () => {
    it('delegates to SearchIndexerService.reindexAll', async () => {
      const result = await controller.reindex();

      expect(indexer.reindexAll).toHaveBeenCalled();
      expect(result.indexed).toBe(45);
    });
  });
});
