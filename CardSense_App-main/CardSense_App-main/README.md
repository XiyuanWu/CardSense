# CardSense (App)

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![ReactNative](https://img.shields.io/badge/React_Native-FF4154?style=for-the-badge&logo=react&logoColor=white)
![Django](https://img.shields.io/badge/django-1A2C34?style=for-the-badge&logo=django&logoColor=F7BA3E)
![TypeScript](https://img.shields.io/badge/typescript-%23407ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)

**Manage user's budgets and maximize credit card rewards by tracking spending**


## Introduction

CardSense was initially a group project, and it's about a website that helps people manage their budgets and maximize credit card rewards by tracking their spending. After the group project is done. To expand my skill stack, I made a mobile version for CardSense. And the backend remained the same because they used the same backend.

For project introduction, motivation, and complete information about the CardSense web version, refer to [here](https://github.com/XiyuanWu/CardSense_Web). 

## Figma

[CardSense Figma File](https://www.figma.com/design/K9IXjc8XGfccyxJeDOZu4M/CardSense?node-id=0-1&t=55n2MlwcTevTLtUv-1)


## Installation/Usage

To run this project on your local PC:

### Prerequisites
- Python 3.x
- Node.js and npm
- Git

### Clone the Repository
```
git clone https://github.com/XiyuanWu/CardSense_App.git
```

### Install dependencies

**Django**

*Note that Django need run under virtual environment!*

```py
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1      # Windows
source venv/bin/activate         # macOS/Linux

# Install Django and API dependencies
pip install Django
pip install djangorestframework django
pip install django-cors-headers
pip install django-multiselectfield
pip install django-cors-headers
```
**React Native**

```
# Switch to `app` folder
cd app

# Install React dependencies
npm install
```

### Running the Program

In order to run the website, you need **TWO terminal windows** running simultaneously:

1. First running frontend:
```bush
npm start
```
Website should live on http://localhost:8081/.

2. Open a new terminal, now run backend:

use `cd ..` swtich to `Cardsense_App/` folder, then run backend

**For Android Emulator or Physical Devices:**
```bash
python manage.py runserver 0.0.0.0:8000
```

**For iOS Simulator or Web:**
```bash
python manage.py runserver
```

**Important Notes**

Common Mistake: Make sure you run commands from the correct directory:
- Django commands: Run from `CardSense_App/` (project root)
- React commands: Run from `CardSense_App/app/` (app folder)

## Project Structure

Primarily for developers' purposes, but if you want to know the structure of this project and the skill set. 

```py
CardSense/
│
├─ api/                   # Django PROJECT (global config/container)
│
├─ accounts/              # Django APP: authentication & user management
├─ transactions/          # Django APP: user transactions (manual/CSV), CRUD, signals
├─ budgets/               # Django APP: single monthly budget per user + alert thresholds/events
├─ cards/                 # Django APP: card products and reward rules
├─ optimizer/             # Django APP: best-card recommendation engine (service endpoints)
│
├─ app/                   # React Native app (the UI)
│
├─ venv/                  # Python virtual environment (local only; not shared)
├─ db.sqlite3             # Dev database (local)
├─ manage.py              # Django CLI helper (runserver, migrate, etc.)
└─ README.md              # Project overview & quickstart
```
