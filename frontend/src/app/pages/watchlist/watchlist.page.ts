import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonIcon, IonBadge, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, trendingUp, trendingDown, remove, eyeOutline } from 'ionicons/icons';
import { WatchlistService } from '../../services/watchlist.service';
import { WatchlistItem } from '../../models';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
    IonIcon, IonBadge, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonLabel, IonList,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">WATCHLIST</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        @if (watchlistService.items().length === 0) {
          <div class="empty-state">
            <ion-icon name="eye-outline" class="empty-icon"></ion-icon>
            <h3>Your watchlist is empty</h3>
            <p>Add players from other pages to track them here</p>
          </div>
        } @else {
          <ion-list>
            @for (item of watchlistService.items(); track item.playerId; let i = $index) {
              <ion-item-sliding>
                <ion-item lines="none" class="watch-item">
                  <div class="watch-card">
                    <div class="watch-header">
                      <div>
                        <div class="watch-name">{{ item.playerName }}</div>
                        <div class="watch-meta">
                          <ion-badge class="pos-badge" [class]="'pos-' + item.position.toLowerCase()">{{ item.position }}</ion-badge>
                          {{ item.team }}
                        </div>
                      </div>
                      <div class="watch-price-col">
                        <div class="watch-price">£{{ item.currentPrice }}m</div>
                        <div class="watch-change" [class]="item.priceChange > 0 ? 'positive' : item.priceChange < 0 ? 'negative' : 'neutral'">
                          <ion-icon [name]="item.priceChange > 0 ? 'trending-up' : item.priceChange < 0 ? 'trending-down' : 'remove'"></ion-icon>
                          {{ item.priceChange > 0 ? '+' : '' }}{{ item.priceChange | number:'1.1-1' }}
                        </div>
                      </div>
                    </div>
                    @if (item.notes) {
                      <div class="watch-notes">{{ item.notes }}</div>
                    }
                    <div class="watch-added">Added {{ item.addedDate }} · Was £{{ item.priceAtAdd }}m</div>
                  </div>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" (click)="removeItem(item.playerId)">
                    <ion-icon name="trash" slot="icon-only"></ion-icon>
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            }
          </ion-list>
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }

    .watch-item { --background: transparent; --padding-start: 0; --inner-padding-end: 0; margin-bottom: 8px; }
    .watch-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; width: 100%; }
    .watch-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .watch-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
    .watch-meta { font-size: 0.68rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .pos-badge { font-size: 0.55rem; font-weight: 700; padding: 1px 5px; --background: var(--surface-elevated); --color: var(--text-secondary); }
    .pos-gk { --background: #F59E0B20; --color: #F59E0B; }
    .pos-def { --background: #00D68F20; --color: #00D68F; }
    .pos-mid { --background: #3B82F620; --color: #3B82F6; }
    .pos-fwd { --background: #EF444420; --color: #EF4444; }
    .watch-price-col { text-align: right; }
    .watch-price { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
    .watch-change { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; display: flex; align-items: center; gap: 2px; justify-content: flex-end; }
    .watch-change.positive { color: var(--success); }
    .watch-change.negative { color: var(--danger); }
    .watch-change.neutral { color: var(--text-muted); }
    .watch-change ion-icon { font-size: 12px; }
    .watch-notes { font-size: 0.72rem; color: var(--text-secondary); margin-top: 8px; font-style: italic; padding: 6px 8px; background: var(--surface-elevated); border-radius: 6px; }
    .watch-added { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); margin-top: 6px; }
  `],
})
export class WatchlistPage {
  watchlistService = inject(WatchlistService);

  constructor() { addIcons({ trash, trendingUp, trendingDown, remove, eyeOutline }); }

  removeItem(playerId: number) {
    this.watchlistService.remove(playerId);
  }
}
