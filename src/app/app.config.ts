import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { browserLocalPersistence, getAuth, indexedDBLocalPersistence, initializeAuth, inMemoryPersistence, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { firebaseConfig } from '../environment/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIonicAngular({ mode: 'ios' }),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() =>
      initializeApp({
        ...firebaseConfig,
      }),
    ),
    provideAnalytics(() => getAnalytics()),
  ],
};
