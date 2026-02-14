import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { FirebaseModule } from './config/firebase.module';
import { AuthModule } from './modules/auth/auth.module';
import { FootballModule } from './modules/football/football.module';
import { FplModule } from './modules/fpl/fpl.module';
import { F1Module } from './modules/f1/f1.module';
import { HealthModule } from './modules/health/health.module';
import { UsageModule } from './modules/usage/usage.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 120 },
    ]),
    FirebaseModule,
    AuthModule,
    FootballModule,
    FplModule,
    F1Module,
    HealthModule,
    UsageModule,
    IngestionModule,
  ],
})
export class AppModule {}
