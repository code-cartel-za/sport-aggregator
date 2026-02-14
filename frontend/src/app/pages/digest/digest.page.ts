import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonIcon, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, trendingDown, alertCircle, time } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { GameweekSummary } from '../../models';

@Component({
  selector: 'app-digest',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons, IonIcon, IonBadge],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">GW DIGEST</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      @if (summary()) {
        <div class="px-4 pt-3">
          <!-- Deadline -->
          <div class="deadline-card gold-border-card animate-fade-in">
            <div class="dc-icon">⏰</div>
            <div class="dc-info">
              <div class="dc-label">GW{{ summary()!.gameweek }} DEADLINE</div>
              <div class="dc-timer">{{ countdownText() }}</div>
            </div>
          </div>

          <!-- Top Picks -->
          <div class="section-header animate-fade-in-delay-1">
            <span class="section-title">TOP PICKS</span>
            <span class="section-line"></span>
          </div>
          @for (pick of summary()!.topPicks; track pick.name; let i = $index) {
            <div class="digest-row">
              <span class="digest-rank">{{ i + 1 }}</span>
              <span class="digest-name">{{ pick.name }}</span>
              <span class="digest-team">{{ pick.team }}</span>
              <span class="digest-pts">{{ pick.projected }} pts</span>
            </div>
          }

          <!-- Price Risers -->
          <div class="section-header animate-fade-in-delay-2">
            <span class="section-title">PRICE RISERS</span>
            <span class="section-line"></span>
          </div>
          @for (r of summary()!.risers; track r.name) {
            <div class="digest-row">
              <ion-icon name="trending-up" class="rise-icon"></ion-icon>
              <span class="digest-name">{{ r.name }}</span>
              <span class="digest-team">{{ r.team }}</span>
              <span class="digest-change positive">+£{{ r.change }}m</span>
            </div>
          }

          <!-- Price Fallers -->
          <div class="section-header">
            <span class="section-title">PRICE FALLERS</span>
            <span class="section-line"></span>
          </div>
          @for (f of summary()!.fallers; track f.name) {
            <div class="digest-row">
              <ion-icon name="trending-down" class="fall-icon"></ion-icon>
              <span class="digest-name">{{ f.name }}</span>
              <span class="digest-team">{{ f.team }}</span>
              <span class="digest-change negative">£{{ f.change }}m</span>
            </div>
          }

          <!-- Injuries -->
          <div class="section-header">
            <span class="section-title">INJURY UPDATES</span>
            <span class="section-line"></span>
          </div>
          @for (inj of summary()!.injuries; track inj.name) {
            <div class="digest-row injury-row">
              <ion-icon name="alert-circle" class="inj-icon" [class]="inj.chance >= 75 ? 'inj-ok' : inj.chance >= 50 ? 'inj-warn' : 'inj-danger'"></ion-icon>
              <div class="inj-info">
                <span class="digest-name">{{ inj.name }}</span>
                <span class="inj-detail">{{ inj.status }}</span>
              </div>
              <ion-badge [color]="inj.chance >= 75 ? 'success' : inj.chance >= 50 ? 'warning' : 'danger'">{{ inj.chance }}%</ion-badge>
            </div>
          }

          <!-- Key Fixtures -->
          <div class="section-header">
            <span class="section-title">KEY FIXTURES</span>
            <span class="section-line"></span>
          </div>
          @for (f of summary()!.keyFixtures; track f.home) {
            <div class="fixture-row">
              <span class="fixture-team home">{{ f.home }}</span>
              <span class="fixture-vs">vs</span>
              <span class="fixture-team away">{{ f.away }}</span>
              <span class="fdr-dot" [class]="'fdr-' + f.fdr"></span>
            </div>
          }
        </div>
      }
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }

    .deadline-card { display: flex; align-items: center; gap: 14px; background: var(--surface); border-radius: 14px; padding: 16px 20px; margin-bottom: 8px; }
    .dc-icon { font-size: 28px; }
    .dc-info { flex: 1; }
    .dc-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .dc-timer { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 800; color: var(--danger); margin-top: 4px; }

    .section-header { display: flex; align-items: center; gap: 12px; margin: 20px 0 10px; }
    .section-title { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.12em; white-space: nowrap; }
    .section-line { flex: 1; height: 1px; background: var(--border); }

    .digest-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 4px; }
    .digest-rank { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); width: 18px; }
    .digest-name { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.82rem; color: var(--text-primary); flex: 1; }
    .digest-team { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
    .digest-pts { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; font-weight: 700; color: var(--accent-gold); }
    .digest-change { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; }
    .digest-change.positive { color: var(--success); }
    .digest-change.negative { color: var(--danger); }
    .rise-icon { color: var(--success); font-size: 16px; }
    .fall-icon { color: var(--danger); font-size: 16px; }

    .injury-row { }
    .inj-icon { font-size: 16px; }
    .inj-ok { color: var(--success); }
    .inj-warn { color: var(--warning); }
    .inj-danger { color: var(--danger); }
    .inj-info { flex: 1; }
    .inj-detail { display: block; font-size: 0.65rem; color: var(--text-muted); }

    .fixture-row { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin-bottom: 4px; }
    .fixture-team { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.8rem; color: var(--text-primary); }
    .fixture-team.home { flex: 1; text-align: right; }
    .fixture-team.away { flex: 1; }
    .fixture-vs { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); }
    .fdr-dot { width: 8px; height: 8px; border-radius: 50%; }
    .fdr-1 { background: var(--success); }
    .fdr-2 { background: #4ADE80; }
    .fdr-3 { background: var(--warning); }
    .fdr-4 { background: #F97316; }
    .fdr-5 { background: var(--danger); }
  `],
})
export class DigestPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  summary = signal<GameweekSummary | null>(null);
  countdownText = signal('--:--:--');

  constructor() { addIcons({ trendingUp, trendingDown, alertCircle, time }); }

  ngOnInit() {
    this.projService.getGameweekSummary().subscribe(s => {
      this.summary.set(s);
      this.updateCountdown(s.deadline);
      setInterval(() => this.updateCountdown(s.deadline), 1000);
    });
  }

  updateCountdown(deadline: string) {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) { this.countdownText.set('EXPIRED'); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdownText.set(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`);
  }
}
