# Backend Development Guide (Non-Technical Friendly)

This document explains, in plain language, everything a backend developer needs to build a secure, production-ready backend for the DAO Treasury Dashboard. It lists what the frontend needs, exact API endpoints, data formats, security requirements, and how everything fits together.

The frontend is a React + TypeScript app (Vite). It expects a base API URL via environment variable:

- `VITE_API_BASE_URL` (example: `http://localhost:3001/api`)

---

## 1) High-Level Overview

- Purpose: Track DAO treasury balances, assets, wallets, and transactions; simulate or record investments; show live market data.
- Users: Start with simple mode (no auth), then add secure login with 2FA. Plan for multiple users later.
- Networks: Support crypto symbols like BTC, ETH, SOL, USDT. Future: link real wallets and exchanges.

---

## 2) Frontend Pages → What Backend Must Provide

- `Dashboard` (`src/components/Dashboard/Dashboard.tsx`)
  - Needs: total portfolio value, 24h change, top movers, recent transactions, per-asset snapshot.
  - APIs: `/portfolio/summary`, `/crypto/prices`, `/portfolio/transactions?limit=5`.

- `Portfolio` (`src/pages/Portfolio.tsx`, `src/components/CryptoPortfolio/CryptoPortfolio.tsx`)
  - Needs: list of holdings (symbol, amount, value), allocation %, PnL, historical performance.
  - APIs: `/portfolio`, `/crypto/history/:symbol?range=30d`.

- `Wallets` (`src/pages/Wallets.tsx`, `src/components/wallet/*`)
  - Needs: connected wallets, balances by asset, recent transactions, wallet status.
  - APIs: `/wallets`, `/wallets/:id`, `/wallets/:id/transactions`.

- `Investment` (`src/pages/Investment.tsx`, `src/components/Investment/*`)
  - Needs: list investment options, risk badges, preview + confirm actions, record transactions.
  - APIs: `/investment/options`, `/portfolio/invest`, `/portfolio/transactions`.

- `InvestmentChart` (`src/components/InvestmentChart/InvestmentChart.tsx`)
  - Needs: time-series performance of total portfolio.
  - APIs: `/portfolio/performance?range=30d`.

- `CryptoTest` (`src/pages/CryptoTest.tsx`)
  - Today stores balances locally. Future: persist via backend.
  - APIs: `/portfolio`, `/portfolio/invest`, `/portfolio/transactions`.

- `Settings` (`src/pages/Settings.tsx`)
  - Needs: user profile, security, notifications, (future: API keys).
  - APIs: `/auth/me`, `/users/me`, `/users/me/security`, `/users/me/notifications`.

---

## 3) API Conventions (Follow These)

- Base path: `/api` (e.g., `/api/portfolio`).
- JSON only. UTF-8. No HTML.
- Success format: `{ "success": true, "data": ... }`
- Error format: `{ "success": false, "error": { "code": "STRING_CODE", "message": "...", "details": { ... } } }`
- Pagination: `?page=1&limit=20` → respond `{ data, page, limit, total, hasNext }`.
- Sorting: `?sort=field&order=asc|desc`.
- Filtering via query params (e.g., `?symbol=BTC&from=...&to=...`).
- Idempotency for write endpoints: require `Idempotency-Key` header.
- Prepare for versioning (`/api/v1`).

---

## 4) Security & Login (Top Priority)

Phase 1 can run without auth for quick integration. Phase 2 adds secure login + 2FA.

- Accounts:
  - Email + password (hash with Argon2 or bcrypt; never store plaintext).
  - Email verification and password reset.
- Tokens:
  - Short-lived JWT access token (~15m) + refresh token (~7d). Rotate refresh tokens.
- 2FA:
  - TOTP (Google Authenticator) for high-privilege actions; required for admins.
- Roles (future): `admin`, `member`.

Endpoints:
- `POST /auth/register` → `{ email, password, name }`
- `POST /auth/login` → `{ email, password }` → `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` → new access token
- `POST /auth/logout` → revoke refresh token
- `GET /auth/me` → current user
- `POST /auth/2fa/setup` → begin TOTP setup
- `POST /auth/2fa/verify` → confirm TOTP
- `POST /auth/forgot` / `POST /auth/reset` → password reset flow

