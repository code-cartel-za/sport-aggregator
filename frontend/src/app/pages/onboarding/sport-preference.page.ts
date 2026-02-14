import { Component, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { football, speedometer, layers, checkmarkCircle, chevronForward } from 'ionicons/icons';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

type SportPref = 'fpl' | 'f1' | 'both';

interface SportOption {
  key: SportPref;
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-sport-preference',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
  template: `
    <ion-content fullscreen class="pref-content" [scrollY]="false">
      <div class="pref-wrapper">

        <div class="header">
          <h1>What do you play?</h1>
          <p>Pick your fantasy game so we can personalise your experience.</p>
        </div>

        <div class="cards">
          @for (opt of options; track opt.key) {
            <button class="sport-card" [class.selected]="selected() === opt.key" (click)="selected.set(opt.key)">
              <div class="card-icon">
                <ion-icon [name]="opt.icon"></ion-icon>
              </div>
              <div class="card-text">
                <span class="card-title">{{ opt.title }}</span>
                <span class="card-sub">{{ opt.subtitle }}</span>
              </div>
              @if (selected() === opt.key) {
                <ion-icon name="checkmark-circle" class="check-icon"></ion-icon>
              }
            </button>
          }
        </div>

        <div class="bottom-actions">
          <ion-button expand="block" class="continue-btn" [disabled]="!selected()" (click)="proceed()">
            Continue
            <ion-icon name="chevron-forward" slot="end"></ion-icon>
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .pref-content { --background: #060D18; }
    .pref-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: 48px 24px 32px;
    }
    .header {
      text-align: center;
      margin-bottom: 36px;
    }
    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #e2e8f0;
      margin: 0 0 8px;
    }
    .header p {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
    }
    .cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .sport-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.25s ease;
      width: 100%;
      text-align: left;
      color: #e2e8f0;
    }
    .sport-card.selected {
      border-color: #D4A847;
      background: rgba(212, 168, 71, 0.08);
    }
    .card-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: rgba(212, 168, 71, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #D4A847;
      flex-shrink: 0;
    }
    .card-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .card-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.05rem;
    }
    .card-sub {
      font-size: 0.8rem;
      color: #64748b;
    }
    .check-icon {
      font-size: 24px;
      color: #D4A847;
      flex-shrink: 0;
    }
    .bottom-actions {
      margin-top: 32px;
      max-width: 360px;
      width: 100%;
      align-self: center;
    }
    .continue-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
    .continue-btn[disabled] { opacity: 0.4; }
  `],
})
export class SportPreferencePage {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  selected = signal<SportPref | null>(null);

  options: SportOption[] = [
    { key: 'fpl', icon: 'football', title: 'FPL', subtitle: 'Fantasy Premier League' },
    { key: 'f1', icon: 'speedometer', title: 'F1 Fantasy', subtitle: 'Formula 1 Fantasy' },
    { key: 'both', icon: 'layers', title: 'Both', subtitle: 'FPL & F1 Fantasy' },
  ];

  constructor() {
    addIcons({ football, speedometer, layers, checkmarkCircle, chevronForward });
  }

  async proceed() {
    const pref = this.selected();
    if (!pref) return;

    localStorage.setItem('sport_preference', pref);

    const user = this.auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(this.firestore, `users/${user.uid}/profile`, 'main'), {
          sportPreference: pref,
        }, { merge: true });
      } catch {
        // Firestore write failed — localStorage is fallback
      }
    }

    this.router.navigateByUrl('/favourite-team', { replaceUrl: true });
  }
}
