import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsageTrackingService } from '../../services/usage-tracking.service';
import { TierService } from '../../services/tier.service';

@Component({
  selector: 'app-usage-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLimited()) {
      <div class="usage-badge" [class.exhausted]="remaining() <= 0">
        <div class="usage-bar">
          <div class="usage-fill" [style.width.%]="usagePercent()"></div>
        </div>
        <span class="usage-text">
          @if (remaining() <= 0) {
            Limit reached — resets {{ resetTime() }}
          } @else {
            {{ used() }} of {{ limit() }} used today
          }
        </span>
      </div>
    }
  `,
  styles: [`
    .usage-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .usage-badge.exhausted { color: #ef4444; }
    .usage-bar {
      width: 48px;
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .usage-fill {
      height: 100%;
      background: #D4A847;
      border-radius: 2px;
      transition: width 0.3s;
    }
    .exhausted .usage-fill { background: #ef4444; }
  `],
})
export class UsageBadgeComponent {
  readonly featureId = input.required<string>();

  private readonly usageService = inject(UsageTrackingService);
  private readonly tierService = inject(TierService);

  isLimited(): boolean {
    const feature = this.tierService.getFeatureAccess(this.featureId());
    return !!feature.limit && feature.limit > 0;
  }

  limit(): number {
    const feature = this.tierService.getFeatureAccess(this.featureId());
    return feature.limit ?? 0;
  }

  used(): number {
    return this.usageService.getUsageToday(this.featureId());
  }

  remaining(): number {
    return this.usageService.getRemainingToday(this.featureId());
  }

  usagePercent(): number {
    const l = this.limit();
    if (l <= 0) return 0;
    return Math.min(100, (this.used() / l) * 100);
  }

  resetTime(): string {
    const check = this.usageService.canUse(this.featureId());
    return check.resetIn ?? 'soon';
  }
}
