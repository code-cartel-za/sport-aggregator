import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonBadge,
  IonRefresher, IonRefresherContent, IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  trendingUp, people, flash, statsChart, gitCompare, eye, newspaper,
  gameController, trophy, calendar, arrowForward, speedometer, football,
  bulb, time, alertCircle, star, diamondOutline,
} from 'ionicons/icons';
import { Firestore, doc, getDoc, collection, getDocs, query, limit, orderBy } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { TierService } from '../../services/tier.service';
import { WatchlistItem, GameweekSummary } from '../../models';

interface DashCard {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
}

interface LiveFixture {
  id: number;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  minute: number | null;
}

interface UpcomingFixture {
  homeTeam: string;
  awayTeam: string;
  date: string;
  matchday: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonIcon, IonBadge,
    IonRefresher, IonRefresherContent, IonSkeletonText,
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

        <!-- Greeting Banner -->
        <div class="hero-banner animate-fade-in">
          <div class="gradient-line" style="margin-bottom: 16px"></div>
          <div class="hero-top">
            <div>
              <div class="hero-label">{{ greeting() }}</div>
              <div class="hero-title">{{ userName() }}</div>
            </div>
            <div class="tier-pill" [class]="'tier-' + tierService.currentTier()">
              <ion-icon [name]="tierService.isElite() ? 'diamond-outline' : 'star'"></ion-icon>
              {{ tierService.currentTier() | uppercase }}
            </div>
          </div>

          <!-- GW Countdown -->
          @if (currentGameweek()) {
            <div class="gw-countdown">
              <div class="gw-info">
                <span class="gw-label">GAMEWEEK {{ currentGameweek()!.id }}</span>
                <span class="gw-status" [class.live]="currentGameweek()!.finished === false">
                  {{ currentGameweek()!.finished ? 'COMPLETED' : 'IN PROGRESS' }}
                </span>
              </div>
              @if (nextDeadline()) {
                <div class="deadline-box">
                  <div class="deadline-label">NEXT DEADLINE</div>
                  <div class="deadline-timer">{{ countdownText() }}</div>
                </div>
              }
            </div>
          }

          <!-- Quick Stats Row -->
          <div class="quick-stats">
            <div class="stat-pill">
              <span class="stat-pill-label">WATCHLIST</span>
              <span class="stat-pill-value">{{ watchlistCount() }}</span>
            </div>
            <div class="stat-pill gold">
              <span class="stat-pill-label">FPL PLAYERS</span>
              <span class="stat-pill-value">{{ fplPlayerCount() }}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill-label">PL TEAMS</span>
              <span class="stat-pill-value">{{ teamCount() }}</span>
            </div>
          </div>
        </div>

        <!-- Live / Recent Fixtures -->
        @if (liveFixtures().length > 0) {
          <div class="section-header animate-fade-in-delay-1">
            <span class="section-title">🔴 LIVE MATCHES</span>
            <span class="section-line"></span>
          </div>
          <div class="live-fixtures">
            @for (fix of liveFixtures(); track fix.id) {
              <div class="live-card">
                <div class="live-teams">
                  <span class="live-team">{{ fix.homeTeam }}</span>
                  <span class="live-score">{{ fix.homeScore ?? '-' }} — {{ fix.awayScore ?? '-' }}</span>
                  <span class="live-team">{{ fix.awayTeam }}</span>
                </div>
                <span class="live-minute">{{ fix.minute }}'</span>
              </div>
            }
          </div>
        }

        <!-- Upcoming Fixtures -->
        @if (upcomingFixtures().length > 0) {
          <div class="section-header animate-fade-in-delay-1">
            <span class="section-title">📅 UPCOMING — MATCHDAY {{ upcomingFixtures()[0].matchday }}</span>
            <span class="section-line"></span>
          </div>
          <div class="fixtures-list">
            @for (f of upcomingFixtures().slice(0, 5); track f.homeTeam) {
              <div class="fixture-row">
                <span class="fixture-team home">{{ f.homeTeam }}</span>
                <span class="fixture-vs">vs</span>
                <span class="fixture-team away">{{ f.awayTeam }}</span>
                <span class="fixture-date">{{ formatDate(f.date) }}</span>
              </div>
            }
          </div>
        }

