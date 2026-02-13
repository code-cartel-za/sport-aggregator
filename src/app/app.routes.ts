import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app.tabs').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'football',
        loadComponent: () => import('./pages/football/football.page').then(m => m.FootballPage),
      },
      {
        path: 'f1',
        loadComponent: () => import('./pages/f1/f1.page').then(m => m.F1Page),
      },
      {
        path: 'analysis',
        loadComponent: () => import('./pages/analysis/analysis.page').then(m => m.AnalysisPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
