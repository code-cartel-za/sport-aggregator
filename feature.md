# Feature: Fantasy Insights Overhaul

## Branch: `feature/fantasy-insights-overhaul`

## Summary
Complete redesign of the Sport Aggregator app with a "Command Center" aesthetic and 10 new fantasy sports features.

---

## 1. Design Overhaul — "Command Center" Theme

### Color System
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#060D18` | Deep navy-black background |
| `--surface` | `#0F1A2E` | Card surfaces |
| `--surface-elevated` | `#162036` | Elevated surfaces |
| `--border` | `#1E2D4A` | Borders |
| `--accent-gold` | `#D4A847` | Premium confidence accent |
| `--accent-blue` | `#3B82F6` | Data/links accent |
| `--success` | `#00D68F` | Positive indicators |
| `--danger` | `#EF4444` | Negative indicators |
| `--warning` | `#F59E0B` | Warning indicators |
| `--text-primary` | `#E8ECF1` | Primary text |
| `--text-secondary` | `#8896AB` | Secondary text |
| `--text-muted` | `#4A5568` | Muted text |

### Typography
- **Headings:** Outfit (geometric, confident, modern)
- **Body:** Plus Jakarta Sans (clean, readable)
- **Data/Numbers:** JetBrains Mono (monospace for stats)

### Design Features
- Glass-morphism effects on key cards
- Gold accent borders for premium feel
- Fade-in animations on page load
- Gradient accent lines (gold → blue)
- Shimmer loading skeletons

---

## 2. Fantasy Points Projection System

### FPL Scoring Model
- Minutes: 1pt per 60 mins played
- Goals: FWD 4pt, MID 5pt, DEF/GK 6pt
- Assists: 3pt
- Clean sheets: DEF/GK 4pt, MID 1pt
- Saves: GK 1pt per 3 saves
- Bonus: 1-3pt
- Yellow cards: -1pt, Red cards: -3pt
- Penalties missed: -2pt
- Goals conceded: DEF/GK -1pt per 2
- Own goals: -2pt

### F1 Fantasy Scoring
- Race position: P1=25pt down to P10=1pt
- Qualifying bonus: Top 3 = 3pt, Top 5 = 1pt
- Fastest lap: 1pt
- Positions gained: 2pt each
- Beat teammate: 5pt
- DNF: -15pt
- Sprint: half points

### Projection Factors
- Player form (last 5 games weighted average)
- Fixture Difficulty Rating
- Home/away advantage multiplier
- Historical performance vs opponent

---

## 3. New Features (10)

### Feature 1: Points Projector (`/projections`)
Detailed breakdown of projected FPL/F1 points per player/driver. Shows confidence bars, point breakdown by category (goals, assists, CS, etc.).

### Feature 2: Dream Team Builder (`/dream-team`)
Optimal 15-player squad (11 + 4 bench) with formation display, captain/vice-captain picks, budget tracking. F1 mode: 5 drivers + 2 constructors.

### Feature 3: Fixture Difficulty Rating (`/fdr`)
Color-coded grid showing 6 upcoming fixtures for all 20 PL teams. Green (easy) → Red (hard). Based on team strength and home/away.

### Feature 4: Captain Pick Recommender (`/captain`)
Ranked top 10 captain choices with projected ×2 points, confidence levels, fixture difficulty, and reasoning.

### Feature 5: Form Tracker Dashboard (`/form-tracker`)
Mini bar charts (sparklines) showing points over last 10 gameweeks per player. Filter by position. Color-coded trend arrows.

### Feature 6: Differential Finder (`/differentials`)
Low-ownership (<25%) high-value picks sorted by points-per-million. Shows trends (rising/falling/stable).

### Feature 7: Head-to-Head Comparison (`/compare`)
Side-by-side player comparison with dual bar charts. 8+ metrics compared. Works for both FPL players and F1 drivers.

### Feature 8: Transfer Watchlist (`/watchlist`)
Personal watchlist stored in localStorage. Track price changes, add notes. Swipe-to-delete via Ionic sliding items.

### Feature 9: Gameweek Digest (`/digest`)
Weekly summary: deadline countdown, top picks, price risers/fallers, injury updates, key fixtures with FDR dots.

### Feature 10: Points Simulator (`/simulator`)
What-if tool: add events (goals, assists, cards, etc.) and see simulated vs. projected points with visual comparison bars.

---

## 4. New Files

### Models
- `src/app/models/fantasy.model.ts` — All fantasy types (FantasyPlayer, FantasyProjection, DreamTeam, FDR, Watchlist, Simulation, F1Fantasy, Comparison)

### Services
- `src/app/services/fantasy-projection.service.ts` — Core projection engine with realistic mock data (20 FPL players, 8 F1 drivers)
- `src/app/services/fdr.service.ts` — Fixture difficulty calculations for 20 PL teams
- `src/app/services/watchlist.service.ts` — localStorage-backed watchlist with Angular signals

### Pages
- `src/app/pages/projections/projections.page.ts`
- `src/app/pages/dream-team/dream-team.page.ts`
- `src/app/pages/fdr/fdr.page.ts`
- `src/app/pages/captain/captain.page.ts`
- `src/app/pages/form-tracker/form-tracker.page.ts`
- `src/app/pages/differentials/differentials.page.ts`
- `src/app/pages/compare/compare.page.ts`
- `src/app/pages/watchlist/watchlist.page.ts`
- `src/app/pages/digest/digest.page.ts`
- `src/app/pages/simulator/simulator.page.ts`

### Updated Files
- `src/index.html` — New Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)
- `src/styles.scss` — Complete Command Center theme
- `src/app/app.routes.ts` — All new routes
- `src/app/app.tabs.ts` — Updated tab bar (Analysis → Insights with bulb icon)
- `src/app/pages/home/home.page.ts` — Dashboard with feature cards grid
- `src/app/pages/football/football.page.ts` — Updated theme
- `src/app/pages/f1/f1.page.ts` — Updated theme
- `src/app/pages/analysis/analysis.page.ts` — Renamed to Insights, updated theme
- `src/app/pages/settings/settings.page.ts` — Updated theme

---

## 5. Technical Details

- **Framework:** Angular 21 + Ionic 8 + Tailwind 4
- **All components:** Standalone with inline styles
- **State management:** Angular signals
- **Mock data:** Realistic player names, teams, stats (20 FPL players, 8 F1 drivers, 20 PL teams)
- **Build:** Passes `npx ng build` with zero errors
