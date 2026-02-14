import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';
import { consentGuard } from './guards/consent.guard';

export const routes: Routes = [
  {
    path: 'api-docs',
    loadComponent: () => import('./pages/api-docs/api-docs.page').then(m => m.ApiDocsPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [loginGuard],
  },
  {
    path: 'consent',
    loadComponent: () => import('./pages/legal/consent.page').then(m => m.ConsentPage),
    canActivate: [authGuard],
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/legal/privacy-policy.page').then(m => m.PrivacyPolicyPage),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/legal/terms.page').then(m => m.TermsPage),
  },
  {
    path: '',
    loadComponent: () => import('./app.tabs').then(m => m.TabsPage),
    canActivate: [authGuard, consentGuard],
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