        <!-- Watchlist Preview -->
        @if (watchlistItems().length > 0) {
          <div class="section-header animate-fade-in-delay-2">
            <span class="section-title">👀 YOUR WATCHLIST</span>
            <span class="section-line"></span>
            <span class="section-action" (click)="navigate('/watchlist')">View All</span>
          </div>
          <div class="watchlist-preview">
            @for (item of watchlistItems().slice(0, 4); track item.playerId) {
              <div class="watchlist-row">
                <div class="wl-player">
                  <span class="wl-name">{{ item.playerName }}</span>
                  <span class="wl-meta">{{ item.team }} · {{ item.position }}</span>
                </div>
                <div class="wl-price">
                  <span class="wl-current">£{{ (item.currentPrice / 10).toFixed(1) }}m</span>
                  <span class="wl-change" [class.up]="item.priceChange > 0" [class.down]="item.priceChange < 0">
                    {{ item.priceChange > 0 ? '+' : '' }}{{ (item.priceChange / 10).toFixed(1) }}
                  </span>
                </div>
              </div>
            }
          </div>
        }

        <!-- Feature Cards Grid -->
        <div class="section-header animate-fade-in-delay-2">
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

        <!-- Data Status -->
        @if (!isLoading() && fplPlayerCount() === 0 && teamCount() === 0) {
          <div class="empty-state animate-fade-in">
            <ion-icon name="alert-circle" class="empty-icon"></ion-icon>
            <h3>No Data Yet</h3>
            <p>Cloud Functions haven't synced data to Firestore yet. Run the sync endpoints to populate your dashboard.</p>
          </div>
        }

        <div class="bottom-spacer"></div>
      </div>
    </ion-content>
  `,
  styles: [`
    .title-text { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.08em; font-size: 1.1rem; color: var(--accent-gold); }
    .dashboard-container { padding: 0 16px; }

    /* Hero */
    .hero-banner { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-top: 8px; }
    .hero-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .hero-label { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .hero-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; }

    .tier-pill {
      font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 700;
      padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px;
      letter-spacing: 0.05em;
    }
    .tier-free { background: rgba(148,163,184,0.15); color: #94a3b8; }
    .tier-pro { background: rgba(212,168,71,0.15); color: var(--accent-gold); border: 1px solid rgba(212,168,71,0.3); }
    .tier-elite { background: rgba(59,130,246,0.15); color: var(--accent-blue); border: 1px solid rgba(59,130,246,0.3); }

    /* GW Countdown */
    .gw-countdown { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }
    .gw-info { display: flex; flex-direction: column; gap: 2px; }
    .gw-label { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--accent-gold); letter-spacing: 0.1em; font-weight: 700; }
    .gw-status { font-size: 0.65rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .gw-status.live { color: var(--success); }
    .deadline-box { text-align: right; }
    .deadline-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .deadline-timer { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--danger); }

    /* Quick Stats */
    .quick-stats { display: flex; gap: 8px; margin-top: 16px; }
    .stat-pill { background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; flex: 1; }
    .stat-pill.gold { border-color: rgba(212,168,71,0.3); }
    .stat-pill-label { display: block; font-size: 0.55rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
    .stat-pill-value { display: block; font-size: 1rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
    .stat-pill.gold .stat-pill-value { color: var(--accent-gold); }

    /* Live Fixtures */
    .live-fixtures { display: flex; flex-direction: column; gap: 6px; }
    .live-card { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 12px 16px; }
    .live-teams { display: flex; align-items: center; gap: 10px; flex: 1; }
    .live-team { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.82rem; flex: 1; }
    .live-team:last-child { text-align: right; }
    .live-score { font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 1rem; min-width: 60px; text-align: center; }
    .live-minute { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--danger); font-weight: 700; margin-left: 8px; }

    /* Upcoming Fixtures */
    .fixtures-list { display: flex; flex-direction: column; gap: 6px; }
    .fixture-row { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; }
    .fixture-team { font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.82rem; color: var(--text-primary); }
    .fixture-team.home { flex: 1; text-align: right; }
    .fixture-team.away { flex: 1; }
    .fixture-vs { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }
    .fixture-date { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); min-width: 45px; text-align: right; }

