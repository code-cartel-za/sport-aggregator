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

### Backend (Cloud Functions)
| Function | Description |
|----------|-------------|
| `fetchEplTeams` | Pulls all 20 EPL teams → `teams/{teamId}` in Firestore |
| `fetchEplPlayers` | Pulls all squad members → `players/{playerId}` in Firestore |

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
| API Sources | football-data.org, Ergast F1 API, OpenF1 |
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
│   └── index.ts                    # fetchEplTeams, fetchEplPlayers
└── package.json
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
- **football-data.org**: Get free API key, set as `FOOTBALL_DATA_API_KEY` env var
- **Apple Developer**: Configure Sign in with Apple service ID

---

## 📋 Changelog

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
