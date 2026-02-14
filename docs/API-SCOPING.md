# 🔍 API Scoping & Caching Architecture

## The Competitive Edge: Live Data + Smart Caching

---

## PART 1: API LANDSCAPE

### ⚽ FOOTBALL APIs

#### 1. Official FPL API (FREE — No Key Required)
**URL:** `https://fantasy.premierleague.com/api/`
**Cost:** FREE, unlimited (public endpoints, no auth)
**Rate Limits:** Unofficial — be respectful (~1 req/s)

| Endpoint | Data | Fantasy Value |
|----------|------|---------------|
| `/bootstrap-static/` | ALL players, teams, gameweeks, scoring rules, chips | **GOLDMINE** — every player's price, form, points, ownership %, ICT index, xG, xA |
| `/element-summary/{id}/` | Player's past GW history + upcoming fixtures with FDR | Fixture difficulty per player, historical points |
| `/event/{gw}/live/` | LIVE gameweek scores as they happen | Real-time points during matches |
| `/fixtures/` | All fixtures with scores, stats, BPS | Match results, bonus points |
| `/entry/{id}/` | Any manager's team, history, transfers | League analysis, template tracking |
| `/entry/{id}/event/{gw}/picks/` | Manager's picks for a gameweek | Ownership analysis in mini-leagues |

**Why this is the edge:** This API gives you the EXACT data FPL uses — ownership %, price changes, ICT index, expected stats (xG/xA), bonus point system. Nobody else has this. It's the source of truth.

---

#### 2. football-data.org (FREE tier + Paid)
**URL:** `https://api.football-data.org/v4/`
**Cost:** Free = 10 req/min | Paid from €9/mo
**Already integrated ✅**

| Tier | Leagues | Features |
|------|---------|----------|
| Free | PL, CL, BL, SA, PD, FL1, ELC, WC, EC | Teams, squads, matches, standings, scorers |
| Standard (€9/mo) | + Live scores, lineups, minute-by-minute | In-match events, substitutions |
| Advanced (€29/mo) | + Historical data, H2H, player stats | Deep analytics |

**Best for:** Team/squad data, match schedules, standings. Already using this for our cloud functions.

---

#### 3. API-Football (RapidAPI)
**URL:** `https://v3.football.api-sports.io/`
**Cost:** Free = 100 req/day | Pro = $9.99/mo (7,500 req/day) | Ultra = $29.99/mo (100,000 req/day)

| Endpoint | Data | Fantasy Value |
|----------|------|---------------|
| `/fixtures?live=all` | Live scores, events, stats | Real-time match tracking |
| `/fixtures/events` | Goals, cards, subs with minute | Live FPL point calculation |
| `/fixtures/lineups` | Starting XI, formation | Pre-match lineup confirmation |
| `/fixtures/statistics` | Shots, possession, corners | Live match momentum |
| `/players` | Season stats per player | Form analysis |
| `/predictions` | Match predictions, win probability | AI insight layer |
| `/odds` | Betting odds from bookmakers | Market-implied probabilities |

**Why it matters:** This is the richest football API. Live events (goals, cards) let us calculate FPL points IN REAL TIME. Their `/predictions` endpoint gives us bookmaker-level match intelligence for free.

---

#### 4. Sportmonks
**URL:** `https://api.sportmonks.com/v3/`
**Cost:** From €15/mo
**Speciality:** The deepest stat granularity — expected stats, advanced metrics, live commentary-level events.

Worth considering at scale. Overkill for now.

---

### 🏎 F1 APIs

#### 5. OpenF1 (FREE — No Key Required)
**URL:** `https://api.openf1.org/v1/`
**Cost:** FREE
**Rate Limits:** 3 req/s, 30 req/min (double for supporters)
**Data from:** 2023 season onwards

| Endpoint | Data | Fantasy Value |
|----------|------|---------------|
| `/car_data` | Speed, throttle, brake, RPM, gear @ 3.7Hz | Driver performance analysis |
| `/laps` | Sector times, lap durations | Pace comparison, consistency |
| `/position` | Real-time positions every 4 seconds | Live race tracking, overtake detection |
| `/pit` | Pit stop timing, tire compounds | Strategy analysis |
| `/team_radio` | Driver-to-pit audio URLs | Sentiment, strategy clues |
| `/weather` | Track temp, humidity, wind, rain | Weather impact on performance |
| `/race_control` | Flags, safety car, incidents | Race disruption events |
| `/stints` | Tire compounds, stint lengths | Tire degradation analysis |
| `/intervals` | Gap to leader, gap to car ahead | Live race dynamics |
| `/drivers` | Driver info per session | Roster data |

