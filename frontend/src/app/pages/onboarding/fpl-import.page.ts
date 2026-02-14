import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonInput, IonSpinner, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudDownload, chevronForward, checkmarkCircle } from 'ionicons/icons';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WatchlistService } from '../../services/watchlist.service';
import { FplPosition } from '../../models';

interface FplPick {
  element: number;
  position: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
}

interface FplPlayer {
  id: number;
  web_name: string;
  team_code: number;
  element_type: number;
  now_cost: number;
}

@Component({
  selector: 'app-fpl-import',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonInput, IonSpinner, IonItem, FormsModule],
  template: `
    <ion-content fullscreen class="import-content">
      <div class="import-wrapper">

        <div class="header">
          <div class="header-icon">
            <ion-icon name="cloud-download"></ion-icon>
          </div>
          <h1>Import your FPL squad</h1>
          <p>Enter your FPL Team ID to auto-import your squad to your watchlist.</p>
          <p class="helper">Find it at fantasy.premierleague.com → Points → your URL contains the ID</p>
        </div>

        <div class="input-area">
          <ion-item class="id-input-item" lines="none">
            <ion-input
              type="number"
              placeholder="e.g. 1234567"
              [(ngModel)]="teamId"
              [disabled]="loading()"
              class="id-input"
            ></ion-input>
          </ion-item>

          <ion-button expand="block" class="import-btn" [disabled]="!teamId || loading()" (click)="doImport()">
            @if (loading()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
              Importing...
            } @else {
              <ion-icon name="cloud-download" slot="start"></ion-icon>
              Import Squad
            }
          </ion-button>
        </div>

        @if (error()) {
          <p class="error-msg">{{ error() }}</p>
        }

        @if (importedPlayers().length > 0) {
          <div class="imported-list">
            <h3>Imported {{ importedPlayers().length }} players</h3>
            @for (p of importedPlayers(); track p.id) {
              <div class="player-row">
                <ion-icon name="checkmark-circle" class="check-icon"></ion-icon>
                <span>{{ p.name }}</span>
              </div>
            }
          </div>
        }

        <div class="bottom-actions">
          @if (importedPlayers().length > 0) {
            <ion-button expand="block" class="continue-btn" (click)="completeOnboarding()">
              Continue to Dashboard
              <ion-icon name="chevron-forward" slot="end"></ion-icon>
            </ion-button>
          } @else {
            <button class="skip-btn" (click)="completeOnboarding()">Skip for now</button>
          }
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .import-content { --background: #060D18; }
    .import-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 48px 24px 32px;
      max-width: 480px;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 32px; }
    .header-icon {
      width: 80px;
      height: 80px;
      border-radius: 22px;
      background: linear-gradient(135deg, rgba(212, 168, 71, 0.15), rgba(212, 168, 71, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 36px;
      color: #D4A847;
    }
    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.4rem;
      color: #e2e8f0;
      margin: 0 0 8px;
    }
    .header p { color: #64748b; font-size: 0.88rem; margin: 0 0 6px; }
    .helper { font-size: 0.78rem !important; color: #475569 !important; }
    .input-area {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 16px;
    }
    .id-input-item {
      --background: rgba(255, 255, 255, 0.05);
      --border-radius: 14px;
      --padding-start: 16px;
      --padding-end: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
    }
    .id-input {
      --color: #e2e8f0;
      --placeholder-color: #475569;
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.1rem;
    }
    .import-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
    .import-btn[disabled] { opacity: 0.4; }
    .error-msg {
      color: #ef4444;
      font-size: 0.85rem;
      text-align: center;
      margin: 8px 0;
    }
    .imported-list {
      margin-top: 16px;
      padding: 16px;
      background: rgba(212, 168, 71, 0.05);
      border: 1px solid rgba(212, 168, 71, 0.15);
      border-radius: 14px;
    }
    .imported-list h3 {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 0.9rem;
      color: #D4A847;
      margin: 0 0 10px;
    }
    .player-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      color: #cbd5e1;
      font-size: 0.85rem;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .check-icon { color: #22c55e; font-size: 16px; flex-shrink: 0; }
    .bottom-actions {
      margin-top: auto;
      padding-top: 24px;
    }
    .continue-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
    .skip-btn {
      display: block;
      width: 100%;
      background: none;
      border: none;
      color: #64748b;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      padding: 14px;
      text-align: center;
    }
  `],
})
export class FplImportPage {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private http = inject(HttpClient);
  private watchlistService = inject(WatchlistService);

  teamId = '';
  loading = signal(false);
  error = signal('');
  importedPlayers = signal<{ id: number; name: string }[]>([]);

  constructor() {
    addIcons({ cloudDownload, chevronForward, checkmarkCircle });
  }

  async doImport() {
    if (!this.teamId) return;
    this.loading.set(true);
    this.error.set('');

    try {
      // Get current GW from bootstrap
      const bootstrap: any = await firstValueFrom(
        this.http.get('https://fantasy.premierleague.com/api/bootstrap-static/')
      );
      const currentGw = bootstrap.events?.find((e: any) => e.is_current)?.id || 1;
      const allPlayers: FplPlayer[] = bootstrap.elements || [];

      // Get picks
      const picks: any = await firstValueFrom(
        this.http.get(`https://fantasy.premierleague.com/api/entry/${this.teamId}/event/${currentGw}/picks/`)
      );

      const squad: FplPick[] = picks.picks || [];
      const posMap: Record<number, FplPosition> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

      const imported: { id: number; name: string }[] = [];

      for (const pick of squad) {
        const player = allPlayers.find(p => p.id === pick.element);
        if (player) {
          imported.push({ id: player.id, name: player.web_name });

          this.watchlistService.add({
            playerId: player.id,
            playerName: player.web_name,
            team: '',
            position: posMap[player.element_type] || 'MID',
            addedDate: new Date().toISOString().slice(0, 10),
            priceAtAdd: player.now_cost / 10,
            currentPrice: player.now_cost / 10,
            priceChange: 0,
            notes: 'Imported from FPL squad',
          });
        }
      }

      this.importedPlayers.set(imported);

      // Save FPL ID to profile
      const user = this.auth.currentUser;
      if (user) {
        await setDoc(doc(this.firestore, `users/${user.uid}/profile`, 'main'), {
          fplTeamId: this.teamId,
        }, { merge: true }).catch(() => {});
      }
    } catch (err: any) {
      console.error('FPL import error:', err);
      this.error.set('Could not import squad. Check your Team ID and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  completeOnboarding() {
    localStorage.setItem('onboarding_complete', 'true');
    const user = this.auth.currentUser;
    if (user) {
      setDoc(doc(this.firestore, `users/${user.uid}/profile`, 'main'), {
        onboardingComplete: true,
      }, { merge: true }).catch(() => {});
    }
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
