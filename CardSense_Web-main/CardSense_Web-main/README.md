# CardSense (Web)
*CS180 Group Project*

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-FF4154?style=for-the-badge&logo=react&logoColor=white)
![Django](https://img.shields.io/badge/django-1A2C34?style=for-the-badge&logo=django&logoColor=F7BA3E)
![TypeScript](https://img.shields.io/badge/typescript-%23407ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)


**Manage user's budgets and maximize credit card rewards by tracking spending**

Our [presentation slides](./resource/CardSense-Slides.pdf) will help you understand this project in under 5 minutes!

Mobile App version see [here](https://github.com/XiyuanWu/CardSense_App).

**Authors**

[![Static Badge](https://img.shields.io/badge/Xiyuan%20Wu-path?style=for-the-badge&color=%2387CEEB)](https://github.com/XiyuanWu)
[![Static Badge](https://img.shields.io/badge/Andrew%20Do-path?style=for-the-badge&color=%2390EE90)](https://github.com/androodo)
[![Static Badge](https://img.shields.io/badge/Brandon%20nguyan-path?style=for-the-badge&color=%23CBC3E3)]()
[![Static Badge](https://img.shields.io/badge/Burhanuddin%20Taquee-path?style=for-the-badge&color=%23FFFF00)]()


## Introduction

Many Americans face numerous financial challenges under certain circumstances, particularly during the pandemic. A large group of cardholders can’t pay their credit card bill in one, resulting in them paying high interest fees. On the other hand, many cardholders may or may not be able to pay their bill in one, but those who use only a single or a very few number of cards miss out on potential rewards that would have been earned by using more suitable cards for specific categories, such as groceries, gas, and dining. Our web app addresses both problems separately and together: a budget tracker to reduce interest costs, and a card-rewards optimizer to help users earn more on ordinary spending.

## Overview

<img src="./img/CardSense%20Overview.png" alt="CardSense Overview" width="500">




## Installation/Usage

To run this project on your local PC:

### Prerequisites
- Python 3.x
- Node.js and npm
- Git

### Clone the Repository
```
git clone https://github.com/btaquee/CardSense.git
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
```
**React**

```
# Switch to `web` folder
cd web

# Install React dependencies
npm install
```

### Running the Program

In order to run the website, you need **TWO terminal windows** running simultaneously:

1. First running frontend:
```bush
npm start
```
Website should live on http://localhost:3000/.

2. Open a new terminal, now run backend:

use `cd ..` swtich to `Cardsense/` folder, then run backend
```bush
python manage.py runserver
```

**Important Notes**

Common Mistake: Make sure you run commands from the correct directory:
- Django commands: Run from `CardSense/` (project root)
- React commands: Run from `CardSense/web/` (web folder)

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
├─ web/                   # React web app (the UI)
│
├─ venv/                  # Python virtual environment (local only; not shared)
├─ db.sqlite3             # Dev database (local)
├─ manage.py              # Django CLI helper (runserver, migrate, etc.)
└─ README.md              # Project overview & quickstart
```

## Other Resource

Primarily for developers' purposes, but it contains many helpful resources that help you understand this project more, or even build on it.

1. [Complete Beginner's Guide](./resource/Beginner%20Guide.md)
2. [Project Summary](./resource/Project%20Summary.md)
3. [Set Up Guide](./resource/Set%20Up%20Guide.md)
4. [Diagram](./resource/diagrams/)

Some frontend resource:

5. [Authentication Setup Guide](./resource/frontend/Authentication%20Setup%20Guide.md)
6. [Backend Integration Guide](./resource/frontend/Backend%20Integration%20Guide.md)
7. [CardSense Frontend](./resource/frontend/CardSense%20Frontend.md)
8. [Frontend Changes Summary](./resource/frontend/Frontend%20Changes%20Summary.md)