**Why this is insane:** Real-time telemetry ~3s delay. We can detect overtakes, pit stops, safety cars FASTER than TV broadcasts. Nobody in the F1 fantasy space uses this data properly.

---

#### 6. Ergast/Jolpica F1 API (FREE)
**URL:** `https://api.jolpi.ca/ergast/f1/` (Ergast successor)
**Cost:** FREE
**Already integrated ✅**

Historical race results, standings, qualifying, circuits. Great for the analytical/projection layer. Not real-time.

---

### 🏆 RECOMMENDED API STACK

| Layer | Football | F1 |
|-------|----------|-----|
| **Fantasy Data** | FPL Official API (free) | — |
| **Live Scores/Events** | API-Football Pro ($9.99/mo) | OpenF1 (free) |
| **Team/Squad Data** | football-data.org (free) | Jolpica/Ergast (free) |
| **Predictions** | API-Football `/predictions` | — |
| **Telemetry** | — | OpenF1 car_data/laps |

**Total cost: $9.99/mo** for production-grade live data across both sports.

---

## PART 2: DATA USAGE — WHAT TO PULL AND WHY

### Football: The Data Pipeline

```
┌─────────────────────────────────────────────────────┐
│  WEEKLY (once, cache for 7 days)                    │
│  • FPL /bootstrap-static → all players, prices,     │
│    ownership, form, ICT, xG/xA                      │
│  • football-data.org /teams → squads, coaches       │
│  • API-Football /predictions → match predictions    │
├─────────────────────────────────────────────────────┤
│  DAILY (once per day, cache 24h)                    │
│  • FPL /bootstrap-static → price changes detected   │
│  • FPL /element-summary/{id} → fixture difficulty   │
│  • API-Football /fixtures → upcoming matches        │
├─────────────────────────────────────────────────────┤
│  MATCHDAY — LIVE (every 30-60 seconds during games) │
│  • FPL /event/{gw}/live → LIVE FPL points           │
│  • API-Football /fixtures?live=all → live scores     │
│  • API-Football /fixtures/events → goals, cards      │
│  • API-Football /fixtures/lineups → confirmed XI     │
├─────────────────────────────────────────────────────┤
│  POST-MATCH (once after final whistle)              │
│  • FPL /event/{gw}/live → final points + bonus      │
│  • API-Football /fixtures/statistics → full stats    │
│  • Snapshot to Firestore for historical analysis     │
└─────────────────────────────────────────────────────┘
```

### F1: The Data Pipeline

```
┌─────────────────────────────────────────────────────┐
│  WEEKLY (cache until next race)                     │
│  • Jolpica → standings, calendar, historical        │
│  • OpenF1 /sessions → upcoming session schedule      │
├─────────────────────────────────────────────────────┤
│  RACE WEEKEND — LIVE (every 4-10 seconds)           │
│  • OpenF1 /position → live race positions            │
│  • OpenF1 /intervals → gaps between cars             │
│  • OpenF1 /laps → sector times, fastest laps         │
│  • OpenF1 /pit → pit stop events                     │
│  • OpenF1 /race_control → flags, safety car          │
│  • OpenF1 /car_data → speed, throttle (telemetry)    │
│  • OpenF1 /team_radio → new radio messages           │
├─────────────────────────────────────────────────────┤
│  POST-SESSION                                       │
│  • Jolpica → official results, points                │
│  • Snapshot all data to Firestore                    │
└─────────────────────────────────────────────────────┘
```

---

## PART 3: CACHING ARCHITECTURE

### The Problem
1,000 users open the app at kickoff. All want live scores. Without caching, that's 1,000 API calls every 30 seconds. API-Football Pro gives 7,500/day. You'd burn through your quota in **3.75 minutes**.

### The Solution: Server-Side Cache Layer in Firebase

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Client App  │────▶│  Cloud Functions  │────▶│  External APIs  │
│  (1000 users) │     │  (Cache Layer)    │     │  (football-data │
│               │◀────│                   │◀────│   API-Football  │
│               │     │  Firestore Cache  │     │   OpenF1, FPL)  │
└──────────────┘     └──────────────────┘     └────────────────┘
                            │
                     ┌──────▼──────┐
                     │  Firestore   │
                     │  Cache Docs  │
                     │  + TTL field │
                     └─────────────┘