    /* Watchlist Preview */
    .watchlist-preview { display: flex; flex-direction: column; gap: 4px; }
    .watchlist-row { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; }
    .wl-player { display: flex; flex-direction: column; }
    .wl-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.85rem; }
    .wl-meta { font-size: 0.65rem; color: var(--text-muted); margin-top: 1px; }
    .wl-price { text-align: right; }
    .wl-current { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 0.85rem; display: block; }
    .wl-change { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; }
    .wl-change.up { color: var(--success); }
    .wl-change.down { color: var(--danger); }

    /* Section */
    .section-header { display: flex; align-items: center; gap: 12px; margin: 24px 0 12px; }
    .section-title { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.12em; white-space: nowrap; }
    .section-line { flex: 1; height: 1px; background: var(--border); }
    .section-action { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--accent-gold); cursor: pointer; white-space: nowrap; }

    /* Feature Cards */
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

    /* Empty State */
    .empty-state { text-align: center; padding: 32px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; margin-top: 16px; }
    .empty-icon { font-size: 40px; color: var(--text-muted); margin-bottom: 12px; }
    .empty-state h3 { font-family: 'Outfit', sans-serif; font-weight: 700; margin: 0 0 8px; }
    .empty-state p { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

    .bottom-spacer { height: 80px; }
  `],
})
export class HomePage implements OnInit, OnDestroy {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  tierService = inject(TierService);

  // State
  userName = signal<string>('Commander');
  isLoading = signal(true);
  fplPlayerCount = signal(0);
  teamCount = signal(0);
  watchlistCount = signal(0);
  watchlistItems = signal<WatchlistItem[]>([]);
  liveFixtures = signal<LiveFixture[]>([]);
  upcomingFixtures = signal<UpcomingFixture[]>([]);
  currentGameweek = signal<{ id: number; finished: boolean; deadline_time: string } | null>(null);
  nextDeadline = signal<string | null>(null);
  countdownText = signal('--:--:--');

  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private authSub: Subscription | null = null;

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  });

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
      gameController, trophy, calendar, arrowForward, speedometer, football,
      bulb, time, alertCircle, star, diamondOutline,
    });
  }

  ngOnInit(): void {
    this.authSub = user(this.auth).subscribe(u => {
      if (u) {
        this.userName.set(u.displayName?.split(' ')[0] ?? 'Commander');
        this.loadWatchlist(u.uid);
      }
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.authSub?.unsubscribe();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    await Promise.all([
      this.loadFplBootstrap(),
      this.loadTeams(),
      this.loadFixtures(),
    ]);
    this.isLoading.set(false);
  }

  private async loadFplBootstrap(): Promise<void> {
    try {
      const bootstrapDoc = await getDoc(doc(this.firestore, 'fpl', 'bootstrap'));
      if (bootstrapDoc.exists()) {
        const data = bootstrapDoc.data();
        const elements = (data?.['elements'] as Record<string, unknown>[]) ?? [];
        this.fplPlayerCount.set(elements.length);

        // Find current & next gameweek
        const events = (data?.['events'] as { id: number; finished: boolean; deadline_time: string }[]) ?? [];
        const current = events.find(e => !e.finished) ?? events[events.length - 1];
        if (current) {
          this.currentGameweek.set(current);
          const next = events.find(e => !e.finished && new Date(e.deadline_time).getTime() > Date.now());
          if (next) {
            this.nextDeadline.set(next.deadline_time);
            this.updateCountdown(next.deadline_time);
            this.countdownInterval = setInterval(() => this.updateCountdown(next.deadline_time), 1000);
          }
        }
      }
    } catch { /* Firestore not populated yet */ }
  }

  private async loadTeams(): Promise<void> {
    try {
      const teamsSnap = await getDocs(collection(this.firestore, 'teams'));
      this.teamCount.set(teamsSnap.size);
    } catch { /* empty */ }
  }

  private async loadFixtures(): Promise<void> {
    try {
      const cacheDoc = await getDoc(doc(this.firestore, 'cache', 'fixtures'));
      if (!cacheDoc.exists()) return;
      const allFixtures = (cacheDoc.data()?.['fixtures'] as Record<string, unknown>[]) ?? [];

      // Live fixtures
      const live = allFixtures
        .filter(f => ['LIVE', 'IN_PLAY', 'PAUSED'].includes(f['status'] as string))
        .map(f => this.mapLiveFixture(f));
      this.liveFixtures.set(live);

      // Upcoming (scheduled, next 5)
      const upcoming = allFixtures
        .filter(f => ['SCHEDULED', 'TIMED'].includes(f['status'] as string))
        .sort((a, b) => new Date(a['utcDate'] as string).getTime() - new Date(b['utcDate'] as string).getTime())
        .slice(0, 5)
        .map(f => this.mapUpcomingFixture(f));
      this.upcomingFixtures.set(upcoming);
    } catch { /* empty */ }
  }

  private async loadWatchlist(uid: string): Promise<void> {
    try {
      const watchlistSnap = await getDocs(collection(this.firestore, `users/${uid}/watchlist`));
      const items = watchlistSnap.docs.map(d => d.data() as WatchlistItem);
      this.watchlistItems.set(items);
      this.watchlistCount.set(items.length);
    } catch {
      // Fallback to localStorage
      const stored = localStorage.getItem('watchlist');
      if (stored) {
        const items = JSON.parse(stored) as WatchlistItem[];
        this.watchlistItems.set(items);
        this.watchlistCount.set(items.length);
      }
    }
  }

  private mapLiveFixture(f: Record<string, unknown>): LiveFixture {
    const home = f['homeTeam'] as Record<string, unknown>;
    const away = f['awayTeam'] as Record<string, unknown>;
    const score = f['score'] as Record<string, unknown>;
    const ft = score?.['fullTime'] as Record<string, unknown>;
    return {
      id: f['id'] as number,
      homeTeam: (home?.['shortName'] as string) ?? (home?.['name'] as string) ?? '',
      homeCrest: (home?.['crest'] as string) ?? '',
      awayTeam: (away?.['shortName'] as string) ?? (away?.['name'] as string) ?? '',
      awayCrest: (away?.['crest'] as string) ?? '',
      homeScore: ft?.['home'] as number | null,
      awayScore: ft?.['away'] as number | null,
      status: f['status'] as string,
      minute: null,
    };
  }

  private mapUpcomingFixture(f: Record<string, unknown>): UpcomingFixture {
    const home = f['homeTeam'] as Record<string, unknown>;
    const away = f['awayTeam'] as Record<string, unknown>;
    return {
      homeTeam: (home?.['shortName'] as string) ?? (home?.['name'] as string) ?? '',
      awayTeam: (away?.['shortName'] as string) ?? (away?.['name'] as string) ?? '',
      date: f['utcDate'] as string,
      matchday: f['matchday'] as number,
    };
  }

  updateCountdown(deadline: string): void {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) { this.countdownText.set('LOCKED'); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    this.countdownText.set(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  navigate(route: string): void { this.router.navigate([route]); }

  refresh(event: { target: { complete: () => void } }): void {
    this.loadData();
    setTimeout(() => event.target.complete(), 600);
  }
}
