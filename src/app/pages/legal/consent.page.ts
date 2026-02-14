import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonCheckbox, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmark, openOutline } from 'ionicons/icons';
import { PrivacyService } from '../../services/privacy.service';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonCheckbox, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <span class="page-title">Welcome to Sport Aggregator</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen class="consent-content">
      <div class="consent-container">

        <div class="consent-header">
          <div class="shield-icon">
            <ion-icon name="shield-checkmark"></ion-icon>
          </div>
          <h1>Your Privacy Matters</h1>
          <p>Before you get started, please review and accept the following.</p>
        </div>

        <!-- Required consents -->
        <div class="consent-section">
          <h3>Required</h3>

          <div class="consent-item">
            <ion-checkbox
              [checked]="termsAccepted()"
              (ionChange)="termsAccepted.set($any($event).detail.checked)"
            ></ion-checkbox>
            <div class="consent-text">
              I have read and agree to the
              <a (click)="openTerms()">Terms of Service</a>
              <ion-icon name="open-outline" class="link-icon"></ion-icon>
            </div>
          </div>

          <div class="consent-item">
            <ion-checkbox
              [checked]="privacyAccepted()"
              (ionChange)="privacyAccepted.set($any($event).detail.checked)"
            ></ion-checkbox>
            <div class="consent-text">
              I have read and agree to the
              <a (click)="openPrivacy()">Privacy Policy</a>
              <ion-icon name="open-outline" class="link-icon"></ion-icon>
            </div>
          </div>

          <div class="consent-item">
            <ion-checkbox
              [checked]="dataProcessingAccepted()"
              (ionChange)="dataProcessingAccepted.set($any($event).detail.checked)"
            ></ion-checkbox>
            <div class="consent-text">
              I consent to the processing of my personal data as described in the Privacy Policy
            </div>
          </div>
        </div>

        <!-- Optional consents -->
        <div class="consent-section">
          <h3>Optional</h3>

          <div class="consent-item">
            <ion-checkbox
              [checked]="marketingConsent()"
              (ionChange)="marketingConsent.set($any($event).detail.checked)"
            ></ion-checkbox>
            <div class="consent-text">
              I agree to receive marketing and promotional communications (you can opt out at any time)
            </div>
          </div>

          <div class="consent-item">
            <ion-checkbox
              [checked]="analyticsConsent()"
              (ionChange)="analyticsConsent.set($any($event).detail.checked)"
            ></ion-checkbox>
            <div class="consent-text">
              I agree to anonymised analytics to help improve the app
            </div>
          </div>
        </div>

        <ion-button
          expand="block"
          [disabled]="!canProceed()"
          class="agree-btn"
          (click)="agree()"
        >
          I Agree — Let's Go
        </ion-button>

        <p class="consent-note">
          You can change your marketing and analytics preferences at any time in Settings.
        </p>

      </div>
    </ion-content>
  `,
  styles: [`
    .page-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      letter-spacing: 0.06em;
      font-size: 1rem;
      color: var(--accent-gold, #D4A847);
    }
    .consent-content { --background: #060D18; }
    .consent-container {
      padding: 24px 20px 100px;
      max-width: 480px;
      margin: 0 auto;
    }
    .consent-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .shield-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(212, 168, 71, 0.2), rgba(59, 130, 246, 0.2));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: 32px;
      color: #D4A847;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.4rem;
      color: #e2e8f0;
      margin: 0 0 6px;
    }
    .consent-header p { color: #64748b; font-size: 0.88rem; margin: 0; }
    .consent-section {
      margin-bottom: 20px;
    }
    h3 {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 10px;
    }
    .consent-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .consent-text {
      color: #cbd5e1;
      font-size: 0.85rem;
      line-height: 1.5;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .consent-text a {
      color: #3B82F6;
      text-decoration: underline;
      cursor: pointer;
    }
    .link-icon { font-size: 0.7rem; margin-left: 3px; color: #3B82F6; }
    .agree-btn {
      margin-top: 24px;
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
    .agree-btn[disabled] {
      opacity: 0.4;
    }
    .consent-note {
      text-align: center;
      color: #475569;
      font-size: 0.75rem;
      margin-top: 12px;
    }
  `],
})
export class ConsentPage {
  private readonly privacyService = inject(PrivacyService);
  private readonly router = inject(Router);

  readonly termsAccepted = signal(false);
  readonly privacyAccepted = signal(false);
  readonly dataProcessingAccepted = signal(false);
  readonly marketingConsent = signal(false);
  readonly analyticsConsent = signal(true);

  constructor() {
    addIcons({ shieldCheckmark, openOutline });
  }

  canProceed(): boolean {
    return this.termsAccepted() && this.privacyAccepted() && this.dataProcessingAccepted();
  }

  async agree(): Promise<void> {
    if (!this.canProceed()) return;

    await this.privacyService.recordConsent({
      dataProcessingConsent: true,
      marketingConsent: this.marketingConsent(),
      analyticsConsent: this.analyticsConsent(),
    });

    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  openTerms(): void {
    this.router.navigate(['/terms']);
  }

  openPrivacy(): void {
    this.router.navigate(['/privacy-policy']);
  }
}
