import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosed } from 'ionicons/icons';
import { TierService } from '../../services/tier.service';
import { SubscriptionTier } from '../../@types';
import { TIER_CONFIGS } from '../../config/tiers.config';
import { PaywallComponent } from '../paywall/paywall.component';

@Component({
  selector: 'app-blurred-content',
  standalone: true,
  imports: [CommonModule, IonIcon, PaywallComponent],
  template: `
    <div class="blurred-wrapper" [class.is-locked]="!hasAccess()">
      <div class="content-area" [class.blurred]="!hasAccess()">
        <ng-content></ng-content>
      </div>
      @if (!hasAccess()) {
        <div class="lock-overlay" (click)="showPaywall.set(true)">
          <ion-icon name="lock-closed" class="lock-icon"></ion-icon>
          <span class="lock-text">{{ lockMessage() }}</span>
        </div>
      }
    </div>
    @if (showPaywall()) {
      <app-paywall
        [requiredTier]="requiredTier()"
        [featureName]="featureLabel()"
        (dismiss)="showPaywall.set(false)"
      />
    }
  `,
  styles: [`
    .blurred-wrapper { position: relative; }
    .content-area.blurred {
      filter: blur(8px);
      pointer-events: none;
      user-select: none;
    }
    .lock-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: rgba(6, 13, 24, 0.4);
      border-radius: 12px;
      gap: 8px;
    }
    .lock-icon {
      font-size: 28px;
      color: #D4A847;
    }
    .lock-text {
      color: #D4A847;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
      padding: 0 16px;
    }
  `],
})
export class BlurredContentComponent {
  readonly requiredTier = input<SubscriptionTier>('pro');
  readonly featureId = input<string>('');
  readonly featureLabel = input<string>('');

  private readonly tierService = inject(TierService);
  readonly showPaywall = signal(false);

  constructor() {
    addIcons({ lockClosed });
  }

  hasAccess(): boolean {
    if (this.featureId()) {
      const access = this.tierService.canAccessFeature(this.featureId());
      return access.allowed;
    }
    return this.tierService.meetsMinimumTier(this.requiredTier());
  }

  lockMessage(): string {
    const tierName = TIER_CONFIGS[this.requiredTier()].name;
    if (this.featureLabel()) {
      return `🔒 Upgrade to ${tierName} to ${this.featureLabel()}`;
    }
    return `🔒 Upgrade to ${tierName} to unlock`;
  }
}
