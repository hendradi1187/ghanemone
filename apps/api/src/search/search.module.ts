import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module';
import { SearchController } from './search.controller';
import { MeilisearchService } from './meilisearch.service';
import { SearchIndexerService } from './search-indexer.service';

@Module({
  imports: [AppConfigModule],
  controllers: [SearchController],
  providers: [MeilisearchService, SearchIndexerService],
  exports: [MeilisearchService, SearchIndexerService],
})
export class SearchModule {}
