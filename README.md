# CardSense

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Django](https://img.shields.io/badge/django-092E20?style=for-the-badge&logo=django&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white)

**Maximize your credit card rewards and savings**

CardSense is a full-stack personal finance app that helps you track spending, set monthly budgets, manage credit cards, and choose the best card for each purchase category. One Django backend powers both the **Web** (React) and **Mobile** (Expo) clients.

---

## Introduction

Many cardholders pay more interest than they need to, or use the wrong card for everyday purchases and miss category rewards (groceries, dining, gas, travel, and more). CardSense tackles both problems:

- **Budget tracking** — set a monthly cap and get alerts as you approach it
- **Rewards optimization** — log transactions, import CSV, and get card recommendations from your wallet
- **Unified account** — sign in on Web or Mobile with the same data

---

## Features

| Area | What you can do |
|------|-----------------|
| **Dashboard** | Month-to-date spending, rewards, budget status, recent transactions |
| **Transactions** | Add, edit, list; bulk CSV import |
| **Budgets** | Create monthly budgets; threshold alerts (50% / 70% / 90%) |
| **Cards** | Browse catalog, add cards to your wallet, view reward rules |
| **Optimizer** | Category selections and personalized recommendations |
| **Analytics** | Dashboard metrics via the shared API |

---

## Quick start

Run each tier in its own terminal from the repository root.

### 1. Backend (required)

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate

pip install -r requirements.txt
pip install djangorestframework django-cors-headers

python manage.py migrate
python manage.py runserver
```

API: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api) · Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

### 2. Web

```bash
cd web
npm install
npm start
```

Opens [http://localhost:3000](http://localhost:3000).

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
```

Use Expo Go, an Android emulator, or iOS Simulator. For a physical device, point the app at your machine’s LAN IP (see [installation.md](./docs/installation.md)).

---

## Tech stack

| Layer | Stack |
|-------|--------|
| **Backend** | Python, Django, Django REST Framework, SQLite (dev) |
| **Web** | React, TypeScript, Create React App |
| **Mobile** | Expo, React Native, Expo Router, TypeScript |

---

## Documentation

Full guides live under [`docs/`](./docs/). Start here instead of duplicating setup or API details in this file.

| Document | For |
|----------|-----|
| [docs/installation.md](./docs/installation.md) | Project layout, scripts, env vars, setup, troubleshooting |
| [docs/usage.md](./docs/usage.md) | Sign up, Web & Mobile workflows, feature walkthrough |
| [docs/documentation.md](./docs/documentation.md) | Architecture, data models, REST API |

Legacy import reference: [Documentation.md](./Documentation.md) (superseded by `docs/documentation.md`).

---

## License

See repository license file if present. Otherwise treat as academic / portfolio project unless stated otherwise.
