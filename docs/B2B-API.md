# B2B API Documentation

Sport Aggregator B2B API — Fantasy sports data for partners.

**Base URL:** `https://api.sportaggregator.com/v1`
**Swagger Docs:** `https://api.sportaggregator.com/docs`

---

## Getting Started

1. **Request an API key** — Contact us or use the admin endpoint
2. **Include your key** in every request as `x-api-key` header
3. **Explore** the Swagger docs at `/docs`

```bash
curl -H "x-api-key: sk_live_your_key" https://api.sportaggregator.com/v1/football/teams?competition=PL
```

---

## Authentication

All data endpoints require an `x-api-key` header.

| Header | Description |
|--------|-------------|
| `x-api-key` | Your API key (required for all data endpoints) |
| `x-admin-secret` | Admin secret (required for key management only) |

### Key Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/auth/keys` | Create API key | `x-admin-secret` |
| DELETE | `/v1/auth/keys/:key` | Revoke API key | `x-admin-secret` |
| GET | `/v1/auth/keys/usage` | Get own usage | `x-api-key` |

---

## Rate Limits

| Tier | Requests/min | Requests/day | Price |
|------|-------------|-------------|-------|
| **Starter** | 30 | 1,000 | Free / $29/mo |
| **Growth** | 120 | 10,000 | $99/mo |
| **Enterprise** | 600 | 100,000 | Custom |

Rate limit info is included in every response `meta.rateLimit`.

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-02-14T12:00:00.000Z",
    "cached": false,
    "rateLimit": {
      "remaining": 998,
      "limit": 1000,
      "resetAt": "2026-02-15T00:00:00.000Z"
    }
  }
}
```

---

## Endpoints

### Football

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/v1/football/teams` | List teams | `competition` (PL, BL1, SA, etc.) |
| GET | `/v1/football/players` | List players | `teamId`, `position`, `competition` |
| GET | `/v1/football/fixtures` | List fixtures | `status` (live\|scheduled\|finished), `date` (YYYY-MM-DD), `competition` |
| GET | `/v1/football/standings` | League standings | `competition` |

### FPL (Fantasy Premier League)

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/v1/fpl/players` | List FPL players | `position` (1-4), `team`, `minPrice`, `maxPrice`, `sortBy` (form\|points\|price\|ownership) |
| GET | `/v1/fpl/players/:id` | Single player + history | — |
| GET | `/v1/fpl/live` | Live gameweek points | `gw` (gameweek number) |
| GET | `/v1/fpl/prices` | Price changes | — |
| GET | `/v1/fpl/gameweeks` | All gameweek data | — |

### Formula 1

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|-------------|
| GET | `/v1/f1/standings` | Driver/constructor standings | `type` (drivers\|constructors) |
| GET | `/v1/f1/races` | Race calendar | `season` (year) |
| GET | `/v1/f1/live/positions` | Live positions | `sessionKey` |
| GET | `/v1/f1/live/laps` | Live lap data | `sessionKey`, `driverNumber` |
| GET | `/v1/f1/live/pitstops` | Pit stops | `sessionKey` |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/health` | Service health check (no auth required) |

---

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `MISSING_API_KEY` | 401 | `x-api-key` header not provided |
| `INVALID_API_KEY` | 401 | API key not found |
| `KEY_INACTIVE` | 403 | Key is suspended or revoked |
| `KEY_EXPIRED` | 403 | Key has expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Daily or per-minute limit reached |
| `VALIDATION_ERROR` | 400 | Invalid query parameters |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `INVALID_ADMIN_SECRET` | 403 | Wrong admin secret |

Error response format:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily limit of 1000 requests exceeded"
  },
  "meta": { ... }
}
```

---

## Pricing Tiers

### 🆓 Starter — Free / $29/mo
- 1,000 requests/day
- 30 requests/minute
- All endpoints
- Community support

### 🚀 Growth — $99/mo
- 10,000 requests/day
- 120 requests/minute
- All endpoints
- Email support
- Webhook notifications (coming soon)

### 🏢 Enterprise — Custom
- 100,000 requests/day
- 600 requests/minute
- All endpoints
- Dedicated support
- SLA guarantees
- Custom data feeds