Headers:
- `Authorization: Bearer <accessToken>` for protected endpoints.

---

## 5) Core Data Models (Simple View)

- User: `id`, `email`, `name`, `role`, `twoFactorEnabled`, `createdAt`, `updatedAt`
- Wallet: `id`, `address`, `chain` (`ethereum|solana|bitcoin`), `label`, `connectedAt`, `balancesByAsset`, `balanceFiat`
- PortfolioAsset: `symbol`, `name`, `amount`, `valueFiat`, `avgBuyPrice`, `pnl`, `allocationPct`, `change24hPct`
- Transaction: `id`, `type` (`buy|sell|transfer|stake`), `symbol`, `amount`, `price`, `fee`, `txHash?`, `timestamp`, `notes?`
- PricePoint: `symbol`, `timestamp`, `price`

---

## 6) Exact API Endpoints

### 6.1 Crypto Market
- `GET /crypto/prices`
  - Returns: `{ [symbol]: { price, change24hPct } }`
- `GET /crypto/history/:symbol?range=1d|7d|30d|90d|1y&resolution=5m|1h|1d`
  - Returns: `[{ timestamp, price }]`
  - Data source: CoinGecko/Coinbase/Binance (cache responses, respect limits).

### 6.2 Portfolio
- `GET /portfolio`
- `GET /portfolio/summary`
  - `{ totalValue, change24h, allocationByAsset[], topMovers[] }`
- `GET /portfolio/performance?range=30d`
  - `[{ timestamp, value }]`
- `GET /portfolio/transactions?page=1&limit=20`
- `POST /portfolio/invest`
  - Body example:
    ```json
    { "type": "buy", "symbol": "BTC", "amount": 0.1, "price": 67000.5, "simulate": false, "notes": "from exchange" }
    ```
  - Returns: created transaction + updated portfolio snapshot.
  - Require auth in Phase 2; validate inputs; use idempotency.

### 6.3 Wallets
- `GET /wallets`
- `POST /wallets/connect` → `{ address, chain, label }`
  - Future: verify address ownership via signed message.
- `GET /wallets/:id`
- `GET /wallets/:id/transactions?page=1&limit=20`
- `DELETE /wallets/:id`

### 6.4 Users & Settings
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/me/security`
- `PATCH /users/me/notifications`

---

## 7) Security Requirements (Crypto-Grade)

- Secrets: never in git; use env vars locally and secret manager in prod.
- HTTPS only; HSTS; TLS 1.2+.
- Auth: Argon2/bcrypt; brute-force lockout; JWT rotate; revoke on logout.
- 2FA: TOTP for admin and sensitive actions.
- Authorization: enforce role checks everywhere; default deny.
- Validation: schema-validate all inputs (Zod/Joi/Yup). Reject unknown fields.
- Rate limiting: per-IP + per-endpoint; stricter on auth/trading.
- Audit logs: record login, 2FA changes, wallet connect, investments.
- Data at rest: encrypt secrets/API keys; mask in logs.
- Errors: no stack traces to users; consistent error codes.
- CORS: allow-list frontend origins only.
- Dependencies: regular vulnerability scans; pin versions.

---

## 8) Database (Suggested Schema)

Tables (Postgres recommended):
- `users` (id, email, password_hash, name, role, twofa_secret, created_at, updated_at)
- `sessions` (id, user_id, refresh_token_hash, created_at, expires_at, revoked_at)
- `wallets` (id, user_id|null, address, chain, label, connected_at, deleted_at)
- `assets` (symbol PK, name, decimals)
- `portfolio_positions` (id, owner_id, symbol, amount, avg_buy_price, created_at, updated_at)
- `transactions` (id, owner_id, type, symbol, amount, price, fee, tx_hash, timestamp, notes)
- `price_points` (id, symbol, timestamp, price)
- `notification_prefs` (id, user_id, email_enabled, prefs_json)
- `audit_logs` (id, actor_user_id, action, resource_type, resource_id, meta_json, created_at)
- `idempotency_keys` (key, owner_id, endpoint, request_hash, created_at, expires_at)

---

## 9) Realtime & Jobs

- Realtime (future): WebSocket/SSE at `/realtime/prices` for live prices; auth channel for user updates.
- Jobs: price caching, wallet indexing, portfolio reconciliation, notifications.

---

## 10) Non-Functional

- Performance: P95 < 300ms normal endpoints.
- Reliability: `/healthz` and graceful shutdown.
- Observability: JSON logs, metrics (Prometheus), tracing (OpenTelemetry).
- Testing: unit + integration tests; contract tests for API shapes.
- Docs: OpenAPI/Swagger at `/docs`.

---

## 11) Local Dev Setup

- Example `.env`:
  - `PORT=3001`
  - `NODE_ENV=development`
  - `JWT_SECRET=change-me`
  - `REFRESH_TOKEN_SECRET=change-me`
  - `DATABASE_URL=postgres://...`
  - `REDIS_URL=redis://...`
  - `PRICE_FEED_API_KEY=...`
  - `CORS_ALLOWED_ORIGINS=http://localhost:5173`

