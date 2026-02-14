# 🏟 Sport Aggregator

A premium fantasy sports insight tool for **FPL (Fantasy Premier League)** and **F1 Fantasy** players. Built with Angular 21, Ionic 8, Firebase, and a "Command Center" design aesthetic.

> **Live insight. Confident picks. Data-driven decisions.**

---

## 🎨 Design System — "Command Center"

| Element | Value |
|---------|-------|
| Background | `#060D18` deep navy-black |
| Surfaces | `#0F1A2E` / `#162036` |
| Accent Gold | `#D4A847` (confidence) |
| Accent Blue | `#3B82F6` (data) |
| Headings | **Outfit** |
| Body | **Plus Jakarta Sans** |
| Data/Numbers | **JetBrains Mono** |

Glass-morphism cards, gold accent borders, shimmer loading, gradient decorative lines.

---

## 📱 Features

### Core Pages
| Tab | Page | Description |
|-----|------|-------------|
| 🏠 Dashboard | `/home` | Quick-access grid to all features, upcoming fixtures/races |
| ⚽ Football | `/football` | Fixtures, results, standings with league selector |
| 🏎 F1 | `/f1` | Race calendar, driver standings, constructor standings |
| 💡 Insights | `/analysis` | H2H comparison, driver circuit analysis |
| ⚙️ Settings | `/settings` | Profile, dark mode, preferences, sign out |

### Authentication
| Feature | Description |
|---------|-------------|
| Google Sign-In | OAuth popup via Firebase Auth |
| Apple Sign-In | OAuth popup via Firebase Auth |
| Auth Guards | Protected routes, login redirect |
| Login Page | Branded screen with provider buttons |

### Fantasy Insight Features (10)
| # | Feature | Route | Description |
|---|---------|-------|-------------|
| 1 | 🔮 Points Projector | `/projections` | Projected FPL/F1 points with confidence bars and category breakdown |
| 2 | 🏆 Dream Team Builder | `/dream-team` | Pick 15-player squad within budget, see projected totals |
| 3 | 📅 Fixture Difficulty Rating | `/fdr` | Color-coded grid of upcoming 6 fixtures per team |
| 4 | 👑 Captain Recommender | `/captain` | Ranked captain picks with ×2 projected points |
| 5 | 📈 Form Tracker | `/form-tracker` | Sparkline form charts over last 10 GWs, trend arrows |
| 6 | 💎 Differential Finder | `/differentials` | High-value low-ownership picks, points-per-million |
| 7 | ⚔️ H2H Comparison | `/compare` | Side-by-side player comparison with dual bars |
| 8 | 👀 Transfer Watchlist | `/watchlist` | Personal watchlist with price tracking, swipe-to-delete |
| 9 | 📰 Gameweek Digest | `/digest` | Weekly summary, deadline countdown, injury updates |
| 10 | 🎲 Points Simulator | `/simulator` | "What if" scenario tool for event simulation |

### Backend — Cloud Functions (22 endpoints)

