import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonBadge,
  IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUp, people, flash, statsChart, gitCompare, eye, newspaper,
  gameController, trophy, calendar, arrowForward, speedometer, football,
  bulb,
} from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { GameweekSummary } from '../../models';

interface DashCard {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonBadge,
    IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <span class="title-text">COMMAND CENTER</span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content fullscreen>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="dashboard-container">
        <!-- Hero Banner -->
        <div class="hero-banner animate-fade-in">
          <div class="gradient-line" style="margin-bottom: 16px"></div>
          <div class="hero-top">
            <div>
              <div class="hero-label">GAMEWEEK {{ summary()?.gameweek }}</div>
              <div class="hero-title">Fantasy Insights</div>
            </div>
            <div class="deadline-box" *ngIf="summary()">
              <div class="deadline-label">DEADLINE</div>
              <div class="deadline-timer">{{ countdownText() }}</div>
            </div>
          </div>

          <!-- Quick Stats Row -->
          <div class="quick-stats" *ngIf="summary()">
            <div class="stat-pill">
              <span class="stat-pill-label">Top Pick</span>
              <span class="stat-pill-value">{{ summary()!.topPicks[0]?.name }}</span>
            </div>
            <div class="stat-pill gold">
              <span class="stat-pill-label">Projected</span>
              <span class="stat-pill-value">{{ summary()!.topPicks[0]?.projected }} pts</span>
            </div>
          </div>
        </div>

        <!-- Feature Cards Grid -->
        <div class="section-header animate-fade-in-delay-1">
          <span class="section-title">QUICK ACCESS</span>
          <span class="section-line"></span>
        </div>

        <div class="cards-grid">
          @for (card of cards; track card.route; let i = $index) {
            <div class="feature-card" [style.animation-delay]="(i * 0.05) + 's'" (click)="navigate(card.route)">
              <div class="card-icon-wrap" [style.background]="card.color + '15'">
                <ion-icon [name]="card.icon" [style.color]="card.color"></ion-icon>
              </div>
              <div class="card-info">
                <div class="card-title">{{ card.title }}</div>
                <div class="card-subtitle">{{ card.subtitle }}</div>
              </div>
              @if (card.badge) {
                <ion-badge class="card-badge">{{ card.badge }}</ion-badge>
              }
              <ion-icon name="arrow-forward" class="card-arrow"></ion-icon>
            </div>
          }
        </div>

        <!-- Key Fixtures -->
        <div class="section-header animate-fade-in-delay-2">
          <span class="section-title">KEY FIXTURES — GW{{ summary()?.gameweek }}</span>
          <span class="section-line"></span>
        </div>

        <div class="fixtures-list" *ngIf="summary()">
          @for (f of summary()!.keyFixtures; track f.home) {
            <div class="fixture-row">
              <span class="fixture-team home">{{ f.home }}</span>
              <span class="fixture-vs">vs</span>
              <span class="fixture-team away">{{ f.away }}</span>
              <span class="fdr-dot" [class]="'fdr-' + f.fdr"></span>
            </div>
          }
        </div>

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .title-text { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.08em; font-size: 1.1rem; color: var(--accent-gold); }
    .dashboard-container { padding: 0 16px; }

