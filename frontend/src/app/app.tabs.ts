import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  home, homeOutline,
  football, footballOutline,
  speedometer, speedometerOutline,
  bulb, bulbOutline,
  settings, settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home">
          <ion-icon name="home-outline"></ion-icon>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="football">
          <ion-icon name="football-outline"></ion-icon>
          <ion-label>Football</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="f1">
          <ion-icon name="speedometer-outline"></ion-icon>
          <ion-label>F1</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="insights">
          <ion-icon name="bulb-outline"></ion-icon>
          <ion-label>Insights</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="settings">
          <ion-icon name="settings-outline"></ion-icon>
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({
      home, homeOutline, football, footballOutline,
      speedometer, speedometerOutline, bulb, bulbOutline,
      settings, settingsOutline,
    });
  }
}
