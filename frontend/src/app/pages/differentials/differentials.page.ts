import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonBadge, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, trendingDown, remove } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { Differential } from '../../models';

@Component({
  selector: 'app-differentials',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonBadge, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">DIFFERENTIALS</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <div class="diff-info-banner">
          <span class="diff-info-text">Players with &lt;25% ownership and high projected value</span>
        </div>

        @for (diff of diffs(); track diff.player.id; let i = $index) {
          <div class="diff-card animate-fade-in" [style.animation-delay]="(i * 0.05) + 's'">
            <div class="diff-header">
              <div class="diff-rank">{{ i + 1 }}</div>
              <div class="diff-player">
                <div class="diff-name">{{ diff.player.name }}</div>
                <div class="diff-meta">
                  <ion-badge class="pos-badge" [class]="'pos-' + diff.player.position.toLowerCase()">{{ diff.player.position }}</ion-badge>
                  {{ diff.player.teamShort }} · £{{ diff.player.price }}m
                </div>
              </div>
              <div class="diff-value-col">
                <div class="diff-value">{{ diff.valueScore }}</div>
                <div class="diff-value-label">pts/£m</div>
              </div>
            </div>
            <div class="diff-stats">
              <div class="diff-stat">
                <span class="ds-label">Projected</span>
                <span class="ds-val gold">{{ diff.projectedPoints | number:'1.1-1' }} pts</span>
              </div>
              <div class="diff-stat">
                <span class="ds-label">Ownership</span>
                <span class="ds-val">{{ diff.player.ownership }}%</span>
              </div>
              <div class="diff-stat">
                <span class="ds-label">Trend</span>
                <span class="ds-val" [class]="'trend-' + diff.trend">
                  <ion-icon [name]="diff.trend === 'rising' ? 'trending-up' : diff.trend === 'falling' ? 'trending-down' : 'remove'"></ion-icon>
                  {{ diff.trend }}
                </span>
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
    .diff-info-banner { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
    .diff-info-text { font-size: 0.72rem; color: var(--text-secondary); }
    .diff-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
    .diff-header { display: flex; align-items: center; gap: 12px; }
    .diff-rank { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); width: 20px; }
    .diff-player { flex: 1; }
    .diff-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text-primary); }
    .diff-meta { font-size: 0.68rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; }
    .pos-badge { font-size: 0.55rem; font-weight: 700; padding: 1px 5px; --background: var(--surface-elevated); --color: var(--text-secondary); }
    .pos-gk { --background: #F59E0B20; --color: #F59E0B; }
    .pos-def { --background: #00D68F20; --color: #00D68F; }
    .pos-mid { --background: #3B82F620; --color: #3B82F6; }
    .pos-fwd { --background: #EF444420; --color: #EF4444; }
    .diff-value-col { text-align: right; }
    .diff-value { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 800; color: var(--accent-blue); }
    .diff-value-label { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); }
    .diff-stats { display: flex; gap: 8px; margin-top: 10px; }
    .diff-stat { flex: 1; background: var(--surface-elevated); border-radius: 8px; padding: 6px 8px; }
    .ds-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); letter-spacing: 0.05em; }
    .ds-val { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; color: var(--text-primary); margin-top: 2px; }
    .ds-val.gold { color: var(--accent-gold); }
    .trend-rising { color: var(--success) !important; }
    .trend-falling { color: var(--danger) !important; }
    .trend-stable { color: var(--text-muted) !important; }
    .ds-val ion-icon { font-size: 12px; vertical-align: middle; margin-right: 2px; }
  `],
})
export class DifferentialsPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  diffs = signal<Differential[]>([]);

  constructor() { addIcons({ trendingUp, trendingDown, remove }); }

  ngOnInit() {
    this.projService.getDifferentials().subscribe(d => this.diffs.set(d));
  }
}
