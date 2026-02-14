import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trendingUp, trophy, flash, chevronForward } from 'ionicons/icons';

interface Slide {
  icon: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
  template: `
    <ion-content fullscreen class="onboarding-content" [scrollY]="false">
      <div class="onboarding-wrapper">

        <button class="skip-btn" (click)="goToLogin()">Skip</button>

        <div class="slides-container" [style.transform]="'translateX(-' + currentIndex() * 100 + '%)'">
          @for (slide of slides; track slide.title) {
            <div class="slide">
              <div class="slide-icon">
                <ion-icon [name]="slide.icon"></ion-icon>
              </div>
              <h1 class="slide-title">{{ slide.title }}</h1>
              <p class="slide-subtitle">{{ slide.subtitle }}</p>
            </div>
          }
        </div>

        <div class="dots">
          @for (slide of slides; track slide.title; let i = $index) {
            <span class="dot" [class.active]="i === currentIndex()" (click)="currentIndex.set(i)"></span>
          }
        </div>

        <div class="bottom-actions">
          @if (currentIndex() < slides.length - 1) {
            <ion-button expand="block" class="next-btn" (click)="next()">
              Next
              <ion-icon name="chevron-forward" slot="end"></ion-icon>
            </ion-button>
          } @else {
            <ion-button expand="block" class="get-started-btn" (click)="goToLogin()">
              Get Started
              <ion-icon name="chevron-forward" slot="end"></ion-icon>
            </ion-button>
          }
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .onboarding-content { --background: #060D18; }
    .onboarding-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .skip-btn {
      position: absolute;
      top: 16px;
      right: 20px;
      background: none;
      border: none;
      color: #64748b;
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      z-index: 10;
      padding: 8px 12px;
    }
    .slides-container {
      display: flex;
      flex: 1;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .slide {
      min-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 16px;
    }
    .slide-icon {
      width: 100px;
      height: 100px;
      border-radius: 28px;
      background: linear-gradient(135deg, rgba(212, 168, 71, 0.15), rgba(212, 168, 71, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32px;
      font-size: 48px;
      color: #D4A847;
    }
    .slide-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.6rem;
      color: #e2e8f0;
      margin: 0 0 12px;
      line-height: 1.2;
    }
    .slide-subtitle {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.95rem;
      color: #64748b;
      line-height: 1.6;
      max-width: 300px;
      margin: 0;
    }
    .dots {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .dot.active {
      width: 24px;
      border-radius: 4px;
      background: #D4A847;
    }
    .bottom-actions {
      width: 100%;
      max-width: 360px;
      margin: 0 auto;
    }
    .next-btn, .get-started-btn {
      --background: linear-gradient(135deg, #D4A847 0%, #B8860B 100%);
      --border-radius: 14px;
      --color: #060D18;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1rem;
    }
  `],
})
export class OnboardingPage {
  private router = inject(Router);

  currentIndex = signal(0);

  slides: Slide[] = [
    {
      icon: 'trending-up',
      title: 'Fantasy insights powered by data',
      subtitle: 'AI-driven projections and analytics to dominate your fantasy leagues.',
    },
    {
      icon: 'trophy',
      title: 'FPL & F1 Fantasy tools',
      subtitle: 'Captain picks, differentials, dream team builder, and more — all in one place.',
    },
    {
      icon: 'flash',
      title: 'Your competitive edge',
      subtitle: 'Live data, smart alerts, and deep analysis to stay ahead of the pack.',
    },
  ];

  constructor() {
    addIcons({ trendingUp, trophy, flash, chevronForward });
  }

  next() {
    if (this.currentIndex() < this.slides.length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
