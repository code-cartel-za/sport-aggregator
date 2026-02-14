import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronForward } from 'ionicons/icons';
import { Firestore, doc, setDoc, collection, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { WatchlistService } from '../../services/watchlist.service';
import { WatchlistItem, FplPosition } from '../../models';

interface TeamCard {
  id: string;
  name: string;
  shortName: string;
  crest: string;
  type: 'pl' | 'f1';
}

const PL_TEAMS: TeamCard[] = [
  { id: 'ARS', name: 'Arsenal', shortName: 'ARS', crest: 'https://media.api-sports.io/football/teams/42.png', type: 'pl' },
  { id: 'AVL', name: 'Aston Villa', shortName: 'AVL', crest: 'https://media.api-sports.io/football/teams/66.png', type: 'pl' },
  { id: 'BOU', name: 'Bournemouth', shortName: 'BOU', crest: 'https://media.api-sports.io/football/teams/35.png', type: 'pl' },
  { id: 'BRE', name: 'Brentford', shortName: 'BRE', crest: 'https://media.api-sports.io/football/teams/55.png', type: 'pl' },
  { id: 'BHA', name: 'Brighton', shortName: 'BHA', crest: 'https://media.api-sports.io/football/teams/51.png', type: 'pl' },
  { id: 'CHE', name: 'Chelsea', shortName: 'CHE', crest: 'https://media.api-sports.io/football/teams/49.png', type: 'pl' },
  { id: 'CRY', name: 'Crystal Palace', shortName: 'CRY', crest: 'https://media.api-sports.io/football/teams/52.png', type: 'pl' },
  { id: 'EVE', name: 'Everton', shortName: 'EVE', crest: 'https://media.api-sports.io/football/teams/45.png', type: 'pl' },
  { id: 'FUL', name: 'Fulham', shortName: 'FUL', crest: 'https://media.api-sports.io/football/teams/36.png', type: 'pl' },
  { id: 'IPS', name: 'Ipswich Town', shortName: 'IPS', crest: 'https://media.api-sports.io/football/teams/57.png', type: 'pl' },
  { id: 'LEI', name: 'Leicester City', shortName: 'LEI', crest: 'https://media.api-sports.io/football/teams/46.png', type: 'pl' },
  { id: 'LIV', name: 'Liverpool', shortName: 'LIV', crest: 'https://media.api-sports.io/football/teams/40.png', type: 'pl' },
  { id: 'MCI', name: 'Man City', shortName: 'MCI', crest: 'https://media.api-sports.io/football/teams/50.png', type: 'pl' },
  { id: 'MUN', name: 'Man United', shortName: 'MUN', crest: 'https://media.api-sports.io/football/teams/33.png', type: 'pl' },
  { id: 'NEW', name: 'Newcastle', shortName: 'NEW', crest: 'https://media.api-sports.io/football/teams/34.png', type: 'pl' },
  { id: 'NFO', name: "Nott'm Forest", shortName: 'NFO', crest: 'https://media.api-sports.io/football/teams/65.png', type: 'pl' },
  { id: 'SOU', name: 'Southampton', shortName: 'SOU', crest: 'https://media.api-sports.io/football/teams/41.png', type: 'pl' },
  { id: 'TOT', name: 'Tottenham', shortName: 'TOT', crest: 'https://media.api-sports.io/football/teams/47.png', type: 'pl' },
  { id: 'WHU', name: 'West Ham', shortName: 'WHU', crest: 'https://media.api-sports.io/football/teams/48.png', type: 'pl' },
  { id: 'WOL', name: 'Wolves', shortName: 'WOL', crest: 'https://media.api-sports.io/football/teams/39.png', type: 'pl' },
];

const F1_CONSTRUCTORS: TeamCard[] = [
  { id: 'red_bull', name: 'Red Bull Racing', shortName: 'RBR', crest: '', type: 'f1' },
  { id: 'ferrari', name: 'Ferrari', shortName: 'FER', crest: '', type: 'f1' },
  { id: 'mercedes', name: 'Mercedes', shortName: 'MER', crest: '', type: 'f1' },
  { id: 'mclaren', name: 'McLaren', shortName: 'MCL', crest: '', type: 'f1' },
  { id: 'aston_martin', name: 'Aston Martin', shortName: 'AMR', crest: '', type: 'f1' },
  { id: 'alpine', name: 'Alpine', shortName: 'ALP', crest: '', type: 'f1' },
  { id: 'williams', name: 'Williams', shortName: 'WIL', crest: '', type: 'f1' },
  { id: 'haas', name: 'Haas', shortName: 'HAA', crest: '', type: 'f1' },
  { id: 'rb', name: 'RB', shortName: 'RB', crest: '', type: 'f1' },
  { id: 'sauber', name: 'Sauber', shortName: 'SAU', crest: '', type: 'f1' },
];

@Component({
  selector: 'app-favourite-team',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, IonSpinner],
  template: `
    <ion-content fullscreen class="fav-content">
      <div class="fav-wrapper">

        <div class="header">
          <h1>Pick your team</h1>
          <p>Choose your favourite — we'll personalise your feed. You can skip this.</p>
        </div>

        @if (showPl()) {
          <h3 class="section-label">Premier League</h3>
          <div class="team-grid">
            @for (team of plTeams; track team.id) {
              <button class="team-card" [class.selected]="selectedPl() === team.id" (click)="selectedPl.set(team.id)">
                <img [src]="team.crest" [alt]="team.name" class="team-crest" loading="lazy" />
                <span class="team-name">{{ team.shortName }}</span>
                @if (selectedPl() === team.id) {
                  <ion-icon name="checkmark-circle" class="check"></ion-icon>
                }
              </button>
            }
          </div>
        }

        @if (showF1()) {
          <h3 class="section-label">F1 Constructors</h3>
          <div class="team-grid f1-grid">
            @for (team of f1Teams; track team.id) {
              <button class="team-card f1-card" [class.selected]="selectedF1() === team.id" (click)="selectedF1.set(team.id)">
                <span class="f1-emoji">🏎️</span>
                <span class="team-name">{{ team.name }}</span>
                @if (selectedF1() === team.id) {
                  <ion-icon name="checkmark-circle" class="check"></ion-icon>
                }
              </button>
            }
          </div>
        }

        <div class="bottom-actions">
          <ion-button expand="block" class="continue-btn" (click)="proceed()">
            {{ hasSelection() ? 'Continue' : 'Skip' }}
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .fav-content { --background: #060D18; }
    .fav-wrapper {
      padding: 48px 20px 32px;
      max-width: 480px;
      margin: 0 auto;
    }
    .header { text-align: center; margin-bottom: 28px; }
    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #e2e8f0;
      margin: 0 0 8px;
    }
    .header p { color: #64748b; font-size: 0.88rem; margin: 0; }
    .section-label {
      font-family: 'Outfit', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 20px 0 10px;
    }
    .team-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .f1-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .team-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 4px;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      color: #e2e8f0;
    }
    .team-card.selected {
      border-color: #D4A847;
      background: rgba(212, 168, 71, 0.08);
    }
    .team-crest { width: 36px; height: 36px; object-fit: contain; }
    .f1-emoji { font-size: 28px; }
    .team-name { font-size: 0.7rem; font-family: 'Outfit', sans-serif; font-weight: 600; }
    .f1-card .team-name { font-size: 0.75rem; }
    .check {
      position: absolute;
      top: 4px;
      right: 4px;
      font-size: 16px;
      color: #D4A847;
    }
    .bottom-actions {
      margin-top: 28px;
      max-width: 360px;
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }
    .continue-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
  `],
})
export class FavouriteTeamPage {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private watchlistService = inject(WatchlistService);

  plTeams = PL_TEAMS;
  f1Teams = F1_CONSTRUCTORS;

  selectedPl = signal<string | null>(null);
  selectedF1 = signal<string | null>(null);

  private pref = localStorage.getItem('sport_preference') || 'both';
  showPl = computed(() => this.pref === 'fpl' || this.pref === 'both');
  showF1 = computed(() => this.pref === 'f1' || this.pref === 'both');
  hasSelection = computed(() => !!this.selectedPl() || !!this.selectedF1());

  constructor() {
    addIcons({ checkmarkCircle, chevronForward });
  }

  async proceed() {
    const user = this.auth.currentUser;

    if (user && this.hasSelection()) {
      try {
        await setDoc(doc(this.firestore, `users/${user.uid}/profile`, 'main'), {
          favouritePlTeam: this.selectedPl(),
          favouriteF1Constructor: this.selectedF1(),
        }, { merge: true });
      } catch { /* fallback */ }
    }

    // Navigate to FPL import or home
    if (this.pref === 'fpl' || this.pref === 'both') {
      this.router.navigateByUrl('/fpl-import', { replaceUrl: true });
    } else {
      this.completeOnboarding();
    }
  }

  private completeOnboarding() {
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