| Domain | Function | Description | Cache | Writes To |
|--------|----------|-------------|-------|-----------|
| **Football Data** | `fetchEplTeams` | All 20 EPL teams → Firestore | — | `teams/`, `competitions/` |
| | `fetchEplPlayers` | All squad members → Firestore | — | `players/` |
| | `syncFixtures` | PL match fixtures | 1h | `fixtures/`, `cache/fixtures` |
| | `syncStandings` | PL league standings | 1h | `competitions/PL/standings/`, `cache/` |
| **FPL** | `syncFplBootstrap` | Full player data (prices, ownership, xG, ICT) | 24h | `fpl/bootstrap`, `cache/` |
| | `getFplLivePoints` | Live gameweek points | 60s | `cache/` |
| | `getFplPriceChanges` | Detect price rises/falls | — | `cache/` |
| | `getFplPlayerSummary` | Player fixtures + history | 6h | `cache/` |
| **Live Matches** | `getLiveScores` | All live fixture scores | 30s | `cache/` |
| | `getMatchEvents` | Goals, cards, subs with minute | 30s | `cache/` |
| | `getMatchLineups` | Starting XI + formation | 2h | `cache/` |
| | `getMatchStats` | Shots, possession, corners | 30s | `cache/` |
| | `getMatchPredictions` | Win probability + predictions | 12h | `cache/` |
| **F1** | `getF1Positions` | Real-time race positions | 5s | `cache/` |
| | `getF1Laps` | Sector times, lap durations | 10s | `cache/` |
| | `getF1PitStops` | Pit timing + tire compounds | 15s | `cache/` |
| | `getF1RaceControl` | Flags, safety car, incidents | 10s | `cache/` |
| | `getF1Intervals` | Gaps to leader + car ahead | 10s | `cache/` |
| | `syncF1Standings` | Driver + constructor standings | 24h | `cache/f1_standings_*` |
| | `syncF1Races` | Race calendar by season | 24h | `cache/f1_races_*` |
| **Cache** | `getCacheStatus` | All cache entries + staleness | — | — |
| | `clearCache` | Clear specific key or all | — | — |

### Backend — NestJS Ingestion (12 endpoints)

| Endpoint | Method | Description | Writes To |
|----------|--------|-------------|-----------|
| `/ingestion/sync-all` | POST | Full sync across all sources | All collections |
| `/ingestion/football/teams` | POST | Sync EPL teams | `teams/`, `competitions/` |
| `/ingestion/football/players` | POST | Sync EPL players | `players/` |
| `/ingestion/football/fixtures` | POST | Sync EPL fixtures | `fixtures/`, `cache/` |
| `/ingestion/football/standings` | POST | Sync EPL standings | `competitions/*/standings/`, `cache/` |
| `/ingestion/fpl/bootstrap` | POST | Sync FPL bootstrap | `fpl/bootstrap`, `cache/` |
| `/ingestion/fpl/live?gw=X` | POST | Sync live GW data | `fpl/live_X`, `cache/` |
| `/ingestion/fpl/player-history` | POST | Sync player history | `cache/` |
| `/ingestion/f1/standings` | POST | Sync F1 standings | `cache/f1_standings_*` |
| `/ingestion/f1/races` | POST | Sync F1 race calendar | `cache/f1_races_*` |
| `/ingestion/f1/positions` | POST | Sync F1 live positions | `cache/` |
| `/ingestion/f1/laps` | POST | Sync F1 lap data | `cache/` |

---

## 📊 Fantasy Points Scoring

### FPL Scoring Model
| Event | Points |
|-------|--------|
| 60+ minutes played | 1pt |
| Goal (FWD / MID / DEF,GK) | 4pt / 5pt / 6pt |
| Assist | 3pt |
| Clean sheet (DEF,GK / MID) | 4pt / 1pt |
| Saves (GK, per 3) | 1pt |
| Bonus | 1-3pt |
| Yellow card | -1pt |
| Red card | -3pt |
| Penalty missed | -2pt |
| Goals conceded (DEF,GK per 2) | -1pt |
| Own goal | -2pt |

### F1 Fantasy Scoring
| Event | Points |
|-------|--------|
| Race P1-P10 | 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 |
| Qualifying Top 3 / Top 5 | 3pt / 1pt |
| Fastest lap | 1pt |
| Positions gained | 2pt each |
| Beat teammate | 5pt |
| DNF | -15pt |
| Sprint | Half points |

---

## 🗂 Firestore Collections

```
competitions/PL          — EPL metadata + current season
teams/{teamId}           — Team info, coach, venue, crest
players/{playerId}       — Player name, position, nationality, team ref
cache/{key}              — Server-side API response cache with TTL
fpl/bootstrap            — Full FPL player data snapshot
fpl/prices/{date}        — Daily price change records
live/premier-league      — Live match scores (realtime doc)
live/fpl-points          — Live FPL gameweek points
live/f1-race             — Live F1 race positions
f1/standings             — Driver + constructor standings
match-history/{id}       — Post-match stat snapshots (permanent)
users/{uid}/watchlist    — User's player watchlist
users/{uid}/preferences  — User settings
```

