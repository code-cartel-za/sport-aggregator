import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem,
  IonLabel, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton,
  IonAvatar, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moon, notifications, football, speedometer, heart, informationCircle, logOutOutline,
  star, diamond, shieldCheckmark, download, trash, documentText, lockClosed,
} from 'ionicons/icons';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { TierService } from '../../services/tier.service';
import { PrivacyService } from '../../services/privacy.service';
import { TIER_CONFIGS } from '../../config/tiers.config';
import { PaywallComponent } from '../../components/paywall/paywall.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem,
    IonLabel, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton,
    IonAvatar, IonBadge,
    PaywallComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title><span class="page-title">⚙️ SETTINGS</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="px-4 pt-4">

        <!-- User Profile Card -->
        <ion-card class="settings-card profile-card">
          <ion-card-content>
            <div class="profile-row">
              <ion-avatar class="profile-avatar">
                @if (authService.photoURL()) {
                  <img [src]="authService.photoURL()" alt="avatar" />
                } @else {
                  <div class="avatar-placeholder">{{ authService.displayName().charAt(0) }}</div>
                }
              </ion-avatar>
              <div class="profile-info">
                <h3 class="profile-name">{{ authService.displayName() }}</h3>
                <p class="profile-email">{{ authService.email() }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Subscription Section -->
        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon [name]="tierService.isElite() ? 'diamond' : 'star'" class="section-icon gold"></ion-icon>
              Subscription
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="tier-display">
              <ion-badge [class]="'tier-badge-' + tierService.currentTier()">
                {{ tierConfig().name }}
              </ion-badge>
              @if (tierService.isFreeTier()) {
                <p class="tier-note">Upgrade to unlock all features</p>
              } @else {
                <p class="tier-note">{{ tierConfig().price.currency }} {{ tierConfig().price.monthly }}/mo</p>
              }
            </div>
            @if (tierService.isFreeTier()) {
              <ion-button expand="block" class="upgrade-btn" (click)="showPaywall.set(true)">
                <ion-icon name="star" slot="start"></ion-icon>
                Upgrade to Pro
              </ion-button>
            } @else {
              <ion-button expand="block" fill="outline" size="small" class="manage-btn">
                Manage Subscription
              </ion-button>
            }
          </ion-card-content>
        </ion-card>

        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>Appearance</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon name="moon" slot="start" class="text-indigo-400"></ion-icon>
                <ion-label>Dark Mode</ion-label>
                <ion-toggle
                  [checked]="subService.preferences().darkMode"
                  (ionChange)="toggleDark($any($event).detail.checked)"
                ></ion-toggle>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>Preferences</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon name="football" slot="start" class="text-green-400"></ion-icon>
                <ion-select
                  label="Default Sport"
                  [value]="subService.preferences().defaultSport"
                  (ionChange)="subService.updatePreferences({ defaultSport: $any($event).detail.value })"
                  interface="action-sheet"
                >
                  <ion-select-option value="football">Football</ion-select-option>
                  <ion-select-option value="f1">Formula 1</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-icon name="notifications" slot="start" class="text-yellow-400"></ion-icon>
                <ion-label>Notifications</ion-label>
                <ion-toggle
                  [checked]="subService.preferences().notificationsEnabled"
                  (ionChange)="subService.updatePreferences({ notificationsEnabled: $any($event).detail.checked })"
                ></ion-toggle>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Privacy & Data Section -->
        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="shield-checkmark" class="section-icon blue"></ion-icon>
              Privacy &amp; Data
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-label>Marketing Communications</ion-label>
                <ion-toggle
                  [checked]="marketingConsent()"
                  (ionChange)="updateMarketing($any($event).detail.checked)"
                ></ion-toggle>
              </ion-item>
              <ion-item>
                <ion-label>Analytics</ion-label>
                <ion-toggle
                  [checked]="analyticsConsent()"
                  (ionChange)="updateAnalytics($any($event).detail.checked)"
                ></ion-toggle>
              </ion-item>
              <ion-item button (click)="exportData()">
                <ion-icon name="download" slot="start" class="text-blue-400"></ion-icon>
                <ion-label>
                  <h3>Download My Data</h3>
                  <p>GDPR Article 15/20 · POPI Section 23</p>
                </ion-label>
              </ion-item>
              <ion-item button (click)="deleteAccount()">
                <ion-icon name="trash" slot="start" class="text-red-400"></ion-icon>
                <ion-label>
                  <h3 class="text-red">Delete My Account</h3>
                  <p>GDPR Article 17 · POPI Section 24</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Legal Section -->
        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="document-text" class="section-icon"></ion-icon>
              Legal
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item button (click)="router.navigate(['/privacy-policy'])">
                <ion-icon name="lock-closed" slot="start" class="text-blue-400"></ion-icon>
                <ion-label>Privacy Policy</ion-label>
              </ion-item>
              <ion-item button (click)="router.navigate(['/terms'])">
                <ion-icon name="document-text" slot="start" class="text-blue-400"></ion-icon>
                <ion-label>Terms of Service</ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>Subscriptions</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            @if (subService.subscriptions().length === 0) {
              <div class="empty-subs">
                <ion-icon name="heart" class="text-3xl text-gray-500 mb-2"></ion-icon>
                <p class="text-sm text-gray-500">No subscriptions yet. Follow leagues, teams, or drivers to personalize your feed.</p>
              </div>
            } @else {
              <ion-list lines="none">
                @for (sub of subService.subscriptions(); track sub.id) {
                  <ion-item>
                    <ion-label>
                      <h3>{{ sub.entityName }}</h3>
                      <p>{{ sub.type | titlecase }} · {{ sub.sportId }}</p>
                    </ion-label>
                  </ion-item>
                }
              </ion-list>
            }
          </ion-card-content>
        </ion-card>

        <ion-card class="settings-card">
          <ion-card-header>
            <ion-card-title>About</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none">
              <ion-item>
                <ion-icon name="information-circle" slot="start" class="text-blue-400"></ion-icon>
                <ion-label>
                  <h3>Sport Aggregator</h3>
                  <p>v0.5.0 · Built with Angular 21 + Ionic</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Sign Out -->
        <ion-button
          expand="block"
          color="danger"
          fill="outline"
          class="logout-btn"
          (click)="signOut()"
        >
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Sign Out
        </ion-button>

      </div>
      <div class="bottom-spacer"></div>
    </ion-content>

    @if (showPaywall()) {
      <app-paywall
        requiredTier="pro"
        featureName="Unlock all features"
        (dismiss)="showPaywall.set(false)"
      />
    }
  `,
  styles: [`
    .settings-card {
      --background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px !important;
      margin: 8px 0;
    }
    .profile-card ion-card-content { padding: 16px; }
    .profile-row {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .profile-avatar { width: 52px; height: 52px; }
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: var(--ion-color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      font-weight: 700;
      border-radius: 50%;
    }
    .profile-name {
      font-family: 'Sora', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      margin: 0;
    }
    .profile-email {
      font-size: 0.8rem;
      color: var(--text-muted, #888);
      margin: 2px 0 0;
    }
    .section-icon { margin-right: 6px; }
    .section-icon.gold { color: #D4A847; }
    .section-icon.blue { color: #3B82F6; }
    .tier-display {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .tier-badge-free {
      --background: #334155;
      --color: #94a3b8;
    }
    .tier-badge-pro {
      --background: linear-gradient(135deg, #D4A847, #B8860B);
      --color: #060D18;
    }
    .tier-badge-elite {
      --background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      --color: #fff;
    }
    .tier-note { color: #64748b; font-size: 0.82rem; margin: 0; }
    .upgrade-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 12px;
      --color: #060D18;
      font-weight: 700;
    }
    .manage-btn {
      --border-radius: 12px;
      --color: #94a3b8;
      --border-color: rgba(255,255,255,0.1);
    }
    .text-red { color: #ef4444; }
    .logout-btn {
      margin: 16px 0;
      --border-radius: 12px;
      font-weight: 600;
    }
    .empty-subs { text-align: center; padding: 20px; }
    .bottom-spacer { height: 80px; }
  `],
})
export class SettingsPage {
  subService = inject(SubscriptionService);
  authService = inject(AuthService);
  tierService = inject(TierService);
  private privacyService = inject(PrivacyService);
  router = inject(Router);

  showPaywall = signal(false);
  marketingConsent = signal(false);
  analyticsConsent = signal(true);

  constructor() {
    addIcons({
      moon, notifications, football, speedometer, heart, informationCircle, logOutOutline,
      star, diamond, shieldCheckmark, download, trash, documentText, lockClosed,
    });

    // Load consent state
    const consent = this.privacyService.getConsent();
    if (consent) {
      this.marketingConsent.set(consent.marketingConsent);
      this.analyticsConsent.set(consent.analyticsConsent);
    }
  }

  tierConfig() {
    return TIER_CONFIGS[this.tierService.currentTier()];
  }

  toggleDark(enabled: boolean) {
    this.subService.updatePreferences({ darkMode: enabled });
    if (enabled) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }

  async updateMarketing(enabled: boolean): Promise<void> {
    this.marketingConsent.set(enabled);
    await this.privacyService.updateMarketingConsent(enabled);
  }

  async updateAnalytics(enabled: boolean): Promise<void> {
    this.analyticsConsent.set(enabled);
    await this.privacyService.updateAnalyticsConsent(enabled);
  }

  async exportData(): Promise<void> {
    await this.privacyService.requestDataExport();
    // TODO: Show confirmation toast
  }

  async deleteAccount(): Promise<void> {
    // TODO: Show confirmation dialog before proceeding
    await this.privacyService.requestDataDeletion();
  }

  async signOut() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