```

### Cache Strategy by Data Type

| Data Type | TTL | Storage | Invalidation |
|-----------|-----|---------|--------------|
| Player master data (names, teams, positions) | 7 days | Firestore `players/` | Weekly cron refresh |
| FPL prices, ownership, form | 24 hours | Firestore `fpl-data/bootstrap` | Daily cron at 2am |
| Price changes | 6 hours | Firestore `fpl-data/prices` | Cron 4x/day |
| Fixtures/schedule | 24 hours | Firestore `fixtures/` | Daily refresh |
| Predictions | 12 hours | Firestore `predictions/` | Pre-matchday refresh |
| **Live scores** | **30 seconds** | **Firestore `live/` collection** | **On read if stale** |
| **Live FPL points** | **60 seconds** | **Firestore `live-fpl/`** | **On read if stale** |
| **Live F1 positions** | **5 seconds** | **Firestore `live-f1/`** | **On read if stale** |
| Post-match stats | Permanent | Firestore `match-history/` | Once, after final whistle |

### How Multi-User Caching Works

```typescript
// Cloud Function: getLiveScores (onRequest)
export const getLiveScores = onRequest(async (req, res) => {
  const cacheRef = db.collection('cache').doc('live-scores');
  const cached = await cacheRef.get();
  const now = Date.now();
  
  // If cache exists and is fresh (< 30 seconds old), serve it
  if (cached.exists && cached.data()?.cachedAt > now - 30_000) {
    res.json(cached.data()?.payload);  // ← 1000 users, 1 API call
    return;
  }
  
  // Cache miss or stale → fetch from API
  const fresh = await apiFootball.get('/fixtures?live=all');
  
  // Store in cache with timestamp
  await cacheRef.set({
    payload: fresh.data,
    cachedAt: now,
    ttlMs: 30_000,
  });
  
  res.json(fresh.data);
});
```

**Result:** 1,000 users hitting the endpoint = **1 API call per 30 seconds**, not 1,000. That's a 99.9% reduction.

### Real-Time Push with Firestore Listeners

Even better — skip HTTP polling entirely for live data:

```typescript
// Client-side: listen to Firestore cache doc directly
const liveScores$ = docData(
  doc(firestore, 'live/premier-league')
).pipe(
  map(data => data?.payload)
);

