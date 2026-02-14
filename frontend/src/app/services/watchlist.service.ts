import { Injectable, inject, signal, effect } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, getDocs } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { WatchlistItem, FplPosition } from '../models';

const STORAGE_KEY = 'sa_watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  items = signal<WatchlistItem[]>(this.loadLocal());
  private currentUser: User | null = null;

  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
      if (user) {
        this.loadFromFirestore(user.uid);
      }
    });
  }

  private loadLocal(): WatchlistItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : this.defaultItems();
    } catch { return this.defaultItems(); }
  }

  private saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }

  private defaultItems(): WatchlistItem[] {
    return [
      { playerId: 5, playerName: 'Alexander Isak', team: 'NEW', position: 'FWD' as FplPosition, addedDate: '2026-02-01', priceAtAdd: 9.0, currentPrice: 9.2, priceChange: 0.2, notes: 'Great run of fixtures' },
      { playerId: 20, playerName: 'Bryan Mbeumo', team: 'BRE', position: 'MID' as FplPosition, addedDate: '2026-02-05', priceAtAdd: 7.6, currentPrice: 7.8, priceChange: 0.2, notes: 'Consistent returns' },
      { playerId: 13, playerName: 'Ollie Watkins', team: 'AVL', position: 'FWD' as FplPosition, addedDate: '2026-02-08', priceAtAdd: 8.5, currentPrice: 8.5, priceChange: 0, notes: 'Monitor form' },
    ];
  }

  private async loadFromFirestore(uid: string) {
    try {
      const snap = await getDocs(collection(this.firestore, `users/${uid}/watchlist`));
      if (!snap.empty) {
        const items = snap.docs.map(d => d.data() as WatchlistItem);
        this.items.set(items);
        this.saveLocal();
      } else {
        // Sync local items to Firestore on first login
        const local = this.items();
        for (const item of local) {
          await this.writeToFirestore(uid, item);
        }
      }
    } catch {
      // Firestore unavailable, keep local data
    }
  }

  private async writeToFirestore(uid: string, item: WatchlistItem) {
    try {
      await setDoc(
        doc(this.firestore, `users/${uid}/watchlist/${item.playerId}`),
        { ...item },
      );
    } catch {
      // Silently fail — localStorage is the fallback
    }
  }

  private async deleteFromFirestore(uid: string, playerId: number) {
    try {
      await deleteDoc(doc(this.firestore, `users/${uid}/watchlist/${playerId}`));
    } catch {
      // Silently fail
    }
  }

  add(item: WatchlistItem) {
    this.items.update(list => [...list, item]);
    this.saveLocal();
    if (this.currentUser) {
      this.writeToFirestore(this.currentUser.uid, item);
    }
  }

  remove(playerId: number) {
    this.items.update(list => list.filter(i => i.playerId !== playerId));
    this.saveLocal();
    if (this.currentUser) {
      this.deleteFromFirestore(this.currentUser.uid, playerId);
    }
  }

  updateNotes(playerId: number, notes: string) {
    this.items.update(list => list.map(i => i.playerId === playerId ? { ...i, notes } : i));
    this.saveLocal();
    if (this.currentUser) {
      const item = this.items().find(i => i.playerId === playerId);
      if (item) this.writeToFirestore(this.currentUser.uid, item);
    }
  }

  isWatched(playerId: number): boolean {
    return this.items().some(i => i.playerId === playerId);
  }
}
