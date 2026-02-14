# Feature: Google & Apple Sign-In

## Goal
Authentication via Google and Apple using Firebase Auth with popup flow.

## What was built

### `AuthService` (`services/auth.service.ts`)
- `signInWithGoogle()` — Google OAuth via popup
- `signInWithApple()` — Apple OAuth via popup  
- `logout()` — signs out
- Reactive signals: `currentUser`, `isAuthenticated`, `displayName`, `photoURL`, `email`

### `LoginPage` (`pages/login/login.page.ts`)
- Clean branded login screen with Google + Apple buttons
- Loading spinners during auth flow
- Error handling (suppresses popup-closed-by-user)
- Redirects to `/home` on success

### Auth Guards (`guards/auth.guard.ts`)
- `authGuard` — protects all tab routes, redirects to `/login` if not authenticated
- `loginGuard` — redirects authenticated users away from login to `/home`

### Settings Page Updates
- User profile card (avatar, name, email)
- Sign Out button → redirects to `/login`

### App Config Updates
- `provideAuth()` wired up with Capacitor-aware persistence (indexedDB for native, default for web)

## Routes
- `/login` — login page (public, guarded by loginGuard)
- All tab routes — protected by authGuard

## Progress
- [x] AuthService with Google + Apple
- [x] Login page with branded UI
- [x] Auth guards (authenticated + login redirect)
- [x] Settings page: profile card + sign out
- [x] provideAuth in app.config
- [x] Build passes
- [ ] Firebase console: enable Google & Apple providers
- [ ] Apple developer: configure Sign in with Apple service