- Optional Postgres via Docker:
  ```bash
  docker run --name treasury-postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16
  ```

- Migrations: use Prisma/Knex/TypeORM; keep schema in repo.

---

## 12) Type Contracts (for reference)

```ts
// Common
interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: any } }

// Auth
interface User { id: string; email: string; name: string; role: 'admin'|'member'; twoFactorEnabled: boolean; createdAt: string; updatedAt: string }
interface LoginResponse { accessToken: string; refreshToken: string; user: User }

// Market
interface PriceInfo { price: number; change24hPct: number }
interface PricesBySymbol { [symbol: string]: PriceInfo }

// Portfolio
interface PortfolioAsset { symbol: string; name: string; amount: number; valueFiat: number; avgBuyPrice?: number; pnl?: number; allocationPct?: number; change24hPct?: number }
interface PortfolioSummary { totalValue: number; change24h: number; allocationByAsset: Array<{ symbol: string; allocationPct: number }>; topMovers: Array<{ symbol: string; change24hPct: number }> }
interface PerformancePoint { timestamp: string; value: number }
interface Transaction { id: string; type: 'buy'|'sell'|'transfer'|'stake'; symbol: string; amount: number; price: number; fee?: number; txHash?: string; timestamp: string; notes?: string }

// Wallets
interface Wallet { id: string; address: string; chain: 'ethereum'|'solana'|'bitcoin'; label?: string; connectedAt: string; balanceFiat?: number; balancesByAsset?: { [symbol: string]: number } }
```

---

## 13) Phased Rollout

1) Read-only data: `/crypto/prices`, `/crypto/history/:symbol`, `/portfolio`, `/portfolio/transactions`.
2) Auth & persistence: `/auth/*`, compute portfolio from stored transactions, DB migrations.
3) Wallet indexing: Ethereum/Solana providers; verify ownership.
4) Trading (optional): abstract trade service, sandbox first, strict audit.

---

## 14) Security Checklist (Do Before Production)

- [ ] HTTPS everywhere; secure cookies
- [ ] Secrets in secret manager; no plaintext logs
- [ ] Strong passwords, lockouts, 2FA for admins
- [ ] JWT rotation + refresh revocation
- [ ] Validate every input; schema-based
- [ ] Rate limiting; IP controls for admin endpoints
- [ ] Audit logs for all sensitive actions
- [ ] CORS allow-list only
- [ ] Regular dependency scanning/updates
- [ ] Backups + restore drills
- [ ] `/healthz`, `/readyz` + monitoring/alerts

---

## 15) Success Tips (Non-Technical)

- Talk early: confirm fields and shapes before coding.
- Start with mock data, then wire real providers.
- Separate environments: local/stage/prod with different keys.
- Document assumptions in PRs.
- Default to secure: especially for auth, wallets, and any trading.
