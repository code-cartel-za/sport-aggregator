import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, trendingDown, remove } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { FantasyPlayer, FplPosition } from '../../models';

@Component({
  selector: 'app-form-tracker',
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
        <ion-title><span class="page-title">FORM TRACKER</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <ion-segment [value]="filter()" (ionChange)="filter.set($any($event).detail.value)">
          <ion-segment-button value="ALL"><ion-label>All</ion-label></ion-segment-button>
          <ion-segment-button value="GK"><ion-label>GK</ion-label></ion-segment-button>
          <ion-segment-button value="DEF"><ion-label>DEF</ion-label></ion-segment-button>
          <ion-segment-button value="MID"><ion-label>MID</ion-label></ion-segment-button>
          <ion-segment-button value="FWD"><ion-label>FWD</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      <div class="px-4 pt-3">
        @for (player of filteredPlayers(); track player.id; let i = $index) {
          <div class="form-card animate-fade-in" [style.animation-delay]="(i * 0.04) + 's'">
            <div class="form-header">
              <div class="form-player">
                <span class="form-name">{{ player.name }}</span>
                <span class="form-meta">
                  <ion-badge class="pos-badge" [class]="'pos-' + player.position.toLowerCase()">{{ player.position }}</ion-badge>
                  {{ player.teamShort }}
                </span>
              </div>
              <div class="form-score-col">
                <div class="form-score">{{ player.form }}</div>
                <ion-icon [name]="getTrendIcon(player)" [class]="getTrendClass(player)" class="trend-icon"></ion-icon>
              </div>
            </div>

            <!-- Sparkline -->
            <div class="sparkline-container">
              <div class="sparkline">
                @for (pt of player.last10; track $index; let j = $index) {
                  <div class="spark-bar-wrap">
                    <div class="spark-bar" [style.height.%]="(pt / getMaxPts(player)) * 100" [class]="getBarClass(pt)">
                    </div>
                    <span class="spark-val">{{ pt }}</span>
                  </div>
                }
              </div>
              <div class="sparkline-labels">
                @for (pt of player.last10; track $index; let j = $index) {
                  <span class="spark-gw">{{ 13 + j }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
    .form-header { display: flex; align-items: center; justify-content: space-between; }
    .form-player { }
    .form-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text-primary); display: block; }
    .form-meta { font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .pos-badge { font-size: 0.55rem; font-weight: 700; padding: 1px 5px; --background: var(--surface-elevated); --color: var(--text-secondary); }
    .pos-gk { --background: #F59E0B20; --color: #F59E0B; }
    .pos-def { --background: #00D68F20; --color: #00D68F; }
    .pos-mid { --background: #3B82F620; --color: #3B82F6; }
    .pos-fwd { --background: #EF444420; --color: #EF4444; }
    .form-score-col { display: flex; align-items: center; gap: 4px; }
    .form-score { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: var(--accent-gold); }
    .trend-icon { font-size: 16px; }
    .trend-up { color: var(--success); }
    .trend-down { color: var(--danger); }
    .trend-flat { color: var(--text-muted); }

    .sparkline-container { margin-top: 12px; }
    .sparkline { display: flex; gap: 3px; align-items: flex-end; height: 50px; }
    .spark-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .spark-bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 4px; transition: height 0.5s ease; }
    .spark-bar.bar-high { background: var(--success); }
    .spark-bar.bar-mid { background: var(--accent-gold); }
    .spark-bar.bar-low { background: var(--danger); }
    .spark-val { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); margin-top: 2px; }
    .sparkline-labels { display: flex; gap: 3px; margin-top: 2px; }
    .spark-gw { flex: 1; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 0.45rem; color: var(--text-muted); }
  `],
})
export class FormTrackerPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  players = signal<FantasyPlayer[]>([]);
  filter = signal<string>('ALL');

  constructor() { addIcons({ trendingUp, trendingDown, remove }); }

  ngOnInit() {
    this.projService.getPlayers().subscribe(p => this.players.set(p.sort((a, b) => b.form - a.form)));
  }

  filteredPlayers(): FantasyPlayer[] {
    const f = this.filter();
    return f === 'ALL' ? this.players() : this.players().filter(p => p.position === f);
  }

  getTrendIcon(p: FantasyPlayer): string {
    const last3 = p.last5.slice(0, 3);
    const prev3 = p.last5.slice(2, 5);
    const avg1 = last3.reduce((a, b) => a + b, 0) / 3;
    const avg2 = prev3.reduce((a, b) => a + b, 0) / 3;
    return avg1 > avg2 + 1 ? 'trending-up' : avg1 < avg2 - 1 ? 'trending-down' : 'remove';
  }

  getTrendClass(p: FantasyPlayer): string {
    const icon = this.getTrendIcon(p);
    return icon === 'trending-up' ? 'trend-up' : icon === 'trending-down' ? 'trend-down' : 'trend-flat';
  }

  getMaxPts(p: FantasyPlayer): number {
    return Math.max(...p.last10, 1);
  }

  getBarClass(pts: number): string {
    return pts >= 8 ? 'bar-high' : pts >= 4 ? 'bar-mid' : 'bar-low';
  }
}
