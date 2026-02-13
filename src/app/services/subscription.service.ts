import { Injectable, signal, computed, effect } from '@angular/core';
import { Subscription, UserPreferences } from '../models';

const SUBS_KEY = 'sport-agg-subscriptions';
const PREFS_KEY = 'sport-agg-preferences';

const DEFAULT_PREFS: UserPreferences = {
  darkMode: true,
  defaultSport: 'football',
  notificationsEnabled: false,
  favouriteLeagues: [39, 2],
  favouriteTeams: [33, 40],
  favouriteDrivers: ['max_verstappen', 'norris'],
};

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  subscriptions = signal<Subscription[]>(this.loadSubs());
  preferences = signal<UserPreferences>(this.loadPrefs());

  subscribedLeagueIds = computed(() =>
    this.subscriptions()
      .filter(s => s.type === 'league')
      .map(s => Number(s.entityId))
  );

  constructor() {
    effect(() => {
      localStorage.setItem(SUBS_KEY, JSON.stringify(this.subscriptions()));
    });
    effect(() => {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.preferences()));
    });
  }

  addSubscription(sub: Subscription): void {
    this.subscriptions.update(subs => [...subs, sub]);
  }

  removeSubscription(id: string): void {
    this.subscriptions.update(subs => subs.filter(s => s.id !== id));
  }

  updatePreferences(partial: Partial<UserPreferences>): void {
    this.preferences.update(p => ({ ...p, ...partial }));
  }

  isSubscribed(entityId: string | number): boolean {
    return this.subscriptions().some(s => s.entityId === entityId);
  }

  private loadSubs(): Subscription[] {
    try {
      return JSON.parse(localStorage.getItem(SUBS_KEY) ?? '[]');
    } catch { return []; }
  }

  private loadPrefs(): UserPreferences {
    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
    } catch { return DEFAULT_PREFS; }
  }
}
