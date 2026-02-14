import { Module } from '@nestjs/common';
import { FplController } from './fpl.controller';
import { FplService } from './fpl.service';

@Module({
  controllers: [FplController],
  providers: [FplService],
})
export class FplModule {}
