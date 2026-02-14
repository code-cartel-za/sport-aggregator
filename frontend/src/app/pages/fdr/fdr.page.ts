import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonSkeletonText, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, gridOutline } from 'ionicons/icons';
import { FDRService } from '../../services/fdr.service';
import { FDRRating } from '../../models';

@Component({
  selector: 'app-fdr',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonSkeletonText, IonButton, IonIcon],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">FIXTURE DIFFICULTY</span></ion-title>
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
          <!-- Legend skeleton -->
          <div style="display: flex; gap: 10px; margin-bottom: 16px">
            @for (n of [1,2,3,4,5]; track n) {
              <ion-skeleton-text [animated]="true" style="width: 60px; height: 12px; border-radius: 4px"></ion-skeleton-text>
            }
          </div>
          <!-- Header skeleton -->
          <div style="display: flex; gap: 4px; margin-bottom: 4px">
            <ion-skeleton-text [animated]="true" style="width: 48px; height: 12px; border-radius: 4px"></ion-skeleton-text>
            @for (n of [1,2,3,4,5,6]; track n) {
              <ion-skeleton-text [animated]="true" style="flex: 1; height: 12px; border-radius: 4px"></ion-skeleton-text>
            }
          </div>
          <!-- Row skeletons -->
          @for (n of [1,2,3,4,5,6,7,8]; track n) {
            <div style="display: flex; gap: 4px; margin-bottom: 3px">
              <ion-skeleton-text [animated]="true" style="width: 48px; height: 38px; border-radius: 4px"></ion-skeleton-text>
              @for (m of [1,2,3,4,5,6]; track m) {
                <ion-skeleton-text [animated]="true" style="flex: 1; height: 38px; border-radius: 6px"></ion-skeleton-text>
              }
            </div>
          }
        } @else if (ratings().length === 0) {
          <div class="empty-state">
            <ion-icon name="grid-outline" class="empty-icon"></ion-icon>
            <h3>No FDR data</h3>
            <p>FDR data not available yet</p>
          </div>
        } @else {
          <div class="fdr-legend">
            <span class="legend-item"><span class="legend-dot fdr-1"></span>Very Easy</span>
            <span class="legend-item"><span class="legend-dot fdr-2"></span>Easy</span>
            <span class="legend-item"><span class="legend-dot fdr-3"></span>Medium</span>
            <span class="legend-item"><span class="legend-dot fdr-4"></span>Hard</span>
            <span class="legend-item"><span class="legend-dot fdr-5"></span>Very Hard</span>
          </div>

          <!-- GW Headers -->
          <div class="fdr-header-row">
            <div class="fdr-team-col">TEAM</div>
            @for (gw of gwHeaders(); track gw) {
              <div class="fdr-gw-col">GW{{ gw }}</div>
            }
          </div>

          @for (rating of ratings(); track rating.teamId) {
            <div class="fdr-row animate-fade-in">
              <div class="fdr-team-col">
                <span class="fdr-team-name">{{ rating.teamShort }}</span>
              </div>
              @for (fix of rating.fixtures; track fix.gameweek) {
                <div class="fdr-cell" [class]="'fdr-cell-' + fix.difficulty">
                  <span class="fdr-opp">{{ fix.opponentShort }}</span>
                  <span class="fdr-ha">{{ fix.isHome ? 'H' : 'A' }}</span>
                </div>
              }
            </div>
          }
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }

    .fdr-legend { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
    .legend-item { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; }
    .fdr-1 { background: #00D68F; }
    .fdr-2 { background: #4ADE80; }
    .fdr-3 { background: #F59E0B; }
    .fdr-4 { background: #F97316; }
    .fdr-5 { background: #EF4444; }

    .fdr-header-row { display: flex; gap: 4px; margin-bottom: 4px; }
    .fdr-team-col { width: 48px; flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.05em; display: flex; align-items: center; }
    .fdr-gw-col { flex: 1; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); letter-spacing: 0.05em; }

    .fdr-row { display: flex; gap: 4px; margin-bottom: 3px; }
    .fdr-team-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.72rem; color: var(--text-primary); }
    .fdr-cell { flex: 1; border-radius: 6px; padding: 6px 2px; text-align: center; min-height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .fdr-cell-1 { background: rgba(0,214,143,0.2); border: 1px solid rgba(0,214,143,0.3); }
    .fdr-cell-2 { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.25); }
    .fdr-cell-3 { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.25); }
    .fdr-cell-4 { background: rgba(249,115,22,0.15); border: 1px solid rgba(249,115,22,0.25); }
    .fdr-cell-5 { background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); }
    .fdr-opp { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 700; color: var(--text-primary); }
    .fdr-ha { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); }
  `],
})
export class FDRPage implements OnInit {
  private fdrService = inject(FDRService);
  ratings = signal<FDRRating[]>([]);
  gwHeaders = signal<number[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() { addIcons({ alertCircle, gridOutline }); }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.fdrService.getFDRRatings().subscribe({
      next: (r) => {
        this.ratings.set(r);
        if (r.length > 0) {
          this.gwHeaders.set(r[0].fixtures.map(f => f.gameweek));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load FDR data');
        this.isLoading.set(false);
      },
    });
  }
}
