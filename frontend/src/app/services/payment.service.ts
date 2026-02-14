import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { TierService } from './tier.service';
import { SubscriptionTier, SubscriptionPlatform } from '../@types';

interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatPackage[];
}

interface RevenueCatPackage {
  identifier: string;
  offeringIdentifier: string;
  product: { priceString: string; title: string };
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

interface SubscriptionState {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'none';
  platform: SubscriptionPlatform;
  expiresAt: string | null;
}

const DEFAULT_STATE: SubscriptionState = {
  tier: 'free',
  status: 'none',
  platform: 'none',
  expiresAt: null,
};

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly tierService = inject(TierService);

  private readonly _subscription = signal<SubscriptionState>(DEFAULT_STATE);
  private readonly _isProcessing = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly currentSubscription: Signal<SubscriptionState> = this._subscription.asReadonly();
  readonly isProcessing: Signal<boolean> = this._isProcessing.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly isNative: boolean = Capacitor.isNativePlatform();

  readonly hasActiveSubscription: Signal<boolean> = computed(() => {
    const sub = this._subscription();
    return sub.status === 'active' && sub.tier !== 'free';
  });

  async initializePurchases(): Promise<void> {
    if (this.isNative) {
      try {
        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        const platform = Capacitor.getPlatform();
        const apiKey: string = platform === 'ios'
          ? (globalThis as unknown as Record<string, string>)['RC_IOS_KEY'] ?? ''
          : (globalThis as unknown as Record<string, string>)['RC_ANDROID_KEY'] ?? '';

        await Purchases.configure({ apiKey });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to initialize purchases';
        this._error.set(message);
      }
    }
  }

  async getOfferings(): Promise<RevenueCatOffering[]> {
    if (!this.isNative) return [];

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const result = await Purchases.getOfferings();
      const current = result.current;
      return current ? [current as unknown as RevenueCatOffering] : [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get offerings';
      this._error.set(message);
      return [];
    }
  }

  async purchasePackage(tier: 'pro' | 'elite'): Promise<void> {
    this._isProcessing.set(true);
    this._error.set(null);

    try {
      if (this.isNative) {
        await this.purchaseNative(tier);
      } else {
        await this.purchaseWeb(tier);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Purchase failed';
      this._error.set(message);
    } finally {
      this._isProcessing.set(false);
    }
  }

  async restorePurchases(): Promise<void> {
    if (!this.isNative) return;

    this._isProcessing.set(true);
    this._error.set(null);

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const result = await Purchases.restorePurchases();
      const entitlements = result.customerInfo.entitlements.active;

      if (entitlements?.['elite']) {
        this.applyTier('elite');
      } else if (entitlements?.['pro']) {
        this.applyTier('pro');
      } else {
        this.applyTier('free');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Restore failed';
      this._error.set(message);
    } finally {
      this._isProcessing.set(false);
    }
  }

  async cancelSubscription(): Promise<void> {
    if (this.isNative) {
      // On native, cancellation happens through the platform's subscription management
      this._error.set('Please manage your subscription in your device settings');
      return;
    }

    this._isProcessing.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(this.http.post<{ success: boolean }>('/api/payments/cancel', {}));
      this._subscription.update(current => ({
        ...current,
        status: 'cancelled',
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      this._error.set(message);
    } finally {
      this._isProcessing.set(false);
    }
  }

  private async purchaseNative(tier: 'pro' | 'elite'): Promise<void> {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;

    if (!current) throw new Error('No offerings available');

    const packageId: string = tier === 'elite' ? '$rc_annual' : '$rc_monthly';
    const pkg = current.availablePackages.find(
      (p: { identifier: string }) => p.identifier === packageId,
    );

    if (!pkg) throw new Error(`Package not found for tier: ${tier}`);

    const result = await Purchases.purchasePackage({ aPackage: pkg });
    const entitlements = result.customerInfo.entitlements.active;

    if (entitlements?.[tier]) {
      this.applyTier(tier);
    }
  }

  private async purchaseWeb(tier: 'pro' | 'elite'): Promise<void> {
    const response: CheckoutResponse = await firstValueFrom(
      this.http.post<CheckoutResponse>('/api/payments/create-checkout-session', {
        tier,
        interval: 'monthly',
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancel`,
      }),
    );

    if (response.url) {
      window.location.href = response.url;
    }
  }

  private applyTier(tier: SubscriptionTier): void {
    const platform: SubscriptionPlatform = this.isNative
      ? (Capacitor.getPlatform() as SubscriptionPlatform)
      : 'web';

    this._subscription.set({
      tier,
      status: tier === 'free' ? 'none' : 'active',
      platform,
      expiresAt: null,
    });

    this.tierService.updateSubscription({
      tier,
      status: tier === 'free' ? 'expired' : 'active',
      platform,
    });
  }
}
