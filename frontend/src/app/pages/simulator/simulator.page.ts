import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
  IonButton, IonIcon, IonSelect, IonSelectOption, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, removeCircle, play } from 'ionicons/icons';
import { FantasyProjectionService } from '../../services/fantasy-projection.service';
import { FantasyPlayer, SimulationScenario, SimulationEvent } from '../../models';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons,
    IonButton, IonIcon, IonSelect, IonSelectOption, IonBadge,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
        <ion-title><span class="page-title">SIMULATOR</span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <div class="px-4 pt-3">
        <div class="sim-info">What-if points scenarios — simulate different match outcomes</div>

        <ion-select label="Select Player" label-placement="stacked" [value]="selectedId()" (ionChange)="selectedId.set($any($event).detail.value)" interface="action-sheet" class="sim-select">
          @for (p of players(); track p.id) { <ion-select-option [value]="p.id">{{ p.name }} ({{ p.teamShort }})</ion-select-option> }
        </ion-select>

        <!-- Events Builder -->
        <div class="events-section">
          <div class="events-header">
            <span class="events-title">EVENTS</span>
            <ion-button size="small" fill="clear" (click)="addEvent()">
              <ion-icon name="add" slot="start"></ion-icon> Add
            </ion-button>
          </div>

          @for (evt of events(); track $index; let i = $index) {
            <div class="event-row">
              <ion-select [value]="evt.type" (ionChange)="updateEventType(i, $any($event).detail.value)" interface="popover" class="evt-type-select">
                <ion-select-option value="goal">⚽ Goal</ion-select-option>
                <ion-select-option value="assist">🅰️ Assist</ion-select-option>
                <ion-select-option value="cleanSheet">🛡️ Clean Sheet</ion-select-option>
                <ion-select-option value="bonus">⭐ Bonus</ion-select-option>
                <ion-select-option value="yellowCard">🟨 Yellow Card</ion-select-option>
                <ion-select-option value="redCard">🟥 Red Card</ion-select-option>
                <ion-select-option value="penaltyMissed">❌ Pen Missed</ion-select-option>
                <ion-select-option value="ownGoal">🙈 Own Goal</ion-select-option>
                <ion-select-option value="saves">🧤 Saves</ion-select-option>
              </ion-select>
              <div class="evt-count">
                <button class="count-btn" (click)="decrementEvent(i)">−</button>
                <span class="count-val">{{ evt.count }}</span>
                <button class="count-btn" (click)="incrementEvent(i)">+</button>
              </div>
              <button class="remove-evt" (click)="removeEvent(i)">
                <ion-icon name="remove-circle"></ion-icon>
              </button>
            </div>
          }
        </div>

        <ion-button expand="block" class="mt-3" (click)="simulate()">
          <ion-icon name="play" slot="start"></ion-icon>
          Simulate
        </ion-button>

        @if (result()) {
          <div class="result-card mt-4 animate-fade-in">
            <div class="gradient-line" style="margin-bottom: 14px"></div>
            <div class="result-name">{{ result()!.playerName }}</div>
            <div class="result-grid">
              <div class="result-item">
                <span class="result-label">BASE PROJ</span>
                <span class="result-val">{{ result()!.basePoints | number:'1.1-1' }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">SIMULATED</span>
                <span class="result-val gold">{{ result()!.simulatedPoints }}</span>
              </div>
              <div class="result-item">
                <span class="result-label">DELTA</span>
                <span class="result-val" [class]="result()!.delta >= 0 ? 'positive' : 'negative'">
                  {{ result()!.delta >= 0 ? '+' : '' }}{{ result()!.delta }}
                </span>
              </div>
            </div>

            <!-- Visual comparison -->
            <div class="compare-bars">
              <div class="cmp-bar-row">
                <span class="cmp-bar-label">Base</span>
                <div class="cmp-bar-bg"><div class="cmp-bar-fill base" [style.width.%]="getBarWidth(result()!.basePoints)"></div></div>
                <span class="cmp-bar-val">{{ result()!.basePoints | number:'1.1-1' }}</span>
              </div>
              <div class="cmp-bar-row">
                <span class="cmp-bar-label">Sim</span>
                <div class="cmp-bar-bg"><div class="cmp-bar-fill sim" [style.width.%]="getBarWidth(result()!.simulatedPoints)"></div></div>
                <span class="cmp-bar-val gold">{{ result()!.simulatedPoints }}</span>
              </div>
            </div>
          </div>
        }
      </div>
      <div class="bottom-spacer"></div>
    </ion-content>
  `,
  styles: [`
    .page-title { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: 0.06em; font-size: 1rem; color: var(--accent-gold); }
    .sim-info { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px; }
    .sim-select { margin-bottom: 16px; }

    .events-section { margin-top: 16px; }
    .events-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .events-title { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); letter-spacing: 0.12em; }

    .event-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; }
    .evt-type-select { flex: 1; font-size: 0.8rem; --padding-start: 0; }
    .evt-count { display: flex; align-items: center; gap: 8px; }
    .count-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-elevated); color: var(--text-primary); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; }
    .count-val { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 700; color: var(--text-primary); min-width: 20px; text-align: center; }
    .remove-evt { background: none; border: none; color: var(--danger); font-size: 20px; cursor: pointer; display: flex; }

    .result-card { background: var(--surface); border: 1px solid rgba(212,168,71,0.3); border-radius: 14px; padding: 16px 20px; }
    .result-name { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 14px; }
    .result-grid { display: flex; gap: 8px; }
    .result-item { flex: 1; text-align: center; background: var(--surface-elevated); border-radius: 8px; padding: 10px; }
    .result-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); letter-spacing: 0.1em; }
    .result-val { display: block; font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
    .result-val.gold { color: var(--accent-gold); }
    .result-val.positive { color: var(--success); }
    .result-val.negative { color: var(--danger); }

    .compare-bars { margin-top: 16px; }
    .cmp-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .cmp-bar-label { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--text-muted); width: 30px; }
    .cmp-bar-bg { flex: 1; height: 8px; background: var(--surface-elevated); border-radius: 4px; overflow: hidden; }
    .cmp-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .cmp-bar-fill.base { background: var(--text-muted); }
    .cmp-bar-fill.sim { background: var(--accent-gold); }
    .cmp-bar-val { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); width: 35px; text-align: right; }
    .cmp-bar-val.gold { color: var(--accent-gold); }
  `],
})
export class SimulatorPage implements OnInit {
  private projService = inject(FantasyProjectionService);
  players = signal<FantasyPlayer[]>([]);
  selectedId = signal(1);
  events = signal<SimulationEvent[]>([{ type: 'goal', count: 1 }]);
  result = signal<SimulationScenario | null>(null);

  constructor() { addIcons({ add, removeCircle, play }); }

  ngOnInit() {
    this.projService.getPlayers().subscribe(p => this.players.set(p));
  }

  addEvent() {
    this.events.update(e => [...e, { type: 'goal', count: 1 }]);
  }

  removeEvent(i: number) {
    this.events.update(e => e.filter((_, idx) => idx !== i));
  }

  updateEventType(i: number, type: string) {
    this.events.update(e => e.map((evt, idx) => idx === i ? { ...evt, type: type as SimulationEvent['type'] } : evt));
  }

  incrementEvent(i: number) {
    this.events.update(e => e.map((evt, idx) => idx === i ? { ...evt, count: evt.count + 1 } : evt));
  }

  decrementEvent(i: number) {
    this.events.update(e => e.map((evt, idx) => idx === i ? { ...evt, count: Math.max(0, evt.count - 1) } : evt));
  }

  simulate() {
    this.projService.simulateScenario(this.selectedId(), this.events()).subscribe(r => this.result.set(r));
  }

  getBarWidth(pts: number): number {
    const max = Math.max(this.result()?.basePoints ?? 1, this.result()?.simulatedPoints ?? 1, 1);
    return (pts / max) * 100;
  }
}
