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

### Backend — Cloud Functions (19 endpoints)

| Domain | Function | Description | Cache |
|--------|----------|-------------|-------|
| **Football Data** | `fetchEplTeams` | All 20 EPL teams → Firestore | — |
| | `fetchEplPlayers` | All squad members → Firestore | — |
| **FPL** | `syncFplBootstrap` | Full player data (prices, ownership, xG, ICT) | 24h |
| | `getFplLivePoints` | Live gameweek points | 60s |
| | `getFplPriceChanges` | Detect price rises/falls | — |
| | `getFplPlayerSummary` | Player fixtures + history | 6h |
| **Live Matches** | `getLiveScores` | All live fixture scores | 30s |
| | `getMatchEvents` | Goals, cards, subs with minute | 30s |
| | `getMatchLineups` | Starting XI + formation | 2h |
| | `getMatchStats` | Shots, possession, corners | 30s |
| | `getMatchPredictions` | Win probability + predictions | 12h |
| **F1** | `getF1Positions` | Real-time race positions | 5s |
| | `getF1Laps` | Sector times, lap durations | 10s |
| | `getF1PitStops` | Pit timing + tire compounds | 15s |
| | `getF1RaceControl` | Flags, safety car, incidents | 10s |
| | `getF1Intervals` | Gaps to leader + car ahead | 10s |
| | `syncF1Standings` | Driver + constructor standings | 24h |
| **Cache** | `getCacheStatus` | All cache entries + staleness | — |
| | `clearCache` | Clear specific key or all | — |

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

## 📋 Changelog

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
