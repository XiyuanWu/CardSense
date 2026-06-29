# Installation

This guide covers local setup for **Developers** who want to run **CardSense** locally — the Django API (shared backend), the **Web** app (React), and the **Mobile** app (Expo / React Native).

> **Using the app (not building it)?** See [usage.md](./usage.md) for sign-up, features, and Web vs Mobile workflows.

> **Monorepo:** This repo merges the former [CardSense_Web](https://github.com/XiyuanWu/CardSense_Web) and [CardSense_App](https://github.com/XiyuanWu/CardSense_App) projects (both archived). Clone **this** repository only — backend at the root, clients in `web/` and `mobile/`. Details: [documentation.md §1.4](./documentation.md#14-repository-history--restructure).

## Project layout

```
CardSense/
├── api/              # Django project settings & URLs
├── accounts/         # Auth & user profiles
├── transactions/     # Transactions & CSV import
├── budgets/          # Budgets & alerts
├── cards/            # Card catalog & user wallet
├── optimizer/        # Card recommendation engine
├── analytics_views.py
├── manage.py
├── requirements.txt
├── db.sqlite3        # Local dev database (after migrate)
├── web/              # React web frontend  →  http://localhost:3000
├── mobile/           # Expo mobile frontend
└── docs/             # installation, usage, documentation
```

Web and mobile both talk to the same backend at `http://localhost:8000/api` in development.

For app responsibilities and folder-level architecture, see [documentation.md §2](./documentation.md#2-project-layout).

---

## Prerequisites

| Tool | Version | Used by |
|------|---------|---------|
| **Python** | 3.10+ (3.11+ recommended) | Backend |
| **Node.js** | 18 LTS or 20 LTS | Web & mobile |
| **npm** | 9+ (comes with Node) | Web & mobile |
| **Git** | Any recent version | Clone repo |

**Web only**

- A modern browser (Chrome, Firefox, Edge, Safari)

**Mobile only**

- [Expo Go](https://expo.dev/go) on a physical device, **or**
- [Android Studio](https://developer.android.com/studio) (emulator), **or**
- Xcode + iOS Simulator (macOS only)

---

## 1. Backend (required for Web & Mobile)

Run these commands from the **repository root** (`CardSense/`).

### 1.1 Create and activate a virtual environment

**Windows (PowerShell)**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 1.2 Install Python dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
pip install djangorestframework
```

> `djangorestframework` is required by the API but may not be listed in `requirements.txt`. Install it if you see `ModuleNotFoundError: No module named 'rest_framework'`.

### 1.3 Apply database migrations

```bash
python manage.py migrate
```

On Windows you can also run:

```powershell
.\migrate.bat
```

### 1.4 Start the API server

```bash
python manage.py runserver
```

The API should be available at:

- Root: `http://127.0.0.1:8000/`
- API base: `http://127.0.0.1:8000/api/`

Leave this terminal running while using Web or Mobile.

### 1.5 Django admin (optional)

Use the Django admin site to manage users, cards, budgets, and other data directly.

| Field | Value |
|-------|-------|
| **URL** | `http://127.0.0.1:8000/admin/` |
| **Username** | `admin` |
| **Password** | `admin123` |

Start the backend first (`python manage.py runserver`), then open the URL in your browser and sign in.

If login fails (for example after deleting `db.sqlite3`), create the admin user from the repo root:

```bash
python manage.py createsuperuser --username admin --email admin@example.com --noinput
python manage.py shell -c "from django.contrib.auth import get_user_model; u=get_user_model().objects.get(username='admin'); u.set_password('admin123'); u.save()"
```

Or run `python manage.py createsuperuser` interactively and choose username `admin` and password `admin123`.

> **Dev only.** Do not use these credentials in production.

---

## 2. Web app

Open a **new terminal**. All commands below are from `CardSense/web/`.

### 2.1 Install dependencies

```bash
cd web
npm install
```

### 2.2 Environment variables

The file `web/.env.development` should contain:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Create or edit it if missing. The web app reads this at build/start time via Create React App.

### 2.3 Start the development server

```bash
npm start
```

The app opens at `http://localhost:3000` (CRA may use another port if 3000 is busy).

### 2.4 Verify

1. Backend is running on port **8000**.
2. Web app loads the landing/login page.
3. You can register or log in (session auth + CSRF).

---

## 3. Mobile app (Expo)

Open a **new terminal**. All commands below are from `CardSense/mobile/`.

### 3.1 Install dependencies

```bash
cd mobile
npm install
```

### 3.2 API URL (optional)

By default the mobile client picks a dev URL based on platform:

| Platform | Default API base |
|----------|------------------|
| iOS Simulator | `http://localhost:8000/api` |
| Android Emulator | `http://10.0.2.2:8000/api` |
| Physical device (Expo) | `http://<your-computer-LAN-IP>:8000/api` (auto-detected from Expo when possible) |
| Expo Web | Same host as the browser, port `8000` |

To override, create `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

Use your machine’s LAN IP when testing on a **physical phone**. Omit `/api` or include it — the client normalizes the path.

Restart Expo after changing env vars:

```bash
npx expo start -c
```

### 3.3 Start Expo

```bash
npx expo start
```

Then:

- Press **`a`** — Android emulator  
- Press **`i`** — iOS simulator (macOS)  
- Scan the QR code — Expo Go on a device  
- Press **`w`** — Expo web preview  

Or use npm scripts:

```bash
npm run android
npm run ios
npm run web
```

### 3.4 Verify

1. Backend is running and reachable from the device/emulator.
2. App shows the welcome / auth flow.
3. Login or sign up succeeds (check the Expo terminal for API errors).

---

## 4. Run everything together

Use **three terminals** from the repo root:

| Terminal | Directory | Command |
|----------|-----------|---------|
| 1 | `CardSense/` | `python manage.py runserver` |
| 2 | `CardSense/web/` | `npm start` |
| 3 | `CardSense/mobile/` | `npx expo start` |

Suggested order: **backend → web and/or mobile**.

---

## 5. Available scripts

Run backend commands from the **repository root**. Run web/mobile commands from `web/` or `mobile/` respectively.

### 5.1 Backend (`/`)

| Command | Description |
|---------|-------------|
| `python manage.py runserver` | Start the Django API (default port 8000) |
| `python manage.py runserver 0.0.0.0:8000` | Listen on all interfaces (physical device testing) |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py createsuperuser` | Create an admin user interactively |
| `python manage.py test` | Run all backend tests |
| `python manage.py test accounts cards transactions budgets optimizer` | Run selected app tests |
| `python manage.py add_default_rewards` | Seed default card / reward catalog (dev) |

Windows shortcut for migrations: `.\migrate.bat`

### 5.2 Web (`web/`)

| Command | Description |
|---------|-------------|
| `npm start` | Dev server on port 3000 |
| `npm test` | Run Jest tests (watch mode) |
| `npm run build` | Production build → `web/build/` |

### 5.3 Mobile (`mobile/`)

| Command | Description |
|---------|-------------|
| `npx expo start` | Start Expo dev server |
| `npx expo start -c` | Start with cleared cache (after env changes) |
| `npm run android` | Open on Android emulator / device |
| `npm run ios` | Open on iOS simulator (macOS) |
| `npm run web` | Run Expo web target |
| `npx expo install --fix` | Align native deps with Expo SDK (troubleshooting) |

---

## Troubleshooting

### Web: network errors / login fails

- Confirm `REACT_APP_API_URL` in `web/.env.development` points to `http://localhost:8000/api`.
- Restart `npm start` after changing `.env.development`.
- Ensure the Django server is running.

### Mobile: cannot connect to API

- **Emulator:** Android uses `10.0.2.2`; iOS uses `localhost`. Do not use `127.0.0.1` on a physical device.
- **Physical device:** Phone and PC must be on the same Wi‑Fi. Set `EXPO_PUBLIC_API_BASE_URL` to your PC’s IP.
- **Firewall:** Allow inbound connections on port **8000** for local testing.
- Run backend with `python manage.py runserver 0.0.0.0:8000` so other devices on the network can reach it.

### `ModuleNotFoundError: rest_framework`

```bash
pip install djangorestframework
```

### `npm install` errors (web)

- Use Node 18 or 20 LTS.
- Delete `web/node_modules` and `web/package-lock.json`, then run `npm install` again.

### Expo / mobile install issues

```bash
cd mobile
npx expo install --fix
npm install
```

### Database / migration errors

```bash
python manage.py migrate
```

If the database is corrupted in dev, you can remove `db.sqlite3` and run `migrate` again (this **deletes local data**).

---

## Next steps

- **[usage.md](./usage.md)** — How to use CardSense (Web & Mobile) after setup
- **[documentation.md](./documentation.md)** — Architecture, data models, REST API
- **[preview.md](./preview.md)** — UI screenshot checklist (add files under `docs/images/`)
- **[README.md](./README.md)** — Documentation index
- **[../README.md](../README.md)** — Project overview, restructure history, Figma link
