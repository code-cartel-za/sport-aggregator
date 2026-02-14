import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonSelect, IonSelectOption, IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, speedometer, swapHorizontal } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { FantasyPlayer, F1FantasyDriver, PlayerComparison, ComparisonMetric } from '../../models';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
    IonSegment, IonSegmentButton, IonLabel, IonIcon, IonSelect, IonSelectOption, IonButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">COMPARE</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <ion-segment [value]="mode()" (ionChange)="mode.set($any($event).detail.value)">
          <ion-segment-button value="fpl"><ion-icon name="football"></ion-icon><ion-label>FPL</ion-label></ion-segment-button>
          <ion-segment-button value="f1"><ion-icon name="speedometer"></ion-icon><ion-label>F1</ion-label></ion-segment-button>
        </ion-segment>

        @if (mode() === 'fpl') {
          <div class="select-row">
            <ion-select label="Player 1" label-placement="stacked" [value]="fplId1()" (ionChange)="fplId1.set($any($event).detail.value)" interface="action-sheet" class="cmp-select">
              @for (p of fplPlayers(); track p.id) { <ion-select-option [value]="p.id">{{ p.name }}</ion-select-option> }
            </ion-select>
            <ion-icon name="swap-horizontal" class="swap-icon"></ion-icon>
            <ion-select label="Player 2" label-placement="stacked" [value]="fplId2()" (ionChange)="fplId2.set($any($event).detail.value)" interface="action-sheet" class="cmp-select">
              @for (p of fplPlayers(); track p.id) { <ion-select-option [value]="p.id">{{ p.name }}</ion-select-option> }
            </ion-select>
          </div>
          <ion-button expand="block" class="mt-3" (click)="compareFpl()">Compare</ion-button>
        }

        @if (mode() === 'f1') {
          <div class="select-row">
            <ion-select label="Driver 1" label-placement="stacked" [value]="f1Id1()" (ionChange)="f1Id1.set($any($event).detail.value)" interface="action-sheet" class="cmp-select">
              @for (d of f1Drivers(); track d.id) { <ion-select-option [value]="d.id">{{ d.name }}</ion-select-option> }
            </ion-select>
            <ion-icon name="swap-horizontal" class="swap-icon"></ion-icon>
            <ion-select label="Driver 2" label-placement="stacked" [value]="f1Id2()" (ionChange)="f1Id2.set($any($event).detail.value)" interface="action-sheet" class="cmp-select">
              @for (d of f1Drivers(); track d.id) { <ion-select-option [value]="d.id">{{ d.name }}</ion-select-option> }
            </ion-select>
          </div>
          <ion-button expand="block" class="mt-3" (click)="compareF1()">Compare</ion-button>
        }

        @if (comparison()) {
          <div class="comparison-results mt-4">
            <div class="cmp-names">
              <span class="cmp-name p1">{{ getName(comparison()!.player1) }}</span>
              <span class="cmp-vs">VS</span>
              <span class="cmp-name p2">{{ getName(comparison()!.player2) }}</span>
            </div>

            @for (m of comparison()!.metrics; track m.label) {
              <div class="metric-row">
                <div class="metric-val p1-val" [class.winner]="m.value1 > m.value2">{{ m.value1 }}{{ m.unit || '' }}</div>
                <div class="metric-center">
                  <div class="metric-label">{{ m.label }}</div>
                  <div class="metric-bars">
                    <div class="bar-left">
                      <div class="bar-fill-left" [style.width.%]="(m.value1 / m.maxValue) * 100" [class.winner-bar]="m.value1 > m.value2"></div>
                    </div>
                    <div class="bar-right">
                      <div class="bar-fill-right" [style.width.%]="(m.value2 / m.maxValue) * 100" [class.winner-bar]="m.value2 > m.value1"></div>
                    </div>
                  </div>
                </div>
                <div class="metric-val p2-val" [class.winner]="m.value2 > m.value1">{{ m.value2 }}{{ m.unit || '' }}</div>
              </div>
            }
          </div>
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .select-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
    .cmp-select { flex: 1; }
    .swap-icon { font-size: 20px; color: var(--text-muted); }

    .comparison-results { }
    .cmp-names { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .cmp-name { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.95rem; color: var(--text-primary); }
    .cmp-name.p1 { color: var(--accent-gold); }
    .cmp-name.p2 { color: var(--accent-blue); }
    .cmp-vs { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); }

    .metric-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .metric-val { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); width: 50px; }
    .metric-val.winner { color: var(--text-primary); }
    .p1-val { text-align: right; }
    .p2-val { text-align: left; }
    .metric-center { flex: 1; }
    .metric-label { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); text-align: center; margin-bottom: 4px; letter-spacing: 0.05em; }
    .metric-bars { display: flex; gap: 2px; }
    .bar-left { flex: 1; height: 6px; background: var(--surface-elevated); border-radius: 3px 0 0 3px; overflow: hidden; display: flex; justify-content: flex-end; }
    .bar-right { flex: 1; height: 6px; background: var(--surface-elevated); border-radius: 0 3px 3px 0; overflow: hidden; }
    .bar-fill-left { height: 100%; background: rgba(212,168,71,0.4); border-radius: 3px 0 0 3px; transition: width 0.6s ease; }
    .bar-fill-right { height: 100%; background: rgba(59,130,246,0.4); border-radius: 0 3px 3px 0; transition: width 0.6s ease; }
    .bar-fill-left.winner-bar { background: var(--accent-gold); }
    .bar-fill-right.winner-bar { background: var(--accent-blue); }
  `],
})
export class ComparePage implements OnInit {
  private projService = inject(FantasyProjectionService);
  mode = signal('fpl');
  fplPlayers = signal<FantasyPlayer[]>([]);
  f1Drivers = signal<F1FantasyDriver[]>([]);
  fplId1 = signal(1);
  fplId2 = signal(2);
  f1Id1 = signal('max_verstappen');
  f1Id2 = signal('lando_norris');
  comparison = signal<PlayerComparison | null>(null);

  constructor() { addIcons({ football, speedometer, swapHorizontal }); }

  ngOnInit() {
    this.projService.getPlayers().subscribe(p => this.fplPlayers.set(p));
    this.projService.getF1Drivers().subscribe(d => this.f1Drivers.set(d));
  }

  compareFpl() {
    this.projService.comparePlayers(this.fplId1(), this.fplId2()).subscribe(c => this.comparison.set(c));
  }

  compareF1() {
    this.projService.compareF1Drivers(this.f1Id1(), this.f1Id2()).subscribe(c => this.comparison.set(c));
  }

  getName(p: FantasyPlayer | F1FantasyDriver): string {
    return 'shortName' in p ? (p as FantasyPlayer).shortName : (p as F1FantasyDriver).name;
  }
}
