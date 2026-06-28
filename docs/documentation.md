# CardSense Documentation

Technical reference for the CardSense monorepo: architecture, data models, REST API, and client integration. For local setup see [installation.md](./installation.md). For end-user workflows see [usage.md](./usage.md).

---

## Table of contents

1. [Overview](#1-overview)
2. [Project layout](#2-project-layout)
3. [System architecture](#3-system-architecture)
4. [Data model](#4-data-model)
5. [REST API](#5-rest-api)
6. [Frontends](#6-frontends)
7. [Integration notes](#7-integration-notes)
8. [Development & operations](#8-development--operations)
9. [Roadmap](#9-roadmap)

---

## 1. Overview

### 1.1 Purpose

CardSense is a personal finance assistant focused on **credit card rewards optimization**. Users can:

- Log and import transactions
- Set monthly budgets and receive threshold alerts
- Maintain a wallet of credit cards with reward rules
- Get card recommendations for a purchase category
- View dashboard analytics (spending, rewards, optimization stats)

One Django backend serves both the **Web** (React) and **Mobile** (Expo React Native) clients.

### 1.2 Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3, Django, Django REST Framework |
| Database | SQLite (dev); PostgreSQL-ready via Django settings |
| Web | React, TypeScript, React Router |
| Mobile | Expo, React Native, Expo Router |
| Auth | Session + CSRF (Web); token/session via API client (Mobile) |

### 1.3 Documentation map

| Document | Audience |
|----------|----------|
| [installation.md](./installation.md) | Developers — clone, install, run all three tiers |
| [usage.md](./usage.md) | Users — sign up, navigate features |
| **documentation.md** (this file) | Developers — architecture, models, API |

---

## 2. Project layout

### 2.1 Monorepo root

```
CardSense/
├── api/                 # Django project (settings, urls, wsgi)
├── accounts/            # Auth & user profile
├── transactions/        # Transactions, CSV import, card recommendation
├── budgets/             # Monthly budgets & alerts
├── cards/               # Card catalog, user wallet, reward rules
├── optimizer/           # Category selections & optimizer dashboard
├── analytics_views.py   # Dashboard analytics endpoint
├── manage.py
├── requirements.txt
├── db.sqlite3           # Dev database (may be pre-seeded)
├── web/                 # React web app
├── mobile/              # Expo mobile app
└── docs/                # Project documentation
```

Legacy folders (`CardSense_*-main/`) may remain from earlier zip imports; the active codebase lives at the root paths above.

### 2.2 Backend Django apps

| App | Responsibility |
|-----|----------------|
| `accounts` | Registration, login, logout, profile, password reset |
| `transactions` | CRUD transactions, CSV import, recommend-card, optimization stats |
| `budgets` | Monthly budget CRUD, current month, history, alerts |
| `cards` | Global card catalog, user cards, reward rules, benefits, rewards summary |
| `optimizer` | User category selections for personalized optimizer dashboard |

### 2.3 Web frontend (`web/`)

React SPA with routes for Dashboard, Transactions, Budgets, Cards, Analytics, and secondary pages (rewards breakdown, budget alerts, CSV upload, etc.). API base URL is configured via `REACT_APP_API_URL` (see installation).

### 2.4 Mobile frontend (`mobile/`)

Expo app using file-based routing under `mobile/app/`. Screens mirror core flows: auth, dashboard, transactions, budgets, cards, settings. API client lives in `mobile/utils/api/`.

---

## 3. System architecture

### 3.1 High-level data flow

```
┌─────────────┐     ┌─────────────┐
│  Web (3000) │     │ Mobile Expo │
└──────┬──────┘     └──────┬──────┘
       │    HTTP / JSON     │
       └─────────┬──────────┘
                 ▼
       ┌─────────────────────┐
       │  Django API (:8000) │
       │  /api/...           │
       └─────────┬───────────┘
                 ▼
       ┌─────────────────────┐
       │  SQLite / DB        │
       └─────────────────────┘
```

Both clients call the same REST endpoints. User-scoped data is filtered by the authenticated user on the server.

### 3.2 Authentication

- **Web**: Session cookies + CSRF token (`GET /api/auth/csrf/` before mutating requests).
- **Mobile**: API client sends credentials; session or token handling is configured in `mobile/utils/api/client.ts`.
- Protected endpoints require an authenticated user; anonymous requests receive `401`/`403` as appropriate.

### 3.3 Cross-app behavior

- **Transactions → Budgets**: Creating or updating transactions affects month-to-date spend; budget services evaluate thresholds and may create `BudgetAlertEvent` records (see `budgets/signals.py` and `budgets/services.py`).
- **Transactions → Cards**: Each transaction can store `card_actually_used` and `recommended_card`; reward calculation uses `RewardRule` on the linked `Card`.
- **Optimizer**: Uses `UserCategorySelection` plus the user’s active cards and reward rules to build the optimizer dashboard.

---

## 4. Data model

### 4.1 Accounts

Uses Django’s `User` model (via `AUTH_USER_MODEL`). Profile extensions and auth flows are handled in `accounts/views.py` and serializers.

### 4.2 Transactions (`transactions.models.Transaction`)

| Field | Description |
|-------|-------------|
| `user` | Owner |
| `merchant` | Merchant name |
| `amount` | Purchase amount |
| `category` | One of `RewardRule.CATEGORY_CHOICES` (e.g. DINING, GROCERIES) |
| `card_actually_used` | Optional FK to `Card` |
| `recommended_card` | Optional FK to `Card` (system recommendation) |
| `notes` | Free text |
| `created_at` / `updated_at` | Timestamps |

Model methods calculate rewards per card using matching `RewardRule` multipliers, with `OTHER` as fallback base rate.

### 4.3 Budgets

**`MonthlyBudget`**

- Unique per `(user, year_month)` where `year_month` is `YYYY-MM`.
- `amount`: budget cap for the month.
- `thresholds`: JSON list of fractions (default `[0.5, 0.7, 0.9]`).
- `fired_flags`: tracks which thresholds already triggered alerts.

**`BudgetAlertEvent`**

- Created when MTD spend crosses a threshold.
- Fields: `threshold`, `spend_at_fire`, `fired_at`, `status` (`pending` / `acknowledged`).

### 4.4 Cards

**`Card`** — Catalog entry: `name`, `issuer`, `annual_fee`, `ftf` (foreign transaction fee).

**`UserCard`** — Links a user to a catalog card; `is_active`, `notes`; unique `(user, card)`.

**`RewardRule`** — Per-card multipliers by category (`MultiSelectField`); optional cap fields per migrations.

**`CardBenefit`** — Text benefits/coupons linked to a catalog card.

### 4.5 Optimizer

**`UserCategorySelection`** — User-selected spending categories (`category_tag` from same choices as transactions). Unique per `(user, category_tag)`.

---

## 5. REST API

Base URL (local dev): `http://127.0.0.1:8000/api`

All paths below are relative to `/api`. Unless noted, list/detail endpoints follow DRF conventions (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`).

### 5.1 Conventions

- **Content-Type**: `application/json` for JSON bodies.
- **Auth**: Include session cookie (Web) or client-configured auth headers (Mobile).
- **CSRF** (Web): Obtain token from `GET /auth/csrf/` and send `X-CSRFToken` on unsafe methods.
- **Errors**: Validation errors return `400` with field details; auth failures return `401`/`403`.

### 5.2 Auth — prefix `/auth/`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/csrf/` | CSRF token for browser clients |
| POST | `/auth/register/` | Create account |
| POST | `/auth/login/` | Log in |
| POST | `/auth/logout/` | Log out |
| GET | `/auth/me/` | Current user |
| GET/PATCH | `/auth/profile/` | Profile read/update |
| POST | `/auth/password/reset/` | Request password reset |
| POST | `/auth/password/reset/confirm/` | Confirm reset with token |

Accounts app also mounts under `/accounts/` for additional account-related routes (see `accounts/urls.py`).

### 5.3 Transactions — prefix `/transactions/`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/transactions/transactions/` | List / create transactions |
| GET/PATCH/DELETE | `/transactions/transactions/{id}/` | Retrieve / update / delete |
| POST | `/transactions/import-csv/` | Bulk import from CSV |
| POST | `/transactions/recommend-card/` | Recommend best card for amount + category |
| GET | `/transactions/optimization-stats/` | Optimization statistics |
| GET | `/transactions/health/` | Health check |

**Recommend card** (typical body): `amount`, `category` — response includes recommended card and rationale based on user’s active cards and rules.

### 5.4 Budgets — prefix `/budgets/`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/budgets/current/` | Current month budget + spend summary |
| GET/POST | `/budgets/` | List / create budgets |
| GET | `/budgets/history/` | Historical budgets |
| GET | `/budgets/alerts/` | List budget alert events |
| POST | `/budgets/alerts/{id}/ack/` | Acknowledge an alert |
| GET | `/budgets/health/` | Health check |

Budget creation is idempotent per user/month where implemented in views/services — duplicate `(user, year_month)` should not create conflicting rows.

### 5.5 Cards — prefix `/cards/`

| Resource | Path | Description |
|----------|------|-------------|
| Catalog | `/cards/cards/` | Global card templates (CRUD per permissions) |
| User wallet | `/cards/user-cards/` | User’s linked cards |
| Reward rules | `/cards/reward-rules/` | Multipliers by category |
| Benefits | `/cards/card-benefits/` | Card benefit text |
| Rewards summary | `/cards/rewards/` | Aggregated rewards view |
| Health | `/cards/health/` | Health check |

**Permission model**: Catalog data may be read broadly; mutating catalog vs user-specific `UserCard` records is enforced in view permissions (see `cards/tests/test_permissions.py`).

### 5.6 Optimizer — prefix `/optimizer/`

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/optimizer/user-category-selections/` | List / create selections |
| GET/PATCH/DELETE | `/optimizer/user-category-selections/{id}/` | Detail operations |
| GET | `/optimizer/my-optimizer-dashboard/` | Personalized dashboard payload |
| GET | `/optimizer/health/` | Health check |

### 5.7 Analytics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/dashboard/` | Dashboard metrics (spending, rewards, budgets, recent transactions) |

Implemented in root `analytics_views.py` and wired in `api/urls.py`.

---

## 6. Frontends

### 6.1 Web (`web/`)

**Entry & routing**: `web/src/App.tsx` defines protected routes after login.

**API layer**: Centralized fetch/axios helpers call `/api/...` using `REACT_APP_API_URL`.

**Key feature areas**

| Area | Typical components / pages |
|------|----------------------------|
| Dashboard | Summary cards, links to breakdowns |
| Transactions | List, add, detail, CSV upload |
| Budgets | Create, list, alerts |
| Cards | Catalog browse, add to wallet, management |
| Analytics | Charts / placeholders per current build |

Shared layout: `PageLayout`, `Navbar` with active route highlighting.

### 6.2 Mobile (`mobile/`)

**Routing**: Expo Router under `mobile/app/` — `(auth)` group for welcome/login/signup; `(tabs)` for main app.

**API layer**: `mobile/utils/api/` — modules for `auth`, `transactions`, `budgets`, `cards`, `dashboard`.

**Parity with Web**: Same backend endpoints; UI is optimized for small screens (tab navigation, native inputs).

**Configuration**: Optional `EXPO_PUBLIC_API_BASE_URL` for device testing against a LAN IP (documented in installation).

---

## 7. Integration notes

### 7.1 Permissions

- Always assume **server-side** scoping: clients must not rely on hiding IDs alone; the API filters by `request.user`.
- Card catalog vs `UserCard`: adding a card to a wallet references catalog `Card` by id; reward rules attach to catalog cards.

### 7.2 CSV import

- Endpoint: `POST /api/transactions/import-csv/`
- Expected columns depend on serializer validation in `transactions/views.py` — align CSV headers with backend expectations before bulk upload.
- Failed rows should surface validation errors in the response for client display.

### 7.3 Budget alerts

- Thresholds default to 50%, 70%, 90% of monthly budget.
- Alerts fire once per threshold per month (`fired_flags` prevents duplicates).
- Clients should poll or refresh `/budgets/alerts/` and call ack when the user dismisses an alert.

### 7.4 Card recommendation

- Requires the user to have **active** `UserCard` entries with applicable `RewardRule` rows.
- Category strings must match `RewardRule.CATEGORY_CHOICES` / transaction categories.
- Seed data: management command `add_default_rewards` (see cards app) can populate catalog rules in dev.

### 7.5 CORS and cookies

- Local Web on port 3000 talks to API on 8000 — ensure `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in `api/settings.py` include the Web origin for development.
- Mobile on a physical device needs the API host reachable on the network (not `localhost` on the phone).

---

## 8. Development & operations

### 8.1 Local run

See [installation.md](./installation.md) for:

1. Python venv and `pip install -r requirements.txt` (plus DRF if missing from requirements)
2. `python manage.py migrate` and optional superuser
3. `python manage.py runserver`
4. `npm start` in `web/` and `npx expo start` in `mobile/`

### 8.2 Django Admin

- URL: `http://127.0.0.1:8000/admin/`
- Use a superuser created via `python manage.py createsuperuser`
- Dev seed credentials (if documented in installation): use only in local environments

Admin is useful for inspecting `Card`, `RewardRule`, users, and budget alert events.

### 8.3 Testing

Backend tests live under each app’s `tests/` package, for example:

```bash
python manage.py test accounts cards transactions budgets optimizer
```

Web and Mobile may have separate lint/test scripts in their `package.json` files.

### 8.4 Seed & management commands

| Command | Purpose |
|---------|---------|
| `python manage.py add_default_rewards` | Populate default card/reward catalog data |

Run after migrations when the catalog is empty.

### 8.5 Environment variables (summary)

| Variable | Where | Purpose |
|----------|-------|---------|
| `REACT_APP_API_URL` | `web/.env.development` | API base for Web |
| `EXPO_PUBLIC_API_BASE_URL` | Mobile env | API base for device testing |
| `DJANGO_SECRET_KEY`, `DEBUG` | Django settings / `.env` | Production hardening |

---

## 9. Roadmap

### 9.1 Completed (project baseline)

- Monorepo: shared Django API + Web + Mobile
- Auth, transactions, budgets, cards, optimizer modules
- Dashboard analytics endpoint
- CSV import and card recommendation
- Budget threshold alerts
- Web secondary pages UI alignment; Mobile TypeScript config fix

### 9.2 Planned / future extensions

| Area | Ideas |
|------|--------|
| Analytics | Full charts on Web; parity with dashboard API |
| Auth | Password reset wired on all clients |
| Deployment | PostgreSQL, static hosting for Web, Expo EAS builds |
| Integrations | Plaid or bank feed import (not in current scope) |
| Notifications | Push/email for budget alerts |

For user-facing feature descriptions and step-by-step flows, continue to maintain [usage.md](./usage.md) separately from this technical document.

---

*Last updated for the CardSense monorepo layout (backend at repository root, `web/`, `mobile/`).*
