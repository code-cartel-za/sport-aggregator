# Testing Guide

## Overview

Sport Aggregator uses **Jest** for unit testing across all three projects. Tests focus on critical paths: authentication, validation, caching, tier configuration, and service logic.

## Running Tests

### NestJS Backend (B2B API)
```bash
cd nest-js-backend && npx jest
```

### Firebase Cloud Functions
```bash
cd functions && npx jest
```

### Frontend (Angular/Ionic)
```bash
cd frontend && npx jest
```

### Run All
```bash
cd nest-js-backend && npx jest && cd ../functions && npx jest && cd ../frontend && npx jest
```

## Test Coverage

### NestJS Backend (~39 tests)

| File | What's Tested |
|------|---------------|
| `api-key.guard.spec.ts` | Auth guard: missing key, invalid key, suspended/revoked/expired, rate limiting, usage tracking |
| `response.interceptor.spec.ts` | B2B response wrapping, meta fields, rate limit info |
| `http-exception.filter.spec.ts` | Error formatting, validation errors, unknown errors |
| `auth.service.spec.ts` | API key creation, admin secret validation, key revocation, usage stats |
| `football.service.spec.ts` | Teams, players (filter by team/position), standings |
| `fpl.service.spec.ts` | Players (filter/sort), player detail, live gameweek |
| `f1.service.spec.ts` | Driver/constructor standings, race calendar, live positions |

### Cloud Functions (~25 tests)

| File | What's Tested |
|------|---------------|
| `validation.spec.ts` | Required/optional/number/string param validation |
| `error-handler.spec.ts` | Error type mapping (ValidationError, ExternalApiError, AppError), response format |
| `cache.spec.ts` | Cache get/set/getOrFetch, TTL expiry, fetcher invocation |

### Frontend (~11 tests)

| File | What's Tested |
|------|---------------|
| `tiers.config.spec.ts` | Free/Pro/Elite tier limits and feature access |
| `usage-tracking.service.spec.ts` | Usage tracking, limit enforcement, daily reset |

## Mocking Patterns

### Firestore Mock (NestJS)
`src/test/helpers/mock-firestore.ts` provides an in-memory Firestore mock supporting:
- `collection().doc().get()/set()/update()`
- `collection().where().get()`
- Nested subcollections

### Firebase Admin Mock (Functions)
`jest.mock('firebase-admin', ...)` at the top of test files for module-level `admin.firestore()` calls.

### localStorage Mock (Frontend)
Simple `Map`-backed mock attached to `globalThis.localStorage`.

## What's Not Yet Covered
- Controller/endpoint integration tests
- Firebase Auth middleware (functions)
- E2E tests
- Frontend Angular component tests (TestBed)
- FPL price changes, pit stops services
