import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, logoApple } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-content fullscreen class="login-content">
      <div class="login-wrapper">

        <!-- Branding -->
        <div class="brand">
          <span class="brand-icon">🏟</span>
          <h1 class="brand-title">Sport Aggregator</h1>
          <p class="brand-subtitle">Your live sports hub</p>
        </div>

        <!-- Auth Buttons -->
        <div class="auth-buttons">
          <ion-button
            expand="block"
            class="google-btn"
            [disabled]="loading"
            (click)="signIn('google')"
          >
            @if (loading && activeProvider === 'google') {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            } @else {
              <ion-icon name="logo-google" slot="start"></ion-icon>
            }
            Continue with Google
          </ion-button>

          <ion-button
            expand="block"
            class="apple-btn"
            [disabled]="loading"
            (click)="signIn('apple')"
          >
            @if (loading && activeProvider === 'apple') {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            } @else {
              <ion-icon name="logo-apple" slot="start"></ion-icon>
            }
            Continue with Apple
          </ion-button>
        </div>

        @if (errorMsg) {
          <p class="error-msg">{{ errorMsg }}</p>
        }

        <p class="terms">
          By continuing you agree to our<br />
          <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>
        </p>

      </div>
    </ion-content>
  `,
  styles: [`
    .login-content {
      --background: var(--ion-background-color, #0d0d14);
    }
    .login-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: 32px 24px;
      text-align: center;
    }
    .brand { margin-bottom: 48px; }
    .brand-icon { font-size: 4rem; }
    .brand-title {
      font-family: 'Sora', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      margin: 12px 0 4px;
    }
    .brand-subtitle {
      font-size: 0.95rem;
      color: var(--text-muted, #888);
    }
    .auth-buttons {
      width: 100%;
      max-width: 340px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .google-btn {
      --background: #ffffff;
      --color: #1f1f1f;
      --border-radius: 12px;
      font-weight: 600;
    }
    .apple-btn {
      --background: #000000;
      --color: #ffffff;
      --border-radius: 12px;
      font-weight: 600;
    }
    .error-msg {
      color: var(--ion-color-danger);
      font-size: 0.85rem;
      margin-top: 16px;
    }
    .terms {
      font-size: 0.75rem;
      color: var(--text-muted, #666);
      margin-top: 32px;
      line-height: 1.5;
    }
    .terms a { color: var(--ion-color-primary); text-decoration: none; }
  `],
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  activeProvider: 'google' | 'apple' | null = null;
  errorMsg = '';

  constructor() {
    addIcons({ logoGoogle, logoApple });
  }

  async signIn(provider: 'google' | 'apple') {
    this.loading = true;
    this.activeProvider = provider;
    this.errorMsg = '';

    try {
      if (provider === 'google') {
        await this.authService.signInWithGoogle();
      } else {
        await this.authService.signInWithApple();
      }
      const onboardingDone = localStorage.getItem('onboarding_complete') === 'true';
      this.router.navigateByUrl(onboardingDone ? '/home' : '/consent', { replaceUrl: true });
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User cancelled — no error message needed
      } else {
        this.errorMsg = err.message || 'Sign-in failed. Please try again.';
      }
    } finally {
      this.loading = false;
      this.activeProvider = null;
    }
  }
}
