import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonBadge,
  IonSkeletonText, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, ribbonOutline } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { CaptainPick } from '../../models';

@Component({
  selector: 'app-captain',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonBadge, IonSkeletonText, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">CAPTAIN PICKS</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        @if (error()) {
          <div class="error-state">
            <ion-icon name="alert-circle" class="error-icon"></ion-icon>
            <h3>Something went wrong</h3>
            <p>{{ error() }}</p>
            <ion-button fill="outline" size="small" (click)="loadData()">Try Again</ion-button>
          </div>
        } @else if (isLoading()) {
          @for (n of [1,2,3,4,5]; track n) {
            <div class="skeleton-card" style="display: flex; align-items: center; gap: 12px">
              <ion-skeleton-text [animated]="true" style="width: 24px; height: 20px; border-radius: 4px"></ion-skeleton-text>
              <div style="flex: 1">
                <ion-skeleton-text [animated]="true" style="width: 50%; height: 14px; border-radius: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 35%; height: 10px; border-radius: 4px; margin-top: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 70%; height: 10px; border-radius: 4px; margin-top: 4px"></ion-skeleton-text>
              </div>
              <div style="text-align: right">
                <ion-skeleton-text [animated]="true" style="width: 50px; height: 24px; border-radius: 4px"></ion-skeleton-text>
                <ion-skeleton-text [animated]="true" style="width: 40px; height: 3px; border-radius: 2px; margin-top: 6px"></ion-skeleton-text>
              </div>
            </div>
          }
        } @else if (picks().length === 0) {
          <div class="empty-state">
            <ion-icon name="ribbon-outline" class="empty-icon"></ion-icon>
            <h3>No captain picks</h3>
            <p>Captain picks available after data sync</p>
          </div>
        } @else {
          @for (pick of picks(); track pick.player.id; let i = $index) {
            <div class="captain-card animate-fade-in" [class.top-pick]="i === 0" [style.animation-delay]="(i * 0.05) + 's'">
              <div class="cap-rank" [class.rank-gold]="i === 0">{{ i + 1 }}</div>
              <div class="cap-info">
                <div class="cap-name">{{ pick.player.name }}</div>
                <div class="cap-meta">
                  <ion-badge class="pos-badge" [class]="'pos-' + pick.player.position.toLowerCase()">{{ pick.player.position }}</ion-badge>
                  {{ pick.player.teamShort }} · FDR {{ pick.fixtureDifficulty | number:'1.1-1' }}
                </div>
                <div class="cap-reason">{{ pick.reason }}</div>
              </div>
              <div class="cap-points-col">
                <div class="cap-pts">{{ pick.captainPoints | number:'1.1-1' }}</div>
                <div class="cap-pts-sub">×2 = {{ pick.captainPoints | number:'1.1-1' }}</div>
                <div class="cap-conf">
                  <div class="conf-mini-bar"><div class="conf-mini-fill" [style.width.%]="pick.confidence" [class]="pick.confidence >= 75 ? 'high' : pick.confidence >= 50 ? 'medium' : 'low'"></div></div>
                  <span class="conf-mini-pct">{{ pick.confidence }}%</span>
                </div>
              </div>
            </div>
          }
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .captain-card { display: flex; align-items: center; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
    .top-pick { border-color: rgba(212,168,71,0.4); background: linear-gradient(135deg, rgba(212,168,71,0.08), transparent); }
    .cap-rank { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: var(--text-muted); width: 24px; text-align: center; }
    .rank-gold { color: var(--accent-gold); }
    .cap-info { flex: 1; }
    .cap-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
    .cap-meta { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; }
    .cap-reason { font-size: 0.68rem; color: var(--text-secondary); margin-top: 4px; font-style: italic; }
    .pos-badge { font-size: 0.55rem; font-weight: 700; padding: 1px 5px; --background: var(--surface-elevated); --color: var(--text-secondary); }
    .pos-gk { --background: #F59E0B20; --color: #F59E0B; }
    .pos-def { --background: #00D68F20; --color: #00D68F; }
    .pos-mid { --background: #3B82F620; --color: #3B82F6; }
    .pos-fwd { --background: #EF444420; --color: #EF4444; }
    .cap-points-col { text-align: right; min-width: 70px; }
    .cap-pts { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 800; color: var(--accent-gold); }
    .cap-pts-sub { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); }
    .cap-conf { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
    .conf-mini-bar { width: 40px; height: 3px; background: var(--surface-elevated); border-radius: 2px; overflow: hidden; }
    .conf-mini-fill { height: 100%; border-radius: 2px; }
    .conf-mini-fill.high { background: var(--success); }
    .conf-mini-fill.medium { background: var(--warning); }
    .conf-mini-fill.low { background: var(--danger); }
    .conf-mini-pct { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); }
  `],
})
export class CaptainPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  picks = signal<CaptainPick[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() { addIcons({ alertCircle, ribbonOutline }); }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.projService.getCaptainPicks().subscribe({
      next: (p) => { this.picks.set(p); this.isLoading.set(false); },
      error: (err) => { this.error.set(err?.message || 'Failed to load captain picks'); this.isLoading.set(false); },
    });
  }
}
