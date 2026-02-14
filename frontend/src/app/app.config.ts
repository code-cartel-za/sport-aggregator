import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  getAuth, indexedDBLocalPersistence, browserLocalPersistence,
  initializeAuth, provideAuth,
} from '@angular/fire/auth';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { Capacitor } from '@capacitor/core';
import { firebaseConfig } from '../environment/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIonicAngular({ mode: 'ios' }),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const app = initializeApp(firebaseConfig);
      if (Capacitor.isNativePlatform()) {
        return initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
        });
      }
      return getAuth();
    }),
    provideAnalytics(() => getAnalytics()),
  ],
};
