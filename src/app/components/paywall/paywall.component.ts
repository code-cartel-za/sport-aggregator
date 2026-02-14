import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton, IonIcon, IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeCircle, star, diamond, rocketOutline, checkmarkCircle, lockClosed,
} from 'ionicons/icons';
import { TierService } from '../../services/tier.service';
import { SubscriptionTier, TierConfig } from '../../@types';
import { TIER_CONFIGS, TIER_ORDER } from '../../config/tiers.config';
import { Capacitor } from '@capacitor/core';

type BillingCycle = 'monthly' | 'yearly';

interface ComparisonFeature {
  name: string;
  free: string;
  pro: string;
  elite: string;
}

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
  template: `
    <div class="paywall-overlay" (click)="dismiss.emit()">
      <div class="paywall-card" (click)="$event.stopPropagation()">
        <!-- Close button -->
        <button class="close-btn" (click)="dismiss.emit()">
          <ion-icon name="close-circle"></ion-icon>
        </button>

        <!-- Header -->
        <div class="paywall-header">
          <div class="tier-badge">
            <ion-icon [name]="requiredTier() === 'elite' ? 'diamond' : 'star'"></ion-icon>
          </div>
          <h2 class="paywall-title">
            Unlock {{ requiredTierConfig().name }}
          </h2>
          <p class="paywall-subtitle">
            {{ featureName() || 'Get access to premium features' }}
          </p>
        </div>

        <!-- Billing Toggle -->
        <div class="billing-toggle">
          <button
            [class.active]="billingCycle() === 'monthly'"
            (click)="billingCycle.set('monthly')"
          >Monthly</button>
          <button
            [class.active]="billingCycle() === 'yearly'"
            (click)="billingCycle.set('yearly')"
          >
            Yearly
            <span class="savings-badge">Save {{ savingsPercent() }}%</span>
          </button>
        </div>

        <!-- Feature Comparison -->
        <div class="features-list">
          @for (feature of comparisonFeatures; track feature.name) {
            <div class="feature-row">
              <span class="feature-name">{{ feature.name }}</span>
              <div class="feature-tiers">
                <span class="tier-val free">{{ feature.free }}</span>
                <span class="tier-val pro">{{ feature.pro }}</span>
                @if (showElite()) {
                  <span class="tier-val elite">{{ feature.elite }}</span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Price -->
        <div class="price-display">
          <span class="price-amount">
            £{{ billingCycle() === 'monthly' ? requiredTierConfig().price.monthly : requiredTierConfig().price.yearly }}
          </span>
          <span class="price-period">
            /{{ billingCycle() === 'monthly' ? 'month' : 'year' }}
          </span>
        </div>

        <!-- CTA -->
        <button class="cta-button" (click)="subscribe()">
          <ion-icon name="rocket-outline"></ion-icon>
          Start 7-Day Free Trial
        </button>

        <p class="cta-note">
          Cancel anytime. {{ platformNote() }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .paywall-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
      backdrop-filter: blur(4px);
    }
    .paywall-card {
      background: linear-gradient(145deg, #0F1A2E 0%, #060D18 100%);
      border: 1px solid rgba(212, 168, 71, 0.3);
      border-radius: 24px;
      padding: 32px 24px;
      max-width: 420px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      position: relative;
    }
    .close-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      color: #888;
      font-size: 28px;
      cursor: pointer;
    }
    .paywall-header { text-align: center; margin-bottom: 24px; }
    .tier-badge {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: 28px;
      color: #060D18;
    }
    .paywall-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #D4A847;
      margin: 0;
    }
    .paywall-subtitle {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 4px 0 0;
    }
    .billing-toggle {
      display: flex;
      gap: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 20px;
    }
    .billing-toggle button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .billing-toggle button.active {
      background: rgba(212, 168, 71, 0.15);
      color: #D4A847;
    }
    .savings-badge {
      background: #D4A847;
      color: #060D18;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 700;
    }
    .features-list { margin-bottom: 20px; }
    .feature-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .feature-name {
      color: #cbd5e1;
      font-size: 0.82rem;
      flex: 1;
    }
    .feature-tiers {
      display: flex;
      gap: 16px;
    }
    .tier-val {
      font-size: 0.75rem;
      text-align: center;
      min-width: 48px;
    }
    .tier-val.free { color: #64748b; }
    .tier-val.pro { color: #D4A847; }
    .tier-val.elite { color: #3B82F6; }
    .price-display {
      text-align: center;
      margin: 16px 0;
    }
    .price-amount {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2rem;
      color: #fff;
    }
    .price-period {
      color: #64748b;
      font-size: 0.9rem;
    }
    .cta-button {
      width: 100%;
      padding: 16px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.05rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: transform 0.15s;
    }
    .cta-button:active { transform: scale(0.98); }
    .cta-note {
      text-align: center;
      color: #64748b;
      font-size: 0.72rem;
      margin-top: 10px;
    }
  `],
})
export class PaywallComponent {
  readonly requiredTier = input<SubscriptionTier>('pro');
  readonly featureName = input<string>('');
  readonly dismiss = output<void>();
  readonly subscribeAction = output<{ tier: SubscriptionTier; cycle: BillingCycle }>();

  private readonly tierService = inject(TierService);
  readonly billingCycle = signal<BillingCycle>('yearly');

  readonly comparisonFeatures: ComparisonFeature[] = [
    { name: 'Projections', free: 'Top 5', pro: 'All', elite: 'All + AI' },
    { name: 'Captain Picks', free: '#1 only', pro: 'Top 10', elite: 'All' },
    { name: 'FDR Weeks', free: '2', pro: '6', elite: '10' },
    { name: 'Compare', free: '3/day', pro: '∞', elite: '∞' },
    { name: 'Simulator', free: '2/day', pro: '∞', elite: '∞' },
    { name: 'Live Data', free: '5m delay', pro: 'Real-time', elite: 'Real-time + AI' },
    { name: 'F1 Data', free: 'Standings', pro: 'Full', elite: 'Telemetry' },
    { name: 'Ads', free: 'Yes', pro: 'None', elite: 'None' },
  ];

  constructor() {
    addIcons({ closeCircle, star, diamond, rocketOutline, checkmarkCircle, lockClosed });
  }

  requiredTierConfig(): TierConfig {
    return TIER_CONFIGS[this.requiredTier()];
  }

  showElite(): boolean {
    return this.requiredTier() === 'elite';
  }

  savingsPercent(): number {
    const config = this.requiredTierConfig();
    if (config.price.monthly === 0) return 0;
    const yearlyMonthly = config.price.yearly / 12;
    return Math.round((1 - yearlyMonthly / config.price.monthly) * 100);
  }

  platformNote(): string {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') {
        return 'Subscription managed via Apple App Store.';
      }
      return 'Subscription managed via Google Play.';
    }
    return 'Subscription managed via your account settings.';
  }

  subscribe(): void {
    this.subscribeAction.emit({
      tier: this.requiredTier(),
      cycle: this.billingCycle(),
    });
    // TODO: Connect to StoreKit (iOS) / Play Billing (Android) / Stripe (web)
  }
}
