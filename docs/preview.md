# Preview

UI screenshots for **CardSense Web** and **Mobile**. Replace the image paths below with your own captures.

> **Setup:** Save files under [`docs/images/`](./images/). Suggested folders: `web/`, `mobile/`. PNG or JPG; width ~1200px for web, device resolution for mobile.

---

## How to capture

| Client | Base URL | Notes |
|--------|----------|--------|
| **Web** | `http://localhost:3000` | Use a logged-in test account for dashboard and tabs |
| **Mobile** | Expo Go / simulator | Backend must be running; see [installation.md](./installation.md) |

**Naming:** Match section numbers when possible, e.g. `web/1-4-dashboard.png`, `mobile/2-3-dashboard.png`.

---

## 1. Web app

### 1.1 Landing page

**Route:** `/`

<!-- Replace src with your screenshot -->
![Web landing page](./images/web/1-1-landing.png)

*Public home page before sign-in.*

---

### 1.2 Login

**Route:** `/login`

![Web login](./images/web/1-2-login.png)

---

### 1.3 Register

**Route:** `/register`

![Web register](./images/web/1-3-register.png)

---

### 1.4 Dashboard

**Route:** `/dashboard`  
**Nav:** Dashboard · Transactions · Budgets · Cards · Analytics

![Web dashboard](./images/web/1-4-dashboard.png)

*Summary cards: spending, rewards, budgets (up to 3), alerts, recent transactions (up to 3), quick actions. Floating **Assistant** button (bottom-right).*

---

### 1.9 Assistant (Web)

**UI:** Floating chat widget on any authenticated page (not a top-nav route).

![Web assistant chat](./images/web/1-9-assistant.png)

---

### 1.5 Transactions

**Route:** `/transactions`

![Web transactions list](./images/web/1-5-transactions.png)

---

### 1.6 Budgets

**Route:** `/budgets`

![Web budgets](./images/web/1-6-budgets.png)

---

### 1.7 Cards

**Route:** `/cards`

![Web card management](./images/web/1-7-cards.png)

---

### 1.8 Secondary pages (selected)

These are opened from the dashboard, nav, or quick actions — not every sub-page is listed here.

| Route | Page |
|-------|------|
| `/transactions/add` | Add transaction |
| `/rewards` | Rewards breakdown |
| `/budgets/alerts` | Budget alerts |
| `/transactions/import` | CSV import |

#### 1.8.1 Add transaction

**Route:** `/transactions/add`

![Web add transaction](./images/web/1-8-1-add-transaction.png)

#### 1.8.2 Rewards breakdown

**Route:** `/rewards` (linked from dashboard rewards card)

![Web rewards breakdown](./images/web/1-8-2-rewards.png)

#### 1.8.3 Budget alerts

**Route:** `/budgets/alerts`

![Web budget alerts](./images/web/1-8-3-budget-alerts.png)

#### 1.8.4 Import CSV

**Route:** `/transactions/import`

![Web CSV import](./images/web/1-8-4-csv-import.png)

**Other Web routes (add screenshots manually if needed):** `/budgets/create`, `/profile`, `/settings`, `/analytics` (placeholder).

---

## 2. Mobile app

### 2.1 Welcome

**Screen:** Auth welcome / entry

![Mobile welcome](./images/mobile/2-1-welcome.png)

---

### 2.2 Login

**Screen:** Log in

![Mobile login](./images/mobile/2-2-login.png)

---

### 2.3 Dashboard

**Tab:** Dashboard — bottom nav: Dashboard · Transaction · **Assistant** · Cards · Account

![Mobile dashboard](./images/mobile/2-3-dashboard.png)

---

### 2.4 Transactions

**Tab:** Transactions

![Mobile transactions](./images/mobile/2-4-transactions.png)

---

### 2.5 Assistant

**Tab:** Assistant (center of bottom nav)

![Mobile assistant](./images/mobile/2-5-assistant.png)

---

### 2.6 Cards

**Tab:** Cards

![Mobile cards](./images/mobile/2-6-cards.png)

---

### 2.7 Settings

**Tab:** Account (bottom nav)

![Mobile settings](./images/mobile/2-7-settings.png)

---

### 2.8 Secondary screens (selected)

Hidden from the tab bar; reached via buttons or links on main screens.

| Screen file | Purpose |
|-------------|---------|
| `addTransactions.tsx` | Add a transaction |
| `importCSV.tsx` | Bulk CSV import |
| `addCards.tsx` | Add a card to wallet |
| `budget.tsx` | Budget overview |

#### 2.8.1 Add transaction

![Mobile add transaction](./images/mobile/2-7-1-add-transaction.png)

#### 2.8.2 Add card

![Mobile add card](./images/mobile/2-7-2-add-card.png)

#### 2.8.3 Budget

![Mobile budget](./images/mobile/2-7-3-budget.png)

#### 2.8.4 Import CSV

![Mobile import CSV](./images/mobile/2-7-4-import-csv.png)

**Other Mobile screens (optional):** `signup`, `addBudget`, `transactionsDetail`, `chat` (same as Assistant tab).

---

## Related docs

- [usage.md](./usage.md) — Feature walkthrough (text)
- [installation.md](./installation.md) — Run Web & Mobile locally
