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
        path: 'insights',
        loadComponent: () => import('./pages/analysis/analysis.page').then(m => m.AnalysisPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
      },
      /* ── New Feature Pages ── */
      {
        path: 'projections',
        loadComponent: () => import('./pages/projections/projections.page').then(m => m.ProjectionsPage),
      },
      {
        path: 'dream-team',
        loadComponent: () => import('./pages/dream-team/dream-team.page').then(m => m.DreamTeamPage),
      },
      {
        path: 'fdr',
        loadComponent: () => import('./pages/fdr/fdr.page').then(m => m.FDRPage),
      },
      {
        path: 'captain',
        loadComponent: () => import('./pages/captain/captain.page').then(m => m.CaptainPage),
      },
      {
        path: 'form-tracker',
        loadComponent: () => import('./pages/form-tracker/form-tracker.page').then(m => m.FormTrackerPage),
      },
      {
        path: 'differentials',
        loadComponent: () => import('./pages/differentials/differentials.page').then(m => m.DifferentialsPage),
      },
      {
        path: 'compare',
        loadComponent: () => import('./pages/compare/compare.page').then(m => m.ComparePage),
      },
      {
        path: 'watchlist',
        loadComponent: () => import('./pages/watchlist/watchlist.page').then(m => m.WatchlistPage),
      },
      {
        path: 'digest',
        loadComponent: () => import('./pages/digest/digest.page').then(m => m.DigestPage),
      },
      {
        path: 'simulator',
        loadComponent: () => import('./pages/simulator/simulator.page').then(m => m.SimulatorPage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