---

## 🏗 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Angular 21, Ionic 8, PrimeNG, Tailwind 4 |
| Backend | Firebase Cloud Functions (Node 24, TypeScript) |
| Database | Cloud Firestore |
| Auth | Firebase Auth (Google + Apple) |
| Analytics | Firebase Analytics |
| API Sources | FPL Official, football-data.org, API-Football, OpenF1, Jolpica |
| Native | Capacitor (iOS + Android ready) |

---

## 📁 Project Structure

```
├── frontend/                        # Angular/Ionic app
├── functions/                       # Firebase Cloud Functions (data pipeline)
├── nest-js-backend/                 # NestJS B2B API
│   ├── src/
│   │   ├── common/                  # Guards, filters, interceptors, decorators
│   │   ├── config/                  # Firebase module
│   │   ├── modules/
│   │   │   ├── auth/                # API key management
│   │   │   ├── football/            # Football data endpoints
│   │   │   ├── fpl/                 # FPL data endpoints
│   │   │   ├── f1/                  # F1 data endpoints
│   │   │   ├── health/              # Health check
│   │   │   └── usage/               # Usage tracking
│   │   ├── types/                   # B2B type definitions
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── docs/                            # Documentation
└── README.md
```

### Frontend Structure (`frontend/`)

```
src/
├── app/
│   ├── guards/
│   │   └── auth.guard.ts           # authGuard + loginGuard
│   ├── models/
│   │   ├── f1.model.ts             # F1 types
│   │   ├── fantasy.model.ts        # Fantasy projection types
│   │   ├── football.model.ts       # Football types
│   │   ├── subscription.model.ts   # User preferences
│   │   └── index.ts
│   ├── pages/
│   │   ├── home/                   # Dashboard
│   │   ├── football/               # Football hub
│   │   ├── f1/                     # F1 hub
│   │   ├── analysis/               # Insights (H2H, driver analysis)
│   │   ├── settings/               # Settings + profile
│   │   ├── login/                  # Auth page
│   │   ├── projections/            # Points projector
│   │   ├── dream-team/             # Squad builder
│   │   ├── fdr/                    # Fixture difficulty
│   │   ├── captain/                # Captain recommender
│   │   ├── form-tracker/           # Form dashboard
│   │   ├── differentials/          # Differential finder
│   │   ├── compare/                # H2H comparison
│   │   ├── watchlist/              # Transfer watchlist
│   │   ├── digest/                 # Gameweek summary
│   │   └── simulator/             # Points simulator
│   ├── services/
│   │   ├── auth.service.ts         # Firebase Auth
│   │   ├── football-api.service.ts # Football data
│   │   ├── f1-api.service.ts       # F1 data (Ergast + OpenF1)
│   │   ├── analysis.service.ts     # H2H analysis
│   │   ├── fantasy-projection.service.ts  # Core projection engine
│   │   ├── fdr.service.ts          # Fixture difficulty
│   │   ├── watchlist.service.ts    # Watchlist (localStorage)
│   │   └── subscription.service.ts # Preferences
│   ├── app.config.ts               # Firebase + Auth providers
│   ├── app.routes.ts               # All routes
│   └── app.tabs.ts                 # Tab bar
├── styles.scss                     # Command Center theme
└── index.html                      # Fonts + meta
functions/
├── src/
│   ├── @types/
│   │   ├── common/                 # ApiResponse<T>, CacheDoc<T>, AppError
│   │   ├── football/               # Competition, Team, Player, Fixture, Standing
│   │   ├── fpl/                    # FplElement, FplGameweek, FplLive
│   │   ├── f1/                     # F1Position, F1Lap, F1PitStop, F1Interval
│   │   └── index.ts                # Barrel re-export
│   ├── handlers/
│   │   ├── football-data.handlers.ts  # fetchEplTeams, fetchEplPlayers
│   │   ├── fpl.handlers.ts            # FPL data pipeline (4 functions)
│   │   ├── api-football.handlers.ts   # Live match data (5 functions)
│   │   ├── f1.handlers.ts             # F1 live + standings (6 functions)
│   │   └── cache.handlers.ts          # Cache management (2 functions)
│   ├── utils/
│   │   ├── cache.ts                # Firestore cache with TTL
│   │   ├── validation.ts           # Input validation + ValidationError
│   │   ├── error-handler.ts        # Error hierarchy + handleError()
│   │   └── api-clients.ts          # Configured axios instances (5 APIs)
│   └── index.ts                    # Clean re-exports
└── package.json
docs/
├── API-SCOPING.md                  # API landscape, pricing, rate limits
└── FEATURES.md                     # Feature registry + data flow diagrams
```