    .hero-banner { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-top: 8px; }
    .hero-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .hero-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--accent-gold); letter-spacing: 0.1em; font-weight: 600; }
    .hero-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .deadline-box { text-align: right; }
    .deadline-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .deadline-timer { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--danger); }

    .quick-stats { display: flex; gap: 8px; margin-top: 16px; }
    .stat-pill { background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; flex: 1; }
    .stat-pill.gold { border-color: rgba(212,168,71,0.3); }
    .stat-pill-label { display: block; font-size: 0.6rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
    .stat-pill-value { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
    .stat-pill.gold .stat-pill-value { color: var(--accent-gold); }

    .section-header { display: flex; align-items: center; gap: 12px; margin: 24px 0 12px; }
    .section-title { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.12em; white-space: nowrap; }
    .section-line { flex: 1; height: 1px; background: var(--border); }

    .cards-grid { display: flex; flex-direction: column; gap: 8px; }
    .feature-card {
      display: flex; align-items: center; gap: 12px;
      background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
      padding: 14px 16px; cursor: pointer;
      transition: border-color 0.2s, transform 0.15s;
      animation: fadeInUp 0.4s ease-out both;
    }
    .feature-card:active { transform: scale(0.98); border-color: var(--accent-gold); }
    .card-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .card-icon-wrap ion-icon { font-size: 20px; }
    .card-info { flex: 1; min-width: 0; }
    .card-title { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text-primary); }
    .card-subtitle { font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; }
    .card-badge { --background: var(--accent-gold); --color: var(--bg); font-size: 0.6rem; padding: 2px 6px; }
    .card-arrow { color: var(--text-muted); font-size: 16px; flex-shrink: 0; }

    .fixtures-list { display: flex; flex-direction: column; gap: 6px; }
    .fixture-row { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; }
    .fixture-team { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.82rem; color: var(--text-primary); }
    .fixture-team.home { flex: 1; text-align: right; }
    .fixture-team.away { flex: 1; }
    .fixture-vs { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
    .fdr-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .fdr-1 { background: var(--success); }
    .fdr-2 { background: #4ADE80; }
    .fdr-3 { background: var(--warning); }
    .fdr-4 { background: #F97316; }
    .fdr-5 { background: var(--danger); }
  `],
})
export class HomePage implements OnInit {
  private router = inject(Router);
  private projService = inject(FantasyProjectionService);

  summary = signal<GameweekSummary | null>(null);
  countdownText = signal('--:--:--');

  cards: DashCard[] = [
    { title: 'Points Projector', subtitle: 'GW projected points breakdown', icon: 'trending-up', route: '/projections', color: '#D4A847', badge: 'HOT' },
    { title: 'Dream Team', subtitle: 'Optimal squad builder', icon: 'trophy', route: '/dream-team', color: '#3B82F6' },
    { title: 'Captain Picks', subtitle: 'Best captain recommendations', icon: 'flash', route: '/captain', color: '#00D68F' },
    { title: 'Fixture Difficulty', subtitle: 'FDR grid for all teams', icon: 'calendar', route: '/fdr', color: '#F59E0B' },
    { title: 'Form Tracker', subtitle: 'Player form over 10 GWs', icon: 'stats-chart', route: '/form-tracker', color: '#8B5CF6' },
    { title: 'Differentials', subtitle: 'Low-ownership high-value picks', icon: 'people', route: '/differentials', color: '#EC4899' },
    { title: 'Compare Players', subtitle: 'Head-to-head analysis', icon: 'git-compare', route: '/compare', color: '#06B6D4' },
    { title: 'Watchlist', subtitle: 'Track transfer targets', icon: 'eye', route: '/watchlist', color: '#F97316' },
    { title: 'GW Digest', subtitle: 'Weekly summary & deadlines', icon: 'newspaper', route: '/digest', color: '#14B8A6' },
    { title: 'Simulator', subtitle: 'What-if points scenarios', icon: 'game-controller', route: '/simulator', color: '#A855F7' },
  ];

  constructor() {
    addIcons({
      trendingUp, people, flash, statsChart, gitCompare, eye, newspaper,
      gameController, trophy, calendar, arrowForward, speedometer, football, bulb,
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.projService.getGameweekSummary().subscribe(s => {
      this.summary.set(s);
      this.updateCountdown(s.deadline);
      setInterval(() => this.updateCountdown(s.deadline), 1000);
    });
  }

  updateCountdown(deadline: string) {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) { this.countdownText.set('EXPIRED'); return; }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdownText.set(`${h}h ${m}m ${s}s`);
  }

  navigate(route: string) { this.router.navigate([route]); }

  refresh(event: any) {
    this.loadData();
    setTimeout(() => event.target.complete(), 600);
  }
}
