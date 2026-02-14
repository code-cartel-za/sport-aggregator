import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon, IonChip,
  IonRefresher, IonRefresherContent, IonList, IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, trophy, calendar, list } from 'ionicons/icons';
import { FootballApiService } from '../../services/football-api.service';
import { Fixture, League, Standing } from '../../models';

@Component({
  selector: 'app-football',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon, IonChip,
    IonRefresher, IonRefresherContent, IonList, IonItem,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title><span class="page-title">⚽ FOOTBALL</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- League selector -->
      <div class="px-4 pt-3 pb-1 league-scroll">
        @for (league of leagues(); track league.id) {
          <ion-chip
            [class.active-league]="selectedLeague() === league.id"
            (click)="selectLeague(league.id)"
          >
            <img [src]="league.logo" class="league-logo-chip" />
            <ion-label>{{ league.name }}</ion-label>
          </ion-chip>
        }
      </div>

      <div class="px-4 pt-1">
        <ion-segment [value]="tab()" (ionChange)="tab.set($any($event).detail.value)">
          <ion-segment-button value="fixtures">
            <ion-icon name="calendar"></ion-icon>
            <ion-label>Fixtures</ion-label>
          </ion-segment-button>
          <ion-segment-button value="results">
            <ion-icon name="football"></ion-icon>
            <ion-label>Results</ion-label>
          </ion-segment-button>
          <ion-segment-button value="standings">
            <ion-icon name="trophy"></ion-icon>
            <ion-label>Table</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Fixtures tab -->
      @if (tab() === 'fixtures') {
        <div class="px-4 pt-2">
          @for (fix of fixtures(); track fix.id) {
            <ion-card class="fixture-card">
              <ion-card-content>
                <div class="match-date">{{ fix.date | date:'EEE, MMM d · HH:mm' }}</div>
                <div class="match-row">
                  <div class="match-team">
                    <img [src]="fix.teams.home.logo" class="team-logo-sm" />
                    <span>{{ fix.teams.home.name }}</span>
                  </div>
                  <span class="match-vs">VS</span>
                  <div class="match-team right">
                    <span>{{ fix.teams.away.name }}</span>
                    <img [src]="fix.teams.away.logo" class="team-logo-sm" />
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          } @empty {
            <div class="empty-state">No upcoming fixtures</div>
          }
        </div>
      }

      <!-- Results tab -->
      @if (tab() === 'results') {
        <div class="px-4 pt-2">
          @for (fix of results(); track fix.id) {
            <ion-card class="fixture-card">
              <ion-card-content>
                <div class="match-date">{{ fix.date | date:'EEE, MMM d' }}</div>
                <div class="match-row">
                  <div class="match-team">
                    <img [src]="fix.teams.home.logo" class="team-logo-sm" />
                    <span>{{ fix.teams.home.name }}</span>
                  </div>
                  <span class="match-score">{{ fix.goals.home }} - {{ fix.goals.away }}</span>
                  <div class="match-team right">
                    <span>{{ fix.teams.away.name }}</span>
                    <img [src]="fix.teams.away.logo" class="team-logo-sm" />
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          } @empty {
            <div class="empty-state">No recent results</div>
          }
        </div>
      }

      <!-- Standings tab -->
      @if (tab() === 'standings') {
        <div class="px-4 pt-2">
          <div class="standings-table">
            <div class="standings-header">
              <span class="col-pos">#</span>
              <span class="col-team">Team</span>
              <span class="col-stat">P</span>
              <span class="col-stat">W</span>
              <span class="col-stat">D</span>
              <span class="col-stat">L</span>
              <span class="col-stat">GD</span>
              <span class="col-pts">Pts</span>
            </div>
            @for (row of standings(); track row.rank) {
              <div class="standings-row" [class.top-4]="row.rank <= 4">
                <span class="col-pos">{{ row.rank }}</span>
                <span class="col-team">
                  <img [src]="row.team.logo" class="team-logo-xs" />
                  {{ row.team.name }}
                </span>
                <span class="col-stat">{{ row.played }}</span>
                <span class="col-stat">{{ row.win }}</span>
                <span class="col-stat">{{ row.draw }}</span>
                <span class="col-stat">{{ row.lose }}</span>
                <span class="col-stat">{{ row.goalsDiff > 0 ? '+' : '' }}{{ row.goalsDiff }}</span>
                <span class="col-pts">{{ row.points }}</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .league-scroll {
      display: flex;
      overflow-x: auto;
      gap: 6px;
      padding-bottom: 4px;
      &::-webkit-scrollbar { display: none; }
    }
    .league-logo-chip { width: 18px; height: 18px; margin-right: 4px; }
    .active-league { --background: var(--accent-gold); --color: var(--bg); }
    .fixture-card { --background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px !important; margin: 6px 0; }
    .match-date { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 8px; }
    .match-row { display: flex; align-items: center; justify-content: space-between; }
    .match-team { display: flex; align-items: center; gap: 8px; flex: 1; font-size: 0.85rem; font-weight: 600; }
    .match-team.right { justify-content: flex-end; text-align: right; }
    .team-logo-sm { width: 28px; height: 28px; object-fit: contain; }
    .team-logo-xs { width: 20px; height: 20px; object-fit: contain; margin-right: 6px; }
    .match-vs { font-weight: 700; color: var(--text-muted); font-size: 0.8rem; min-width: 40px; text-align: center; }
    .match-score { font-weight: 800; font-size: 1rem; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: center; }
    .standings-table { font-size: 0.78rem; }
    .standings-header {
      display: flex; padding: 8px 0; border-bottom: 1px solid var(--card-border);
      font-weight: 700; color: var(--text-muted); font-size: 0.7rem;
    }
    .standings-row {
      display: flex; padding: 10px 0; border-bottom: 1px solid var(--card-border);
      align-items: center;
    }
    .standings-row.top-4 { border-left: 3px solid var(--success); padding-left: 6px; }
    .col-pos { width: 24px; text-align: center; font-weight: 700; }
    .col-team { flex: 1; display: flex; align-items: center; font-weight: 600; }
    .col-stat { width: 28px; text-align: center; color: var(--text-secondary); }
    .col-pts { width: 32px; text-align: center; font-weight: 800; color: var(--accent-gold); font-family: 'JetBrains Mono', monospace; }
    .empty-state { text-align: center; padding: 40px 16px; color: var(--text-muted); }
    .bottom-spacer { height: 80px; }
  `],
})
export class FootballPage implements OnInit {
  private api = inject(FootballApiService);

  leagues = signal<League[]>([]);
  selectedLeague = signal<number>(39);
  tab = signal<string>('fixtures');
  fixtures = signal<Fixture[]>([]);
  results = signal<Fixture[]>([]);
  standings = signal<Standing[]>([]);

  constructor() {
    addIcons({ football, trophy, calendar, list });
  }

  ngOnInit() {
    this.api.getLeagues().subscribe(l => this.leagues.set(l));
    this.loadLeagueData();
  }

  selectLeague(id: number) {
    this.selectedLeague.set(id);
    this.loadLeagueData();
  }

  loadLeagueData() {
    const lid = this.selectedLeague();
    this.api.getFixtures(lid, 10).subscribe(f => this.fixtures.set(f));
    this.api.getResults(lid, 10).subscribe(r => this.results.set(r));
    this.api.getStandings(lid).subscribe(s => this.standings.set(s));
  }

  refresh(event: any) {
    this.loadLeagueData();
    setTimeout(() => event.target.complete(), 600);
  }
}
