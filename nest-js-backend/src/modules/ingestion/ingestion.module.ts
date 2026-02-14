import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CacheService } from '../../common/services/cache.service';

@Module({
  controllers: [IngestionController],
  providers: [IngestionService, CacheService],
  exports: [IngestionService, CacheService],
})
export class IngestionModule {}
