import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonSegment, IonSegmentButton, IonLabel,
  IonButton, IonIcon, IonSelect, IonSelectOption, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { analytics, football, speedometer, swapHorizontal } from 'ionicons/icons';
import { AnalysisService, FootballAnalysis, DriverCircuitAnalysis } from '../../services/analysis.service';
import { FootballApiService } from '../../services/football-api.service';
import { F1ApiService } from '../../services/f1-api.service';
import { Team, Driver, Race } from '../../models';

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonSegment, IonSegmentButton, IonLabel,
    IonButton, IonIcon, IonSelect, IonSelectOption, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title><span style="font-family: Outfit, sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold)">📊 INSIGHTS</span></ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <ion-segment [value]="mode()" (ionChange)="mode.set($any($event).detail.value)">
          <ion-segment-button value="football">
            <ion-icon name="football"></ion-icon>
            <ion-label>Head-to-Head</ion-label>
          </ion-segment-button>
          <ion-segment-button value="f1">
            <ion-icon name="speedometer"></ion-icon>
            <ion-label>Driver Analysis</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Football H2H -->
      @if (mode() === 'football') {
        <div class="px-4 pt-4">
          <div class="select-row">
            <ion-select
              label="Home Team"
              label-placement="stacked"
              [value]="team1Id()"
              (ionChange)="team1Id.set($any($event).detail.value)"
              interface="action-sheet"
              class="team-select"
            >
              @for (team of teams(); track team.id) {
                <ion-select-option [value]="team.id">{{ team.name }}</ion-select-option>
              }
            </ion-select>

            <ion-icon name="swap-horizontal" class="swap-icon"></ion-icon>

            <ion-select
              label="Away Team"
              label-placement="stacked"
              [value]="team2Id()"
              (ionChange)="team2Id.set($any($event).detail.value)"
              interface="action-sheet"
              class="team-select"
            >
              @for (team of teams(); track team.id) {
                <ion-select-option [value]="team.id">{{ team.name }}</ion-select-option>
              }
            </ion-select>
          </div>

          <ion-button expand="block" class="mt-3" (click)="runFootballAnalysis()">
            Compare Teams
          </ion-button>

          @if (footballResult()) {
            <ion-card class="analysis-card mt-3">
              <ion-card-header>
                <ion-card-title>{{ footballResult()!.team1.name }} vs {{ footballResult()!.team2.name }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="stat-grid">
                  <div class="stat-item">
                    <span class="stat-value accent">{{ footballResult()!.team1Wins }}</span>
                    <span class="stat-label">{{ footballResult()!.team1.name }} Wins</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value muted">{{ footballResult()!.draws }}</span>
                    <span class="stat-label">Draws</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value accent">{{ footballResult()!.team2Wins }}</span>
                    <span class="stat-label">{{ footballResult()!.team2.name }} Wins</span>
                  </div>
                </div>
                <div class="detail-row">
                  <span>Total Goals</span>
                  <strong>{{ footballResult()!.totalGoals }}</strong>
                </div>
                <div class="detail-row">
                  <span>Avg Goals/Match</span>
                  <strong>{{ footballResult()!.avgGoals | number:'1.1-1' }}</strong>
                </div>
                <div class="detail-row">
                  <span>Matches Played</span>
                  <strong>{{ footballResult()!.h2h.length }}</strong>
                </div>

                <div class="form-section mt-3">
                  <div class="form-row">
                    <span class="form-label">{{ footballResult()!.team1.name }} Form</span>
                    <div class="form-badges">
                      @for (c of footballResult()!.team1Form.split(''); track $index) {
                        <ion-badge [color]="c === 'W' ? 'success' : c === 'D' ? 'warning' : 'danger'" class="form-badge">{{ c }}</ion-badge>
                      }
                    </div>
                  </div>
                  <div class="form-row">
                    <span class="form-label">{{ footballResult()!.team2.name }} Form</span>
                    <div class="form-badges">
                      @for (c of footballResult()!.team2Form.split(''); track $index) {
                        <ion-badge [color]="c === 'W' ? 'success' : c === 'D' ? 'warning' : 'danger'" class="form-badge">{{ c }}</ion-badge>
                      }
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }

      <!-- F1 Driver Circuit Analysis -->
      @if (mode() === 'f1') {
        <div class="px-4 pt-4">
          <ion-select
            label="Driver"
            label-placement="stacked"
            [value]="selectedDriver()"
            (ionChange)="selectedDriver.set($any($event).detail.value)"
            interface="action-sheet"
            class="mb-2"
          >
            @for (d of drivers(); track d.driverId) {
              <ion-select-option [value]="d.driverId">{{ d.givenName }} {{ d.familyName }}</ion-select-option>
            }
          </ion-select>

          <ion-select
            label="Circuit"
            label-placement="stacked"
            [value]="selectedCircuit()"
            (ionChange)="selectedCircuit.set($any($event).detail.value)"
            interface="action-sheet"
            class="mb-2"
          >
            @for (r of circuits(); track r.round) {
              <ion-select-option [value]="r.circuit.circuitId">{{ r.circuit.circuitName }}</ion-select-option>
            }
          </ion-select>

          <ion-button expand="block" class="mt-2" (click)="runDriverAnalysis()">
            Analyse Performance
          </ion-button>

          @if (driverResult()) {
            <ion-card class="analysis-card mt-3">
              <ion-card-header>
                <ion-card-title>{{ driverResult()!.driver.givenName }} {{ driverResult()!.driver.familyName }} @ {{ driverResult()!.circuitName }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div class="stat-grid">
                  <div class="stat-item">
                    <span class="stat-value accent">{{ driverResult()!.wins }}</span>
                    <span class="stat-label">Wins</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ driverResult()!.podiums }}</span>
                    <span class="stat-label">Podiums</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ driverResult()!.races }}</span>
                    <span class="stat-label">Races</span>
                  </div>
                </div>
                <div class="detail-row">
                  <span>Avg Position</span>
                  <strong>P{{ driverResult()!.avgPosition | number:'1.1-1' }}</strong>
                </div>
                <div class="detail-row">
                  <span>Best Finish</span>
                  <strong>P{{ driverResult()!.bestFinish }}</strong>
                </div>
                <div class="detail-row">
                  <span>Worst Finish</span>
                  <strong>P{{ driverResult()!.worstFinish }}</strong>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }

      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .select-row { display: flex; align-items: center; gap: 8px; }
    .team-select { flex: 1; }
    .swap-icon { font-size: 24px; color: var(--text-muted); }
    .analysis-card { --background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px !important; }
    .stat-grid { display: flex; justify-content: space-around; padding: 16px 0; border-bottom: 1px solid var(--card-border); }
    .stat-item { text-align: center; }
    .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; font-weight: 800; display: block; }
    .stat-value.accent { color: var(--accent-gold); }
    .stat-value.muted { color: var(--text-muted); }
    .stat-label { font-size: 0.7rem; color: var(--text-muted); }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--card-border); font-size: 0.85rem; }
    .detail-row span { color: var(--text-secondary); }
    .detail-row strong { color: var(--ion-text-color); }
    .form-section { padding-top: 8px; }
    .form-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
    .form-label { font-size: 0.78rem; color: var(--text-secondary); }
    .form-badges { display: flex; gap: 4px; }
    .form-badge { font-size: 0.65rem; font-weight: 700; min-width: 22px; text-align: center; }
    .bottom-spacer { height: 80px; }
  `],
})
export class AnalysisPage {
  private analysisService = inject(AnalysisService);
  private footballApi = inject(FootballApiService);
  private f1Api = inject(F1ApiService);

  mode = signal<string>('football');
  teams = signal<Team[]>([]);
  team1Id = signal<number>(33);
  team2Id = signal<number>(40);
  footballResult = signal<FootballAnalysis | null>(null);

  drivers = signal<Driver[]>([]);
  circuits = signal<Race[]>([]);
  selectedDriver = signal<string>('max_verstappen');
  selectedCircuit = signal<string>('albert_park');
  driverResult = signal<DriverCircuitAnalysis | null>(null);

  constructor() {
    addIcons({ analytics, football, speedometer, swapHorizontal });
    this.footballApi.getTeams(39).subscribe(t => this.teams.set(t));
    this.f1Api.getDrivers().subscribe(d => this.drivers.set(d));
    this.f1Api.getRaceCalendar().subscribe(r => this.circuits.set(r));
  }

  runFootballAnalysis() {
    this.analysisService.getFootballH2H(this.team1Id(), this.team2Id())
      .subscribe(r => this.footballResult.set(r));
  }

  runDriverAnalysis() {
    this.analysisService.getDriverCircuitAnalysis(this.selectedDriver(), this.selectedCircuit())
      .subscribe(r => this.driverResult.set(r));
  }
}
