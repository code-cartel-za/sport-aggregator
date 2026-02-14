import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon,
  IonRefresher, IonRefresherContent, IonSkeletonText, IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { speedometer, trophy, flag, people, alertCircle, carSportOutline } from 'ionicons/icons';
import { F1ApiService } from '../../services/f1-api.service';
import { Race, DriverStanding, ConstructorStanding } from '../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-f1',
  standalone: true,
  imports: [
    CommonModule, DatePipe,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonSegment, IonSegmentButton, IonLabel, IonBadge, IonIcon,
    IonRefresher, IonRefresherContent, IonSkeletonText, IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title><span class="page-title">🏎 FORMULA 1</span></ion-title>
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

      @if (error()) {
        <div class="px-4 pt-2">
          <div class="error-state">
            <ion-icon name="alert-circle" class="error-icon"></ion-icon>
            <h3>Something went wrong</h3>
            <p>{{ error() }}</p>
            <ion-button fill="outline" size="small" (click)="loadData()">Try Again</ion-button>
          </div>
        </div>
      } @else {

      <!-- Race Calendar -->
      @if (tab() === 'calendar') {
        <div class="px-4 pt-2">
          @if (isLoading()) {
            @for (n of [1,2,3,4]; track n) {
              <div class="skeleton-card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px">
                  <ion-skeleton-text [animated]="true" style="width: 40px; height: 14px; border-radius: 4px"></ion-skeleton-text>
                  <ion-skeleton-text [animated]="true" style="width: 80px; height: 12px; border-radius: 4px"></ion-skeleton-text>
                </div>
                <ion-skeleton-text [animated]="true" style="width: 70%; height: 16px; border-radius: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 50%; height: 12px; border-radius: 4px; margin-top: 6px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 40%; height: 10px; border-radius: 4px; margin-top: 6px"></ion-skeleton-text>
              </div>
            }
          } @else if (races().length === 0) {
            <div class="empty-state">
              <ion-icon name="car-sport-outline" class="empty-icon"></ion-icon>
              <h3>No race data available</h3>
              <p>Sync data first to see the race calendar</p>
            </div>
          } @else {
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
            }
          }
        </div>
      }

      <!-- Driver Standings -->
      @if (tab() === 'drivers') {
        <div class="px-4 pt-2">
          @if (isLoading()) {
            @for (n of [1,2,3,4,5,6]; track n) {
              <div style="display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border)">
                <ion-skeleton-text [animated]="true" style="width: 28px; height: 16px; border-radius: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 4px; height: 36px; border-radius: 2px"></ion-skeleton-text>
                <div style="flex: 1">
                  <ion-skeleton-text [animated]="true" style="width: 60%; height: 14px; border-radius: 4px"></ion-skeleton-text>
                  <ion-skeleton-text [animated]="true" style="width: 40%; height: 10px; border-radius: 4px; margin-top: 4px"></ion-skeleton-text>
                </div>
                <ion-skeleton-text [animated]="true" style="width: 40px; height: 18px; border-radius: 4px"></ion-skeleton-text>
              </div>
            }
          } @else if (driverStandings().length === 0) {
            <div class="empty-state">
              <ion-icon name="people" class="empty-icon"></ion-icon>
              <h3>No driver standings</h3>
              <p>Sync data first to see driver standings</p>
            </div>
          } @else {
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
          }
        </div>
      }

      <!-- Constructor Standings -->
      @if (tab() === 'constructors') {
        <div class="px-4 pt-2">
          @if (isLoading()) {
            @for (n of [1,2,3,4,5]; track n) {
              <div style="display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border)">
                <ion-skeleton-text [animated]="true" style="width: 28px; height: 16px; border-radius: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 4px; height: 36px; border-radius: 2px"></ion-skeleton-text>
                <div style="flex: 1">
                  <ion-skeleton-text [animated]="true" style="width: 50%; height: 14px; border-radius: 4px"></ion-skeleton-text>
                  <ion-skeleton-text [animated]="true" style="width: 30%; height: 10px; border-radius: 4px; margin-top: 4px"></ion-skeleton-text>
                </div>
                <ion-skeleton-text [animated]="true" style="width: 40px; height: 18px; border-radius: 4px"></ion-skeleton-text>
              </div>
            }
          } @else if (constructorStandings().length === 0) {
            <div class="empty-state">
              <ion-icon name="speedometer" class="empty-icon"></ion-icon>
              <h3>No team standings</h3>
              <p>Sync data first to see constructor standings</p>
            </div>
          } @else {
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
          }
        </div>
      }

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

    .bottom-spacer { height: 80px; }
  `],
})
export class F1Page implements OnInit {
  private api = inject(F1ApiService);

  tab = signal<string>('calendar');
  races = signal<Race[]>([]);
  driverStandings = signal<DriverStanding[]>([]);
  constructorStandings = signal<ConstructorStanding[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    addIcons({ speedometer, trophy, flag, people, alertCircle, carSportOutline });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    forkJoin({
      races: this.api.getRaceCalendar(),
      drivers: this.api.getDriverStandings(),
      constructors: this.api.getConstructorStandings(),
    }).subscribe({
      next: (data) => {
        this.races.set(data.races);
        this.driverStandings.set(data.drivers);
        this.constructorStandings.set(data.constructors);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load F1 data');
        this.isLoading.set(false);
      },
    });
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
