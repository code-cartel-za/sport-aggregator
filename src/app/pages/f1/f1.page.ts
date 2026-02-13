import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon,
  IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { speedometer, trophy, flag, people } from 'ionicons/icons';
import { F1ApiService } from '../../services/f1-api.service';
import { Race, DriverStanding, ConstructorStanding } from '../../models';

@Component({
  selector: 'app-f1',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon,
    IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title><span style="font-family: Outfit, sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold)">🏎 FORMULA 1</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="px-4 pt-3">
        <ion-segment [value]="tab()" (ionChange)="tab.set($any($event).detail.value)">
          <ion-segment-button value="calendar">
            <ion-icon name="flag"></ion-icon>
            <ion-label>Calendar</ion-label>
          </ion-segment-button>
          <ion-segment-button value="drivers">
            <ion-icon name="people"></ion-icon>
            <ion-label>Drivers</ion-label>
          </ion-segment-button>
          <ion-segment-button value="constructors">
            <ion-icon name="speedometer"></ion-icon>
            <ion-label>Teams</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Race Calendar -->
      @if (tab() === 'calendar') {
        <div class="px-4 pt-2">
          @for (race of races(); track race.round) {
            <ion-card class="race-card">
              <ion-card-content>
                <div class="race-header">
                  <ion-badge [style.--background]="getRoundColor(+race.round)" class="round-badge">
                    R{{ race.round }}
                  </ion-badge>
                  <span class="race-date">{{ race.date | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="race-name">{{ race.raceName }}</div>
                <div class="race-circuit">{{ race.circuit.circuitName }}</div>
                <div class="race-location">📍 {{ race.circuit.location.locality }}, {{ race.circuit.location.country }}</div>
              </ion-card-content>
            </ion-card>
          } @empty {
            <div class="empty-state">Loading race calendar...</div>
          }
        </div>
      }

      <!-- Driver Standings -->
      @if (tab() === 'drivers') {
        <div class="px-4 pt-2">
          @for (ds of driverStandings(); track ds.driver.driverId) {
            <div class="driver-row">
              <span class="driver-pos" [class.podium]="(+ds.position) <= 3">{{ ds.position }}</span>
              <div class="driver-color-bar" [style.background]="ds.constructors[0]?.color ?? '#666'"></div>
              <div class="driver-info">
                <span class="driver-name">{{ ds.driver.givenName }} <strong>{{ ds.driver.familyName }}</strong></span>
                <span class="driver-team">{{ ds.constructors[0]?.name }}</span>
              </div>
              <div class="driver-stats">
                <span class="driver-points">{{ ds.points }}</span>
                <span class="driver-wins">{{ ds.wins }}W</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Constructor Standings -->
      @if (tab() === 'constructors') {
        <div class="px-4 pt-2">
          @for (cs of constructorStandings(); track cs.constructor.constructorId) {
            <div class="constructor-row">
              <span class="con-pos">{{ cs.position }}</span>
              <div class="con-color-bar" [style.background]="cs.constructor.color ?? '#666'"></div>
              <div class="con-info">
                <span class="con-name">{{ cs.constructor.name }}</span>
                <span class="con-nat">{{ cs.constructor.nationality }}</span>
              </div>
              <div class="con-stats">
                <span class="con-points">{{ cs.points }}</span>
                <span class="con-wins">{{ cs.wins }}W</span>
              </div>
            </div>
          }
        </div>
      }

      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .race-card { --background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px !important; margin: 6px 0; }
    .race-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .round-badge { font-weight: 700; font-size: 0.72rem; --background: #E8002D; }
    .race-date { font-size: 0.75rem; color: var(--text-muted); }
    .race-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1rem; }
    .race-circuit { font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
    .race-location { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }

    .driver-row, .constructor-row {
      display: flex; align-items: center; gap: 10px; padding: 12px 0;
      border-bottom: 1px solid var(--card-border);
    }
    .driver-pos, .con-pos {
      width: 28px; text-align: center; font-weight: 800; font-family: 'Outfit', sans-serif;
      font-size: 0.9rem; color: var(--text-muted);
    }
    .driver-pos.podium { color: #FFD700; }
    .driver-color-bar, .con-color-bar { width: 4px; height: 36px; border-radius: 2px; }
    .driver-info, .con-info { flex: 1; display: flex; flex-direction: column; }
    .driver-name, .con-name { font-size: 0.9rem; font-weight: 500; }
    .driver-name strong { font-weight: 800; }
    .driver-team, .con-nat { font-size: 0.72rem; color: var(--text-muted); }
    .driver-stats, .con-stats { text-align: right; }
    .driver-points, .con-points { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1rem; color: var(--accent-gold); display: block; }
    .driver-wins, .con-wins { font-size: 0.68rem; color: var(--text-muted); }

    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .bottom-spacer { height: 80px; }
  `],
})
export class F1Page implements OnInit {
  private api = inject(F1ApiService);

  tab = signal<string>('calendar');
  races = signal<Race[]>([]);
  driverStandings = signal<DriverStanding[]>([]);
  constructorStandings = signal<ConstructorStanding[]>([]);

  constructor() {
    addIcons({ speedometer, trophy, flag, people });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getRaceCalendar().subscribe(r => this.races.set(r));
    this.api.getDriverStandings().subscribe(d => this.driverStandings.set(d));
    this.api.getConstructorStandings().subscribe(c => this.constructorStandings.set(c));
  }

  getRoundColor(round: number): string {
    const colors = ['#E8002D', '#FF8000', '#3671C6', '#27F4D2', '#6692FF', '#B6BABD'];
    return colors[(round - 1) % colors.length];
  }

  refresh(event: any) {
    this.loadData();
    setTimeout(() => event.target.complete(), 600);
  }
}
