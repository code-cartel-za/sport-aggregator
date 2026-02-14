import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, OfflineIndicatorComponent],
  template: `
    <ion-app>
      <app-offline-indicator />
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
})
export class App {}
