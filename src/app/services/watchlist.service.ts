import { Injectable, signal } from '@angular/core';
import { WatchlistItem, FplPosition } from '../models';

const STORAGE_KEY = 'sa_watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  items = signal<WatchlistItem[]>(this.load());

  private load(): WatchlistItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : this.defaultItems();
    } catch { return this.defaultItems(); }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }

  private defaultItems(): WatchlistItem[] {
    return [
      { playerId: 5, playerName: 'Alexander Isak', team: 'NEW', position: 'FWD' as FplPosition, addedDate: '2026-02-01', priceAtAdd: 9.0, currentPrice: 9.2, priceChange: 0.2, notes: 'Great run of fixtures' },
      { playerId: 20, playerName: 'Bryan Mbeumo', team: 'BRE', position: 'MID' as FplPosition, addedDate: '2026-02-05', priceAtAdd: 7.6, currentPrice: 7.8, priceChange: 0.2, notes: 'Consistent returns' },
      { playerId: 13, playerName: 'Ollie Watkins', team: 'AVL', position: 'FWD' as FplPosition, addedDate: '2026-02-08', priceAtAdd: 8.5, currentPrice: 8.5, priceChange: 0, notes: 'Monitor form' },
    ];
  }

  add(item: WatchlistItem) {
    this.items.update(list => [...list, item]);
    this.save();
  }

  remove(playerId: number) {
    this.items.update(list => list.filter(i => i.playerId !== playerId));
    this.save();
  }

  updateNotes(playerId: number, notes: string) {
    this.items.update(list => list.map(i => i.playerId === playerId ? { ...i, notes } : i));
    this.save();
  }

  isWatched(playerId: number): boolean {
    return this.items().some(i => i.playerId === playerId);
  }
}