// Server-side: Cloud Function on a schedule (every 30s during matches)
// Updates the Firestore doc → all clients get pushed instantly
export const refreshLiveScores = onSchedule('every 30 seconds', async () => {
  const fresh = await apiFootball.get('/fixtures?live=all');
  await db.doc('live/premier-league').set({
    payload: fresh.data,
    updatedAt: Date.now(),
  });
  // ← All connected clients receive update via Firestore listener
});
```

**This is the real edge:** Users get live updates pushed to them via Firestore realtime listeners. Zero polling from the client. One server-side fetch serves unlimited users.

### Cache Layers (Defense in Depth)

```
Layer 1: Firestore Realtime Listener (instant push, 0 API calls from client)
Layer 2: Cloud Function with in-memory cache (sub-second, for HTTP fallback)
Layer 3: Firestore document cache (30s-24h TTL, survives function cold starts)
Layer 4: External API (only hit when all caches miss)
```

---

## PART 4: API CALL BUDGET

### API-Football Pro ($9.99/mo = 7,500 req/day)

| Use Case | Frequency | Calls/Day |
|----------|-----------|-----------|
| Live scores (matchday, ~3h window) | Every 30s × 6 concurrent matches | ~2,160 |
| Live events (goals, cards) | Every 30s during matches | ~360 |
| Lineups (pre-match) | Once per match × 10 matches/week | ~1.4/day avg |
| Predictions | Once per fixture | ~1.4/day avg |
| Player stats | Once per week refresh | ~0.3/day avg |
| **DAILY TOTAL (matchday)** | | **~2,522** |
| **DAILY TOTAL (non-matchday)** | | **~10** |

✅ Well within 7,500/day even on double-header matchdays.

### FPL API (Free, Unlimited)

| Use Case | Frequency | Calls/Day |
|----------|-----------|-----------|
| Bootstrap (all players) | 1× daily + 1× pre-deadline | 2 |
| Live GW points (matchday) | Every 60s × 3h | 180 |
| Element summaries (players) | Batch of 50 on demand, cached | ~50 |
| **DAILY TOTAL** | | **~232** |

✅ No rate limit issues — just be respectful.

### OpenF1 (Free, 3 req/s)

| Use Case | Frequency | Calls/Day |
|----------|-----------|-----------|
| Positions (race day, 2h) | Every 5s | ~1,440 |
| Intervals | Every 10s | ~720 |
| Pit stops | Every 15s | ~480 |
| Laps/sectors | Every 10s | ~720 |
| Race control | Every 10s | ~720 |
| **RACE DAY TOTAL** | | **~4,080** |

✅ At 3 req/s that's fine. Stagger the calls across endpoints.

---

## PART 5: FIRESTORE COLLECTION ARCHITECTURE

```
firestore/
├── cache/                        # Server-side API response cache
│   ├── live-scores               # TTL: 30s
│   ├── live-fpl-points           # TTL: 60s
│   ├── live-f1-positions         # TTL: 5s
│   ├── fpl-bootstrap             # TTL: 24h (all player data)
│   ├── fpl-prices                # TTL: 6h
│   └── predictions               # TTL: 12h
│
├── competitions/PL               # Competition metadata
├── teams/{teamId}                # Team data (already exists)
├── players/{playerId}            # Player data (already exists)
│
├── fpl/
│   ├── players/{elementId}       # FPL-specific: price, ownership, form, ICT
│   ├── gameweeks/{gw}            # GW deadlines, chip plays, avg score
│   └── price-changes/{date}      # Daily price risers/fallers
│
├── f1/
│   ├── drivers/{driverId}        # Driver season stats
│   ├── races/{round}             # Race results snapshot
│   └── sessions/{sessionKey}     # Session data from OpenF1
│
├── match-history/{fixtureId}     # Full post-match snapshots (permanent)
│
├── live/                         # Realtime docs (Firestore listeners)
│   ├── premier-league            # Current live PL scores
│   ├── fpl-points                # Current live FPL points
│   ├── f1-race                   # Current live F1 positions
│   └── f1-qualifying             # Current live quali times
│
└── users/{uid}/
    ├── watchlist                  # User's watchlist
    ├── preferences               # User settings
    └── teams/{gw}                # User's saved dream teams
```

---

## PART 6: IMPLEMENTATION ROADMAP

### Phase 1 — FPL Data Integration (Week 1)
- [ ] Cloud function: `syncFplBootstrap` — daily cron, pulls all player data
- [ ] Cloud function: `syncFplPrices` — 4x/day, detects price changes
- [ ] Cloud function: `getLivePoints` — matchday, 60s cache
- [ ] Firestore security rules for cache collections
- [ ] Client service: `FplDataService` consuming Firestore realtime

### Phase 2 — Live Match Data (Week 2)
- [ ] Cloud function: `syncLiveScores` — 30s during matches via API-Football
- [ ] Cloud function: `syncMatchEvents` — goals, cards, subs in real-time
- [ ] Cloud function: `syncLineups` — pre-match lineup confirmation
- [ ] Match detection: auto-start/stop live polling based on fixture schedule
- [ ] Client: live score cards with real-time Firestore listeners

### Phase 3 — F1 Live Integration (Week 3)
- [ ] Cloud function: `syncF1Positions` — 5s during race via OpenF1
- [ ] Cloud function: `syncF1Laps` — sector times, fastest laps
- [ ] Cloud function: `syncF1PitStops` — pit events
- [ ] Cloud function: `syncF1RaceControl` — flags, safety car
- [ ] Client: live race tracker with position changes

### Phase 4 — Intelligent Caching (Week 4)
- [ ] Match-aware scheduler (only poll when games are on)
- [ ] Firestore TTL auto-cleanup for stale cache docs
- [ ] Cold start optimization (in-memory cache in Cloud Functions)
- [ ] Usage monitoring dashboard (API calls/day tracking)
- [ ] Fallback chain: memory → Firestore → API

---

## TL;DR

| Question | Answer |
|----------|--------|
| **Total monthly API cost** | $9.99 (API-Football Pro) — everything else is free |
| **Users supported** | Unlimited (Firestore listeners, 1 API call serves all) |
| **Live football update speed** | 30 seconds |
| **Live F1 update speed** | 5 seconds |
| **FPL points update speed** | 60 seconds |
| **API call reduction** | 99.9% (cache layer) |
| **Key advantage** | Firestore realtime push = no client polling, instant updates |
