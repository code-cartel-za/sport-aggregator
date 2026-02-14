import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, speedometer, arrowUp, arrowDown } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { FantasyProjection, F1FantasyProjection } from '../../models';

@Component({
  selector: 'app-projections',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">POINTS PROJECTOR</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <ion-segment [value]="mode()" (ionChange)="mode.set($any($event).detail.value)">
          <ion-segment-button value="fpl"><ion-icon name="football"></ion-icon><ion-label>FPL</ion-label></ion-segment-button>
          <ion-segment-button value="f1"><ion-icon name="speedometer"></ion-icon><ion-label>F1</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      @if (mode() === 'fpl') {
        <div class="px-4 pt-3">
          @for (proj of fplProjections(); track proj.playerId; let i = $index) {
            <div class="proj-card animate-fade-in" [style.animation-delay]="(i * 0.04) + 's'">
              <div class="proj-header">
                <div class="proj-rank">{{ i + 1 }}</div>
                <div class="proj-info">
                  <div class="proj-name">{{ proj.playerName }}</div>
                  <div class="proj-meta">
                    <ion-badge class="pos-badge" [class]="'pos-' + proj.position.toLowerCase()">{{ proj.position }}</ion-badge>
                    <span class="proj-team">{{ proj.team }}</span>
                  </div>
                </div>
                <div class="proj-points-col">
                  <div class="proj-points">{{ proj.projectedPoints }}</div>
                  <div class="proj-pts-label">pts</div>
                </div>
              </div>
              <div class="confidence-row">
                <span class="conf-label">Confidence</span>
                <div class="conf-bar-bg"><div class="conf-bar" [style.width.%]="proj.confidence" [class]="getConfClass(proj.confidence)"></div></div>
                <span class="conf-pct">{{ proj.confidence }}%</span>
              </div>
              <div class="breakdown-grid">
                <div class="bd-item" *ngIf="proj.breakdown.goals > 0"><span class="bd-label">Goals</span><span class="bd-val positive">+{{ proj.breakdown.goals }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.assists > 0"><span class="bd-label">Assists</span><span class="bd-val positive">+{{ proj.breakdown.assists }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.cleanSheet > 0"><span class="bd-label">CS</span><span class="bd-val positive">+{{ proj.breakdown.cleanSheet }}</span></div>
                <div class="bd-item"><span class="bd-label">Minutes</span><span class="bd-val">+{{ proj.breakdown.minutes }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.bonus > 0"><span class="bd-label">Bonus</span><span class="bd-val positive">+{{ proj.breakdown.bonus }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.saves > 0"><span class="bd-label">Saves</span><span class="bd-val positive">+{{ proj.breakdown.saves }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.yellowCards < 0"><span class="bd-label">YC</span><span class="bd-val negative">{{ proj.breakdown.yellowCards }}</span></div>
              </div>
            </div>
          }
        </div>
      }

      @if (mode() === 'f1') {
        <div class="px-4 pt-3">
          @for (proj of f1Projections(); track proj.driverId; let i = $index) {
            <div class="proj-card animate-fade-in" [style.animation-delay]="(i * 0.04) + 's'">
              <div class="proj-header">
                <div class="proj-rank">{{ i + 1 }}</div>
                <div class="proj-info">
                  <div class="proj-name">{{ proj.driverName }}</div>
                  <div class="proj-meta"><span class="proj-team">{{ proj.team }}</span></div>
                </div>
                <div class="proj-points-col">
                  <div class="proj-points">{{ proj.projectedPoints }}</div>
                  <div class="proj-pts-label">pts</div>
                </div>
              </div>
              <div class="confidence-row">
                <span class="conf-label">Confidence</span>
                <div class="conf-bar-bg"><div class="conf-bar" [style.width.%]="proj.confidence" [class]="getConfClass(proj.confidence)"></div></div>
                <span class="conf-pct">{{ proj.confidence }}%</span>
              </div>
              <div class="breakdown-grid">
                <div class="bd-item"><span class="bd-label">Race</span><span class="bd-val positive">+{{ proj.breakdown.racePosition }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.qualifyingBonus > 0"><span class="bd-label">Quali</span><span class="bd-val positive">+{{ proj.breakdown.qualifyingBonus }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.beatTeammate > 0"><span class="bd-label">Beat TM</span><span class="bd-val positive">+{{ proj.breakdown.beatTeammate }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.positionsGained > 0"><span class="bd-label">Pos Gain</span><span class="bd-val positive">+{{ proj.breakdown.positionsGained }}</span></div>
                <div class="bd-item" *ngIf="proj.breakdown.dnfPenalty < 0"><span class="bd-label">DNF Risk</span><span class="bd-val negative">{{ proj.breakdown.dnfPenalty }}</span></div>
              </div>
            </div>
          }
        </div>
      }
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .proj-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
    .proj-header { display: flex; align-items: center; gap: 12px; }
    .proj-rank { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); width: 20px; text-align: center; }
    .proj-info { flex: 1; }
    .proj-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
    .proj-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .proj-team { font-size: 0.7rem; color: var(--text-secondary); }
    .pos-badge { font-size: 0.55rem; font-weight: 700; padding: 1px 5px; --background: var(--surface-elevated); --color: var(--text-secondary); }
    .pos-gk { --background: #F59E0B20; --color: #F59E0B; }
    .pos-def { --background: #00D68F20; --color: #00D68F; }
    .pos-mid { --background: #3B82F620; --color: #3B82F6; }
    .pos-fwd { --background: #EF444420; --color: #EF4444; }
    .proj-points-col { text-align: right; }
    .proj-points { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 800; color: var(--accent-gold); }
    .proj-pts-label { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); letter-spacing: 0.05em; }

    .confidence-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
    .conf-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); width: 70px; }
    .conf-bar-bg { flex: 1; height: 4px; background: var(--surface-elevated); border-radius: 2px; overflow: hidden; }
    .conf-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
    .conf-bar.high { background: var(--success); }
    .conf-bar.medium { background: var(--warning); }
    .conf-bar.low { background: var(--danger); }
    .conf-pct { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-secondary); width: 32px; text-align: right; }

    .breakdown-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .bd-item { background: var(--surface-elevated); border-radius: 6px; padding: 4px 8px; display: flex; gap: 4px; align-items: center; }
    .bd-label { font-size: 0.6rem; color: var(--text-muted); }
    .bd-val { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); }
    .bd-val.positive { color: var(--success); }
    .bd-val.negative { color: var(--danger); }
  `],
})
export class ProjectionsPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  mode = signal('fpl');
  fplProjections = signal<FantasyProjection[]>([]);
  f1Projections = signal<F1FantasyProjection[]>([]);

  constructor() { addIcons({ football, speedometer, arrowUp, arrowDown }); }

  ngOnInit() {
    this.projService.getProjections().subscribe(p => this.fplProjections.set(p.sort((a, b) => b.projectedPoints - a.projectedPoints)));
    this.projService.getF1Projections().subscribe(p => this.f1Projections.set(p.sort((a, b) => b.projectedPoints - a.projectedPoints)));
  }

  getConfClass(confidence: number): string {
    return confidence >= 75 ? 'high' : confidence >= 50 ? 'medium' : 'low';
  }
}
