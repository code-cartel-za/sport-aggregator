import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem,
  IonLabel, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  moon, notifications, football, speedometer, heart, informationCircle, logOutOutline,
} from 'ionicons/icons';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem,
    IonLabel, IonToggle, IonIcon, IonSelect, IonSelectOption, IonNote,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton,
    IonAvatar,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title><span style="font-family: Outfit, sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold)">⚙️ SETTINGS</span></ion-title>
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
                  <p>v0.1.0 · Built with Angular 21 + Ionic</p>
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
  private router = inject(Router);

  constructor() {
    addIcons({ moon, notifications, football, speedometer, heart, informationCircle, logOutOutline });
  }

  toggleDark(enabled: boolean) {
    this.subService.updatePreferences({ darkMode: enabled });
    document.body.classList.toggle('dark', enabled);
  }

  async signOut() {
    await this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
