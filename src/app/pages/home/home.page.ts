import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonBadge, IonIcon, IonLabel, IonSegment,
  IonSegmentButton, IonRefresher, IonRefresherContent, IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, footballOutline, speedometer, time, trophy, arrowForward } from 'ionicons/icons';
import { FootballApiService } from '../../services/football-api.service';
import { F1ApiService } from '../../services/f1-api.service';
import { Fixture, Race } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonBadge, IonIcon, IonLabel, IonSegment,
    IonSegmentButton, IonRefresher, IonRefresherContent, IonChip,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>🏟 Sport Feed</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="px-4 pt-4 pb-2">
        <ion-segment [value]="segment" (ionChange)="segment = $any($event).detail.value">
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="football">
            <ion-icon name="football"></ion-icon>
            <ion-label>Football</ion-label>
          </ion-segment-button>
          <ion-segment-button value="f1">
            <ion-icon name="speedometer"></ion-icon>
            <ion-label>F1</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Football Upcoming -->
      @if (segment === 'all' || segment === 'football') {
        <div class="px-4">
          <h2 class="section-title">
            <ion-icon name="football" class="text-green-400"></ion-icon>
            Upcoming Fixtures
          </h2>
          @for (fix of upcomingFixtures; track fix.id) {
            <ion-card class="fixture-card">
              <ion-card-content>
                <div class="fixture-league">
                  <ion-chip color="medium" class="league-chip">{{ fix.league.name }}</ion-chip>
                  <span class="fixture-date">{{ fix.date | date:'EEE, MMM d · HH:mm' }}</span>
                </div>
                <div class="fixture-teams">
                  <div class="team">
                    <img [src]="fix.teams.home.logo" [alt]="fix.teams.home.name" class="team-logo" />
                    <span class="team-name">{{ fix.teams.home.name }}</span>
                  </div>
                  <div class="vs-badge">
                    @if (fix.status.short === 'FT') {
                      <span class="score">{{ fix.goals.home }} - {{ fix.goals.away }}</span>
                    } @else {
                      <span class="vs">VS</span>
                    }
                  </div>
                  <div class="team">
                    <img [src]="fix.teams.away.logo" [alt]="fix.teams.away.name" class="team-logo" />
                    <span class="team-name">{{ fix.teams.away.name }}</span>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }

      <!-- F1 Upcoming -->
      @if (segment === 'all' || segment === 'f1') {
        <div class="px-4">
          <h2 class="section-title">
            <ion-icon name="speedometer" class="text-red-400"></ion-icon>
            Upcoming Races
          </h2>
          @for (race of upcomingRaces; track race.round) {
            <ion-card class="race-card">
              <ion-card-content>
                <div class="race-header">
                  <ion-badge color="danger" class="round-badge">R{{ race.round }}</ion-badge>
                  <span class="race-date">{{ race.date | date:'EEE, MMM d' }}</span>
                </div>
                <div class="race-name">{{ race.raceName }}</div>
                <div class="race-circuit">{{ race.circuit.circuitName }}</div>
                <div class="race-location">📍 {{ race.circuit.location.locality }}, {{ race.circuit.location.country }}</div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }

      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .section-title {
      font-family: 'Sora', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 16px 0 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .fixture-card, .race-card {
      --background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px !important;
    }
    .fixture-league {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .league-chip { --background: #252530; font-size: 0.72rem; height: 24px; }
    .fixture-date, .race-date { font-size: 0.75rem; color: var(--text-muted); }
    .fixture-teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      gap: 6px;
    }
    .team-logo { width: 40px; height: 40px; object-fit: contain; }
    .team-name { font-size: 0.8rem; font-weight: 600; text-align: center; }
    .vs-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60px;
    }
    .vs { font-weight: 700; color: var(--text-muted); font-size: 0.85rem; }
    .score { font-weight: 800; font-size: 1.1rem; font-family: 'Sora', sans-serif; }
    .race-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .round-badge { font-weight: 700; font-size: 0.72rem; }
    .race-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 1rem; }
    .race-circuit { font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
    .race-location { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
    .bottom-spacer { height: 80px; }
  `],
})
export class HomePage implements OnInit {
  private footballApi = inject(FootballApiService);
  private f1Api = inject(F1ApiService);

  segment = 'all';
  upcomingFixtures: Fixture[] = [];
  upcomingRaces: Race[] = [];

  constructor() {
    addIcons({ football, footballOutline, speedometer, time, trophy, arrowForward });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.footballApi.getFixtures(undefined, 4).subscribe(f => this.upcomingFixtures = f);
    this.f1Api.getRaceCalendar().subscribe(r => this.upcomingRaces = r.slice(0, 5));
  }

  refresh(event: any) {
    this.loadData();
    setTimeout(() => event.target.complete(), 600);
  }
}
