# Preview

UI screenshots for **CardSense Web** and **Mobile**. Images live under [`docs/images/`](./images/) in `web/` and `mobile/`.

---

## 1. Web app

Base URL: [http://localhost:3000](http://localhost:3000) (local dev). Screenshots use a logged-in test account unless noted.

### 1.1 Landing

**Route:** `/`

![Web landing](./images/web/landing.png)

*Public home page before sign-in.*

---

### 1.2 Login

**Route:** `/login`

![Web login](./images/web/login.png)

---

### 1.3 Dashboard

**Route:** `/dashboard`  
**Nav:** Dashboard · Transactions · Budgets · Cards · Analytics

![Web dashboard](./images/web/dashboard.png)

*Month-to-date spending, rewards, budget status (up to 3), alerts, recent transactions (up to 3), and quick actions. Floating **Assistant** button (bottom-right).*

---

### 1.4 Transactions

**Route:** `/transactions`

![Web transactions](./images/web/transaction.png)

*List view with category pills, optimization hints, and edit/delete actions.*

---

### 1.5 Cards

**Route:** `/cards`

![Web cards](./images/web/cards.png)

*Wallet and catalog — add cards, view reward rules.*

---

### 1.6 Rewards breakdown

**Route:** `/rewards` (from dashboard rewards card)

![Web rewards](./images/web/rewards.png)

*Per-card and category reward summary for the current month.*

---

### 1.7 Assistant

**UI:** Floating chat widget on any authenticated page (not a top-nav route).

![Web assistant](./images/web/assistants.png)

*Gemini-powered Q&A — card picks, rewards tips, wallet-aware answers. History syncs with Mobile.*

---

### 1.8 Settings

**Route:** `/settings`

![Web settings](./images/web/settings.png)

*Profile, preferences, and account options.*

---

## 2. Mobile app

Run via Expo Go or a simulator with the backend up — see [installation.md](./installation.md).

**Bottom nav (main tabs):** Dashboard · Transaction · **Assistant** · Cards · Account

<table>
<tr>
<td width="50%" valign="top">
<h4>2.1 Welcome</h4>
<p><strong>Screen:</strong> Auth welcome / entry</p>
<img src="./images/mobile/landing.png" alt="Mobile welcome" width="280" />
</td>
<td width="50%" valign="top">
<h4>2.2 Login</h4>
<p><strong>Screen:</strong> Log in</p>
<img src="./images/mobile/login.png" alt="Mobile login" width="280" />
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h4>2.3 Dashboard</h4>
<p><strong>Tab:</strong> Dashboard</p>
<img src="./images/mobile/dashboard.png" alt="Mobile dashboard" width="280" />
<p><em>Spending, rewards, budgets, recent transactions.</em></p>
</td>
<td width="50%" valign="top">
<h4>2.4 Transactions</h4>
<p><strong>Tab:</strong> Transactions</p>
<img src="./images/mobile/transaction.png" alt="Mobile transactions" width="280" />
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h4>2.5 Assistant</h4>
<p><strong>Tab:</strong> Assistant (center of bottom nav)</p>
<img src="./images/mobile/assistants.png" alt="Mobile assistant" width="280" />
<p><em>Shares chat history with Web on the same account.</em></p>
</td>
<td width="50%" valign="top">
<h4>2.6 Cards</h4>
<p><strong>Tab:</strong> Cards</p>
<img src="./images/mobile/cards.png" alt="Mobile cards" width="280" />
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h4>2.7 Account / Settings</h4>
<p><strong>Tab:</strong> Account (bottom nav)</p>
<img src="./images/mobile/settings.png" alt="Mobile settings" width="280" />
</td>
<td width="50%" valign="top">
<h4>2.8 Rewards breakdown</h4>
<p><strong>Route:</strong> <code>/(tabs)/rewards</code> — dashboard → View breakdown →</p>
<img src="./images/mobile/rewards.png" alt="Mobile rewards" width="280" />
</td>
</tr>
</table>

## Related docs

- [usage.md](./usage.md) — Feature walkthrough (text)
- [installation.md](./installation.md) — Run Web & Mobile locally
- [documentation.md](./documentation.md) — Architecture and API reference
