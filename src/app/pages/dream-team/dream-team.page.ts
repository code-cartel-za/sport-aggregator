import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, speedometer, star, starOutline } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { DreamTeam, F1FantasyTeam } from '../../models';

@Component({
  selector: 'app-dream-team',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonIcon, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">DREAM TEAM</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <ion-segment [value]="mode()" (ionChange)="mode.set($any($event).detail.value)">
          <ion-segment-button value="fpl"><ion-icon name="football"></ion-icon><ion-label>FPL</ion-label></ion-segment-button>
          <ion-segment-button value="f1"><ion-icon name="speedometer"></ion-icon><ion-label>F1</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      @if (mode() === 'fpl' && dreamTeam()) {
        <div class="px-4 pt-3">
          <!-- Summary Bar -->
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">PROJECTED</span>
              <span class="summary-value gold">{{ dreamTeam()!.totalProjected }}</span>
              <span class="summary-unit">pts</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">COST</span>
              <span class="summary-value">£{{ dreamTeam()!.totalCost | number:'1.1-1' }}m</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">FORMATION</span>
              <span class="summary-value">{{ dreamTeam()!.formation }}</span>
            </div>
          </div>

          <!-- Starters -->
          <div class="team-section-label">STARTING XI</div>
          @for (pick of dreamTeam()!.starters; track pick.player.id; let i = $index) {
            <div class="pick-row" [class.captain-row]="pick.isCaptain">
              <div class="pick-pos-badge" [class]="'pos-' + pick.player.position.toLowerCase()">{{ pick.player.position }}</div>
              <div class="pick-info">
                <div class="pick-name">
                  {{ pick.player.name }}
                  @if (pick.isCaptain) { <ion-icon name="star" class="cap-icon"></ion-icon> }
                  @if (pick.isViceCaptain) { <ion-icon name="star-outline" class="vc-icon"></ion-icon> }
                </div>
                <div class="pick-team">{{ pick.player.teamShort }} · £{{ pick.player.price }}m</div>
              </div>
              <div class="pick-pts">
                <span class="pick-pts-val">{{ pick.projectedPoints | number:'1.1-1' }}</span>
                @if (pick.isCaptain) { <span class="cap-mult">×2</span> }
              </div>
            </div>
          }

          <!-- Bench -->
          <div class="team-section-label bench-label">BENCH</div>
          @for (pick of dreamTeam()!.bench; track pick.player.id) {
            <div class="pick-row bench-row">
              <div class="pick-pos-badge" [class]="'pos-' + pick.player.position.toLowerCase()">{{ pick.player.position }}</div>
              <div class="pick-info">
                <div class="pick-name">{{ pick.player.name }}</div>
                <div class="pick-team">{{ pick.player.teamShort }} · £{{ pick.player.price }}m</div>
              </div>
              <div class="pick-pts"><span class="pick-pts-val muted">{{ pick.projectedPoints | number:'1.1-1' }}</span></div>
            </div>
          }
        </div>
      }

      @if (mode() === 'f1' && f1Team()) {
        <div class="px-4 pt-3">
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">PROJECTED</span>
              <span class="summary-value gold">{{ f1Team()!.totalProjected | number:'1.1-1' }}</span>
              <span class="summary-unit">pts</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">COST</span>
              <span class="summary-value">£{{ f1Team()!.totalCost | number:'1.1-1' }}m</span>
            </div>
          </div>

          <div class="team-section-label">DRIVERS (5)</div>
          @for (d of f1Team()!.drivers; track d.id; let i = $index) {
            <div class="pick-row">
              <div class="pick-pos-badge f1-badge" [style.background]="d.teamColor + '30'" [style.color]="d.teamColor">{{ d.code }}</div>
              <div class="pick-info">
                <div class="pick-name">{{ d.name }}</div>
                <div class="pick-team">{{ d.team }} · £{{ d.price }}m</div>
              </div>
              <div class="pick-pts"><span class="pick-pts-val">{{ d.totalPoints }}</span></div>
            </div>
          }

          <div class="team-section-label">CONSTRUCTORS (2)</div>
          @for (c of f1Team()!.constructors; track c.id) {
            <div class="pick-row">
              <div class="pick-pos-badge f1-badge">{{ c.name.substring(0, 3).toUpperCase() }}</div>
              <div class="pick-info">
                <div class="pick-name">{{ c.name }}</div>
                <div class="pick-team">£{{ c.price }}m</div>
              </div>
              <div class="pick-pts"><span class="pick-pts-val">{{ c.points }}</span></div>
            </div>
          }
        </div>
      }
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .summary-bar { display: flex; gap: 8px; margin-bottom: 16px; }
    .summary-item { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; text-align: center; }
    .summary-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .summary-value { display: block; font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .summary-value.gold { color: var(--accent-gold); }
    .summary-unit { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); }

    .team-section-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.12em; margin: 16px 0 8px; }
    .bench-label { color: var(--text-muted); opacity: 0.6; }

    .pick-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 6px; }
    .captain-row { border-color: rgba(212,168,71,0.4); background: rgba(212,168,71,0.05); }
    .bench-row { opacity: 0.6; }
    .pick-pos-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 700; padding: 4px 6px; border-radius: 6px; background: var(--surface-elevated); color: var(--text-secondary); min-width: 32px; text-align: center; }
    .pos-gk { background: #F59E0B20; color: #F59E0B; }
    .pos-def { background: #00D68F20; color: #00D68F; }
    .pos-mid { background: #3B82F620; color: #3B82F6; }
    .pos-fwd { background: #EF444420; color: #EF4444; }
    .f1-badge { min-width: 36px; }
    .pick-info { flex: 1; }
    .pick-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 4px; }
    .pick-team { font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
    .pick-pts { text-align: right; }
    .pick-pts-val { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; font-weight: 800; color: var(--accent-gold); }
    .pick-pts-val.muted { color: var(--text-muted); }
    .cap-icon { color: var(--accent-gold); font-size: 14px; }
    .vc-icon { color: var(--text-secondary); font-size: 14px; }
    .cap-mult { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--accent-gold); display: block; }
  `],
})
export class DreamTeamPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  mode = signal('fpl');
  dreamTeam = signal<DreamTeam | null>(null);
  f1Team = signal<F1FantasyTeam | null>(null);

  constructor() { addIcons({ football, speedometer, star, starOutline }); }

  ngOnInit() {
    this.projService.getDreamTeam().subscribe(dt => this.dreamTeam.set(dt));
    this.projService.getF1DreamTeam().subscribe(t => this.f1Team.set(t));
  }
}
