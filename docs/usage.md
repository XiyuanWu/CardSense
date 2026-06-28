# Usage

This guide is for **using CardSense** after the app is installed and running. For setup, see [installation.md](./installation.md).

CardSense helps you track spending, set monthly budgets, manage credit cards, and maximize rewards. The **Web** and **Mobile** apps share the same account and data through the backend API.

---

## Getting started

### Create an account

1. Open the Web app (`http://localhost:3000`) or the Mobile app (Expo Go / simulator).
2. Choose **Sign up** / **Register**.
3. Enter your name, email, and password.
4. Log in with the same credentials on Web or Mobile — one account works on both.

### Sign in

Use **Log in** on the welcome screen. If you forget your password, password reset is not fully wired in all clients yet; create a new account in local dev or ask your admin in a deployed environment.

---

## Web app

After login you land on the **Dashboard**. The top navigation includes: Dashboard, Transactions, Budgets, Cards, and Analytics.

### Dashboard

The dashboard summarizes your month at a glance:

| Area | What it shows |
|------|----------------|
| **This Month's Spending** | Total spent this month |
| **Rewards Earned** | Total rewards; click to open **Rewards Breakdown** |
| **Active Budgets** | Number of budgets you have |
| **Budget Alerts** | Open alerts; click to view **Budget Alerts** |
| **Budget Status** | Progress toward your monthly budget |
| **Recent Transactions** | Latest purchases |
| **Quick Actions** | Shortcuts to add a transaction, import CSV, create a budget, or manage cards |

### Transactions

**Menu → Transactions**

- **View all** — Full list with date, merchant, category, amount, and card used.
- **Add Transaction** — Enter merchant, amount, and category. The app recommends the best card; you can override or leave blank to use the recommendation.
- **Import CSV** — Bulk upload. Required columns: `merchant`, `amount`, `category`. Optional: `card`, `date`, `notes`. Download the sample CSV from the import page for the correct format.

**Tip:** Add cards to your wallet first for better recommendations when logging transactions.

### Budgets

**Menu → Budgets**

- **Create Budget** — Pick a month, set a total amount, and customize alert thresholds (default 50%, 70%, 90% of budget).
- **Budget list** — See spent vs. remaining and a progress bar for each month.
- **Budget Alerts** — Review alerts fired when spending crosses your thresholds; acknowledge alerts to clear them.

You cannot create budgets for past months.

### Cards

**Menu → Cards** (or **Quick Actions → Manage Cards**)

- **My Cards** — Cards in your wallet. Activate/deactivate or remove a card. See rewards earned this month per card.
- **Available Cards** — Browse the catalog and **Add to Wallet**. Optional notes when adding.
- Inactive cards are excluded from recommendations but stay in your list.

### Rewards

**Dashboard → Rewards Earned** (or `/rewards`)

- Total rewards for the month.
- Breakdown by card.
- Recent transactions that earned rewards.

### Profile & settings

Open your avatar menu (top right):

- **Profile** — View and edit name and email.
- **Settings** — App preferences (where implemented).

### Analytics

**Menu → Analytics** — Placeholder in current release; dashboard covers most day-to-day needs.

---

## Mobile app (Expo)

Navigation uses a bottom bar: **Dashboard**, **Transactions**, **Cards**, and **Settings**. Budget flows open from the dashboard or dedicated screens.

### Dashboard

Same ideas as Web: monthly spending, rewards, budgets, and shortcuts to add transactions or budgets.

### Transactions

- View transaction history.
- **Add transaction** — Merchant, amount, category; card recommendation when categories and wallet cards are set up.
- Open a transaction for details where available.

### Cards

- See cards in your wallet.
- **Add cards** — Browse available cards and add to your wallet (same catalog as Web).

### Budget

- View budget progress for the current month.
- **Add budget** — Set amount and alert thresholds (similar to Web).

### Account & settings

- **Account** — Profile information.
- **Settings** — App options.

---

## Recommended workflow

For the best experience, set things up in this order:

1. **Sign up / log in**
2. **Add cards** to your wallet (Cards)
3. **Create a monthly budget** (Budgets)
4. **Log transactions** manually or via CSV import (Web)
5. **Check the dashboard** for spending, alerts, and rewards
6. **Use Rewards Breakdown** to see which cards earned the most

---

## Web vs mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| Sign up / login | Yes | Yes |
| Dashboard | Yes | Yes |
| Add / list transactions | Yes | Yes |
| CSV import | Yes | No |
| Budgets & alerts | Yes | Yes |
| Card wallet | Yes | Yes |
| Rewards breakdown | Yes | Via dashboard stats |
| Profile / settings | Yes | Yes |
| Analytics page | Placeholder | N/A |

Data syncs through the same backend — changes on Web appear on Mobile after refresh or refocus, and vice versa.

---

## Troubleshooting (usage)

| Issue | What to try |
|-------|-------------|
| Empty dashboard | Add transactions and a budget; ensure you are logged in. |
| No card recommendation | Add at least one **active** card to your wallet. |
| Budget alert not showing | Confirm a budget exists for the current month and spending crossed a threshold. |
| Mobile cannot log in | See [installation.md](./installation.md) — phone must reach the API (same Wi‑Fi, correct API URL). |
| CSV import fails | Check column names, categories (e.g. `GROCERIES`, `DINING`), and UTF-8 encoding. |

For environment and API setup, always refer to [installation.md](./installation.md).

---

## Related docs

- [installation.md](./installation.md) — Developer setup
- Root `Documentation.md` — API and architecture notes (being migrated into `docs/`)
