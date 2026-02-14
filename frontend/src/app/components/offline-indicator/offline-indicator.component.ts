import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOffline()) {
      <div class="offline-banner">
        ⚡ You're offline — showing cached data
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      color: #ffd700;
      background: rgba(20, 20, 20, 0.9);
      border-bottom: 2px solid #ffd700;
      backdrop-filter: blur(8px);
    }
  `],
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = signal(!navigator.onLine);

  private onlineHandler = () => this.isOffline.set(false);
  private offlineHandler = () => this.isOffline.set(true);

  ngOnInit() {
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }
}