---

## 🚀 Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run dev server
npm start

# Build
npx ng build

# Deploy functions
cd functions && npm install && npm run deploy
```

### Required Config
- **Firebase Console**: Enable Google + Apple sign-in providers
- **football-data.org**: Free API key → `FOOTBALL_DATA_API_KEY` env var
- **API-Football**: Pro plan ($9.99/mo) → `API_FOOTBALL_KEY` env var
- **Apple Developer**: Configure Sign in with Apple service ID
- **FPL API**: No key needed (public endpoints)
- **OpenF1**: No key needed (public endpoints)

---

## 🧪 Running Tests

```bash
# NestJS Backend
cd nest-js-backend && npx jest

# Cloud Functions
cd functions && npx jest

# Frontend
cd frontend && npx jest
```

See [docs/TESTING.md](docs/TESTING.md) for full testing guide.

## 📋 Changelog

### v0.10.0 — Ship-Ready
- Firestore security rules (proper per-collection auth, deny-all catch)
- Capacitor native projects (iOS + Android) with app config
- CI/CD: GitHub Actions for build/test + auto-deploy functions
- .env templates for all secrets (functions + NestJS)
- Error states, loading skeletons, empty states across all pages
- `.gitignore` updated for native platforms

### v0.9.0 — Onboarding, Payments & Polish
- Full onboarding flow: carousel → sign-in → consent → sport preference → favourite team → FPL import
- Onboarding guard blocks app until flow complete
- Payment integration: RevenueCat (iOS/Android) + Stripe (web)
- NestJS Stripe endpoints (checkout session, webhook, status, cancel)
- Data export/deletion Cloud Functions (GDPR/POPI)
- FPL Firestore service (reads bootstrap from Firestore)
- Service worker + PWA (offline caching, offline indicator)
- Personalised dashboard (greeting, tier, GW countdown, live scores, watchlist)
- Watchlist persistence in Firestore with localStorage fallback
- B2B type export fix

### v0.8.0 — Firestore Data Layer & Ingestion
- **Frontend → Firestore**: Football & F1 services now read directly from Firestore (no mock data, no client API calls)
- **Firestore provider** added to Angular app config (`@angular/fire/firestore`)
- **NestJS Ingestion Module**: 12 POST endpoints for syncing data from external APIs → Firestore
- **CacheService**: Generic Firestore cache with TTL (get/set/getOrFetch pattern)
- **New Cloud Functions**: `syncFixtures`, `syncStandings`, `syncF1Races` write to dedicated collections
- **Updated Cloud Functions**: `syncF1Standings` now writes to `cache/f1_standings_drivers` + `cache/f1_standings_constructors`
- **UI overhaul**: Fixed invisible toolbar text, dark/light mode toggle, improved settings cards
- **Light mode theme**: Full light color palette with proper contrast
- **TS4053 fixes**: Exported all service interfaces, imported in controllers
- **Data architecture doc**: `docs/DATA-ARCHITECTURE.md` with Mermaid flow diagrams
- **Cost**: App reads from Firestore (~$0.25/mo) instead of burning API quota per user

### v0.7.0 — Unit Tests
- 75 unit tests across all three projects (NestJS, Functions, Frontend)
- API key guard tests (auth, rate limiting, expiry, status checks)
- B2B response interceptor and exception filter tests
- Service tests for auth, football, FPL, F1 modules
- Validation, error handling, and caching utility tests
- Tier configuration and usage tracking tests
- Reusable in-memory Firestore mock helper
- Jest configured for all projects
- Testing documentation (`docs/TESTING.md`)

### v0.6.0 — B2B API
- NestJS B2B API with full Swagger documentation
- API key authentication with tier-based rate limiting (starter/growth/enterprise)
- Football module: teams, players, fixtures, standings
- FPL module: players with filtering/sorting, live gameweek, price changes, gameweeks
- F1 module: standings, races, live positions, laps, pit stops
- Auth module: API key CRUD with admin secret protection
- Usage tracking per key per day with endpoint breakdown
- Typed response DTOs for complete Swagger schema generation
- Global exception filter with B2B error codes
- B2B response wrapper (requestId, timestamp, rateLimit metadata)
- Dockerfile for containerized deployment
- API documentation (`docs/B2B-API.md`)

### v0.5.0 — Subscription Infrastructure & Compliance
- 3-tier subscription system (Free / Pro £4.99/mo / Elite £9.99/mo) with feature flags
- TierService + UsageTrackingService with Angular signals
- Paywall component (premium design, monthly/yearly toggle, platform-aware)
- Blurred content wrapper + usage badge components
- Tier guards (proGuard, eliteGuard) + consent guard
- Full privacy policy (POPI Act + GDPR compliant)
- Full terms of service (NOT gambling disclaimer)
- Consent collection page with version-tracked records
- Settings: subscription management, privacy toggles, data export/deletion
- Compliance documentation (Apple App Store, Google Play, POPI, GDPR)
- Type system: `@types/subscription/` with 8 interfaces
- 14 new features registered (F-037 → F-050)

### v0.4.0 — Data Pipeline & Caching
- 19 Cloud Functions across 5 handler domains (football-data, FPL, API-Football, OpenF1, cache)
- Full type system: 17 type files in `@types/` with barrel exports, zero `any` types
- Firestore-backed caching with configurable TTL (5s → 24h per endpoint)
- Input validation with `ValidationError` on all parameterized functions
- Standardized error handling: `AppError`, `ValidationError`, `ExternalApiError`
- 5 configured API clients (football-data.org, API-Football, FPL, OpenF1, Jolpica)
- Feature registry documentation (`docs/FEATURES.md`) with Mermaid flow diagrams
- API scoping documentation (`docs/API-SCOPING.md`)

### v0.3.0 — Fantasy Insights Overhaul
- Complete "Command Center" design overhaul (new palette, typography, glass-morphism)
- Fantasy Points Projection Engine (FPL + F1 scoring models)
- 10 new fantasy insight features (projections, dream team, FDR, captain picks, form tracker, differentials, H2H compare, watchlist, digest, simulator)
- Renamed Analysis tab to Insights
- Dashboard redesign with feature card grid

### v0.2.0 — Authentication
- Google & Apple sign-in via Firebase Auth
- Auth guards on all tab routes
- Login page with branded UI
- User profile card + sign out in Settings

### v0.1.0 — Foundation
- Angular 21 + Ionic 8 + Tailwind 4 scaffold
- Football page (fixtures, results, standings)
- F1 page (race calendar, driver/constructor standings)
- Analysis page (H2H, driver circuit analysis)
- EPL data ingestion cloud functions (teams + players → Firestore)
- Dark-first theme with Sora + DM Sans typography
