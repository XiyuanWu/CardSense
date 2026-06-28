# CardSense - Complete Beginner's Guide 🎓
A complete beginner
Welcome to CardSense! This guide will help you understand everything about this project, even if you're brand new to software development.

---

## 📖 Table of Contents

1. [What Does CardSense Do?](#what-does-cardsense-do)
2. [The Big Picture: How Web Apps Work](#the-big-picture-how-web-apps-work)
3. [CardSense Architecture](#cardsense-architecture)
4. [Technologies We Use](#technologies-we-use)
5. [Project Structure Explained](#project-structure-explained)
6. [How the Code Works Together](#how-the-code-works-together)
7. [Database & Data Flow](#database--data-flow)
8. [Getting Started](#getting-started)
9. [Common Beginner Questions](#common-beginner-questions)

---

## What Does CardSense Do?

**CardSense** is a web application that helps people manage their money and credit cards better. Think of it like a smart assistant for your wallet.

### Main Features:

1. **Budget Tracking** 💰
   - Users can set a monthly budget (e.g., "I want to spend $500 this month")
   - The app tracks how much they've spent
   - Warns them when they're getting close to their limit

2. **Transaction Tracking** 📝
   - Users can record every purchase they make
   - Like keeping a digital receipt book
   - Can upload CSV files (spreadsheets) with lots of transactions at once

3. **Credit Card Management** 💳
   - Store information about all your credit cards
   - Each card has different rewards (cashback, points, miles)
   - Keep track of which cards you own

4. **Smart Optimizer** 🧠
   - Tells you which card to use for maximum rewards
   - Example: "Use Card A for groceries (5% back), Card B for gas (3% back)"
   - Helps you earn more rewards automatically

### Real-World Example:
> Imagine Sarah has 3 credit cards. She's about to buy groceries ($100), gas ($50), and go out to eat ($30). CardSense tells her:
> - Use Chase Freedom for groceries → earn $5 back
> - Use Discover for gas → earn $2.50 back  
> - Use AmEx for dining → earn $1.50 back
> 
> Total rewards: $9 saved! Without CardSense, she might have used just one card and only earned $3 total.

---

## The Big Picture: How Web Apps Work

Before diving into CardSense specifically, let's understand how ANY web application works:

### The Restaurant Analogy 🍽️

Think of a web app like a restaurant:

1. **Frontend (the dining room)** 👁️
   - This is what customers SEE and INTERACT with
   - Nice decorations, menus, tables
   - In web apps: the buttons, forms, colors you see in your browser

2. **Backend (the kitchen)** 🔧
   - This is where the actual WORK happens
   - Cooking food, preparing orders, managing inventory
   - In web apps: processing data, doing calculations, managing user accounts

3. **Database (the pantry/storage)** 🗄️
   - Where all the ingredients are stored
   - In web apps: where all user data, transactions, card info is saved permanently

### How They Talk to Each Other:

```
User clicks "Add Transaction" button
         ↓
Frontend: "Hey Backend, save this $50 grocery purchase"
         ↓
Backend: Receives request, validates it, processes it
         ↓
Database: Backend saves the transaction data
         ↓
Backend: "Done! Here's confirmation"
         ↓
Frontend: Shows "Transaction saved successfully!" message to user
```

---

## CardSense Architecture

CardSense is built with a **"Client-Server"** architecture:

```
┌─────────────────────────────────────────────────────┐
│                   YOUR BROWSER                       │
│  ┌───────────────────────────────────────────────┐ │
│  │         FRONTEND (React App)                   │ │
│  │  - Login page, Dashboard, Forms                │ │
│  │  - Runs on: http://localhost:3000              │ │
│  │  - Language: JavaScript/TypeScript              │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        ↕ HTTP Requests
┌─────────────────────────────────────────────────────┐
│               YOUR COMPUTER                          │
│  ┌───────────────────────────────────────────────┐ │
│  │         BACKEND (Django Server)                │ │
│  │  - API Endpoints, Business Logic               │ │
│  │  - Runs on: http://127.0.0.1:8000              │ │
│  │  - Language: Python                            │ │
│  └───────────────────────────────────────────────┘ │
│                        ↕                            │
│  ┌───────────────────────────────────────────────┐ │
│  │         DATABASE (SQLite)                      │ │
│  │  - Stores: users, cards, transactions, budgets │ │
│  │  - File: db.sqlite3                            │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Key Points:

- **Two separate programs** run at the same time
- Frontend and Backend talk using **HTTP requests** (like sending letters back and forth)
- They run on **different ports** (think of ports like different TV channels)
  - Port 3000 = Frontend
  - Port 8000 = Backend

---

## Technologies We Use

### Frontend Technologies:

#### 1. **React** ⚛️
- **What it is:** A JavaScript library for building user interfaces
- **What it does:** Creates the buttons, forms, pages you see
- **Think of it like:** LEGO blocks for building websites
- **File extension:** `.jsx` or `.tsx` (TypeScript version)

#### 2. **TypeScript** 📘
- **What it is:** JavaScript with extra rules
- **What it does:** Helps catch mistakes before you run the code
- **Think of it like:** Spell-check for code
- **Example:**
  ```typescript
  // JavaScript (no type checking)
  let age = "25";  // Oops, should be a number!
  
  // TypeScript (catches the mistake)
  let age: number = "25";  // ❌ ERROR: Can't assign string to number!
  ```

#### 3. **Tailwind CSS** 🎨
- **What it is:** A tool for styling (making things pretty)
- **What it does:** Makes buttons look nice, colors, layouts, etc.
- **Example:**
  ```html
  <button className="bg-blue-500 text-white rounded-lg px-4 py-2">
    Click Me
  </button>
  ```

#### 4. **Axios** 📡
- **What it is:** A tool for making HTTP requests
- **What it does:** Sends data to the backend and receives responses
- **Think of it like:** The mail carrier between frontend and backend

### Backend Technologies:

#### 1. **Python** 🐍
- **What it is:** A beginner-friendly programming language
- **What it does:** The main language for our backend logic
- **Why Python:** Easy to read, lots of libraries, great for beginners

#### 2. **Django** 🎸
- **What it is:** A Python web framework
- **What it does:** Provides tools for building web backends quickly
- **Think of it like:** A toolkit with hammers, screwdrivers, etc. for building a house
- **Features it provides:**
  - User authentication (login/logout)
  - Database management
  - URL routing
  - Security features

#### 3. **Django REST Framework** 📦
- **What it is:** An add-on for Django
- **What it does:** Makes it easy to create APIs (endpoints the frontend calls)
- **Example API endpoint:**
  ```
  POST /api/transactions/
  → Creates a new transaction
  ```

#### 4. **SQLite** 🗃️
- **What it is:** A lightweight database
- **What it does:** Stores all data permanently
- **Think of it like:** An Excel spreadsheet, but way more powerful
- **The file:** `db.sqlite3` in your project folder

---

## Project Structure Explained

Let's go through every folder and understand what it does:

```
CardSense/
│
├── web/                          ← FRONTEND (React App)
│   ├── src/                      ← Source code (the actual code you write)
│   │   ├── components/           ← Reusable UI pieces
│   │   │   ├── auth/            ← Login & Register pages
│   │   │   ├── Dashboard/       ← Main dashboard after login
│   │   │   ├── Transactions/    ← Transaction management pages
│   │   │   ├── Budgets/         ← Budget creation & tracking
│   │   │   └── Landing.tsx      ← First page visitors see
│   │   │
│   │   ├── services/             ← Code that talks to backend
│   │   │   ├── api.ts           ← Main HTTP client setup
│   │   │   ├── auth.service.ts  ← Login/logout functions
│   │   │   ├── card.service.ts  ← Card-related API calls
│   │   │   └── ...              ← Other service files
│   │   │
│   │   ├── types/                ← TypeScript type definitions
│   │   │   └── index.ts         ← Defines data structures
│   │   │
│   │   ├── App.tsx               ← Main app component
│   │   └── index.js              ← Entry point (starts the app)
│   │
│   ├── public/                   ← Static files (images, icons)
│   ├── package.json              ← Lists all frontend dependencies
│   └── node_modules/             ← Installed libraries (auto-generated)
│
├── accounts/                     ← BACKEND: User authentication
│   ├── models.py                ← Database table for users
│   ├── views.py                 ← Login, register, logout logic
│   ├── serializers.py           ← Converts data between JSON and Python
│   └── urls.py                  ← API endpoint routes
│
├── transactions/                 ← BACKEND: Transaction management
│   ├── models.py                ← Transaction database table
│   ├── views.py                 ← CRUD operations for transactions
│   ├── serializers.py           ← Transaction data formatting
│   └── urls.py                  ← Transaction API endpoints
│
├── budgets/                      ← BACKEND: Budget management
│   ├── models.py                ← Budget database table
│   ├── views.py                 ← Budget creation, tracking
│   ├── services.py              ← Budget calculation logic
│   └── signals.py               ← Auto-updates when transactions change
│
├── cards/                        ← BACKEND: Credit card management
│   ├── models.py                ← Card & reward rules tables
│   ├── views.py                 ← Card CRUD operations
│   └── management/              ← Custom commands
│       └── commands/
│           └── add_default_rewards.py  ← Adds default card data
│
├── optimizer/                    ← BACKEND: Card recommendation engine
│   ├── services.py              ← Algorithm for best card selection
│   ├── views.py                 ← API endpoint for recommendations
│   └── models.py                ← Optimization history
│
├── api/                          ← DJANGO PROJECT SETTINGS
│   ├── settings.py              ← Main configuration file
│   ├── urls.py                  ← Master URL routing
│   └── wsgi.py                  ← Server entry point
│
├── venv/                         ← Python virtual environment
│   └── ...                      ← Isolated Python packages
│
├── db.sqlite3                    ← THE DATABASE FILE
├── manage.py                     ← Django command-line tool
├── requirements.txt              ← Python package list
└── README.md                     ← Project overview
```

### Key Concepts:

#### What's a "Component"? 🧩
- A reusable piece of UI
- Example: A button, a form, a card display
- Like building blocks that you combine to make a full page

```typescript
// Simple component example
function WelcomeMessage() {
  return <h1>Welcome to CardSense!</h1>;
}
```

#### What's a "Service"? 🛠️
- Code that performs a specific task
- Usually talks to the backend
- Keeps your code organized

```typescript
// Example service function
async function createTransaction(data) {
  const response = await axios.post('/api/transactions/', data);
  return response.data;
}
```

#### What's a "Model"? 📋
- Defines what data looks like in the database
- Like a blueprint or template

```python
# Example Django model
class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    date = models.DateField()
    category = models.CharField(max_length=50)
```

---

## How the Code Works Together

Let's trace what happens when a user adds a transaction:

### Step-by-Step Flow:

#### 1. **User Action** (Frontend)
```typescript
// User fills out form and clicks "Add Transaction"
// File: web/src/components/Transactions/AddTransaction.tsx

const handleSubmit = async (e) => {
  e.preventDefault();  // Stop page from refreshing
  
  const transactionData = {
    amount: 50.00,
    description: "Groceries",
    category: "food",
    date: "2024-11-28"
  };
  
  // Call the service to send data to backend
  await transactionService.create(transactionData);
};
```

#### 2. **Service Layer** (Frontend)
```typescript
// File: web/src/services/transaction.service.ts

export async function create(data) {
  // Send POST request to backend
  const response = await api.post('/api/transactions/', data);
  return response.data;
}
```

#### 3. **Backend Receives Request** (Django)
```python
# File: transactions/views.py

@api_view(['POST'])
def create_transaction(request):
    # Step 1: Receive data from frontend
    data = request.data
    
    # Step 2: Validate data using serializer
    serializer = TransactionSerializer(data=data)
    if serializer.is_valid():
        # Step 3: Save to database
        transaction = serializer.save(user=request.user)
        
        # Step 4: Send success response back
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Transaction created!'
        })
    else:
        return Response({'error': serializer.errors}, status=400)
```

#### 4. **Database** (SQLite)
```sql
-- Django automatically creates this SQL command:
INSERT INTO transactions_transaction 
  (amount, description, category, date, user_id)
VALUES 
  (50.00, 'Groceries', 'food', '2024-11-28', 1);
```

#### 5. **Response Travels Back** (Backend → Frontend)
```json
{
  "success": true,
  "data": {
    "id": 42,
    "amount": 50.00,
    "description": "Groceries",
    "category": "food",
    "date": "2024-11-28"
  },
  "message": "Transaction created!"
}
```

#### 6. **Frontend Updates UI**
```typescript
// Show success message
alert('Transaction added successfully!');

// Refresh the transaction list
fetchTransactions();
```

### Visual Summary:

```
User clicks button
      ↓
React Component (handleSubmit)
      ↓
Service Function (transactionService.create)
      ↓
HTTP POST Request → http://127.0.0.1:8000/api/transactions/
      ↓
Django URL Router → routes to create_transaction view
      ↓
Django View Function (create_transaction)
      ↓
Serializer validates data
      ↓
Database saves transaction
      ↓
Response sent back ← HTTP Response (JSON)
      ↓
Service Function receives response
      ↓
Component updates UI
      ↓
User sees "Success!" message
```

---

## Database & Data Flow

### Understanding the Database:

The database stores **tables** (like Excel sheets) with **rows** (individual records) and **columns** (fields):

#### Example: `transactions_transaction` table

| id | user_id | amount | description | category | date       |
|----|---------|--------|-------------|----------|------------|
| 1  | 5       | 50.00  | Groceries   | food     | 2024-11-28 |
| 2  | 5       | 25.50  | Gas         | transport| 2024-11-27 |
| 3  | 7       | 100.00 | Restaurant  | dining   | 2024-11-28 |

### Our Database Tables:

1. **accounts_user**
   - Stores user accounts
   - Columns: id, email, password (encrypted), first_name, last_name

2. **transactions_transaction**
   - Stores all transactions
   - Columns: id, user_id, amount, description, category, date, card_id

3. **budgets_budget**
   - Stores monthly budgets
   - Columns: id, user_id, amount, month, year, spent

4. **cards_card**
   - Stores credit cards
   - Columns: id, user_id, name, issuer, last_four_digits

5. **cards_rewardrule**
   - Stores reward rates for each card
   - Columns: id, card_id, category, reward_rate, reward_type

### Relationships Between Tables:

```
User (accounts_user)
  ├── Has many → Transactions
  ├── Has many → Cards
  └── Has one → Budget

Card (cards_card)
  ├── Belongs to → User
  ├── Has many → Transactions
  └── Has many → Reward Rules

Transaction (transactions_transaction)
  ├── Belongs to → User
  └── Belongs to → Card (optional)
```

This is called a **relational database** because tables are related to each other.

---

## Getting Started

### Prerequisites (What You Need Installed):

1. **Python 3.x**
   - Download: https://www.python.org/downloads/
   - Check if installed: `python --version`

2. **Node.js & npm**
   - Download: https://nodejs.org/
   - Check if installed: `node --version` and `npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Check if installed: `git --version`

4. **A Code Editor**
   - Recommended: VS Code (https://code.visualstudio.com/)

### Setup Steps:

#### 1. Clone the Repository
```bash
git clone https://github.com/btaquee/CardSense.git
cd CardSense
```

#### 2. Setup Backend (Django)

```bash
# Create virtual environment (isolated Python environment)
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\Activate.ps1

# Install Python packages
pip install -r requirements.txt

# Run database migrations (creates tables)
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

Backend should now be running at: **http://127.0.0.1:8000/**

#### 3. Setup Frontend (React)

Open a **NEW terminal window** (keep backend running):

```bash
# Navigate to web folder
cd web

# Install Node packages
npm install

# Start the React development server
npm start
```

Frontend should now be running at: **http://localhost:3000/**

Your browser should automatically open!

---

## Common Beginner Questions

### Q: Why do we need TWO servers running?

**A:** Think of it like a restaurant:
- **Frontend (React)** = The dining room customers see
- **Backend (Django)** = The kitchen where food is prepared

They're separate because:
- Different people might work on them
- They can be deployed to different servers
- Keeps code organized and maintainable

### Q: What is a "virtual environment" (venv)?

**A:** It's like a separate bubble for your Python packages.

**Why?** Different projects need different versions of libraries. Without venv:
- Project A needs Django 4.0
- Project B needs Django 5.0
- They would conflict! 😱

With venv, each project has its own isolated set of packages.

### Q: What does "localhost" mean?

**A:** It means "this computer" or "my computer". 

- `localhost:3000` = React server running on YOUR computer, port 3000
- `127.0.0.1:8000` = Django server running on YOUR computer, port 8000

(127.0.0.1 is the IP address for localhost)

### Q: What's the difference between GET and POST?

**A:** These are HTTP methods:

- **GET** = "Give me data"
  - Example: Fetch all transactions
  - Like asking a waiter for a menu

- **POST** = "Here's data, save it"
  - Example: Create a new transaction
  - Like giving your order to a waiter

- **PUT/PATCH** = "Update existing data"
- **DELETE** = "Remove this data"

### Q: What is an API?

**A:** API = Application Programming Interface

Think of it as a menu at a restaurant:
- Lists what you can order (endpoints)
- Tells you what information you need to provide
- Returns what you asked for

**CardSense API Example:**
```
Menu of Available Endpoints:

GET /api/transactions/        → Get all transactions
POST /api/transactions/       → Create a transaction
GET /api/transactions/5/      → Get transaction #5
DELETE /api/transactions/5/   → Delete transaction #5

GET /api/cards/               → Get all cards
POST /api/budgets/            → Create a budget
```

### Q: What is JSON?

**A:** JSON = JavaScript Object Notation

It's a way to format data that both JavaScript and Python understand:

```json
{
  "id": 1,
  "name": "Chase Freedom",
  "issuer": "Chase",
  "rewards": {
    "groceries": 5,
    "gas": 3
  }
}
```

Think of it like filling out a form with labels and values.

### Q: What does "asynchronous" mean?

**A:** It means "don't wait, keep going".

**Synchronous (waiting):**
```
Make coffee ☕ (wait 5 minutes)
↓
Make toast 🍞 (wait 2 minutes)
↓
Total time: 7 minutes
```

**Asynchronous (parallel):**
```
Start coffee ☕ (5 minutes)
While coffee is brewing...
  → Make toast 🍞 (2 minutes)
Total time: 5 minutes
```

In code:
```javascript
// Synchronous - waits for each step
const data = fetchData();  // Waits...
console.log(data);

// Asynchronous - keeps going
fetchData().then(data => {
  console.log(data);
});
console.log("This runs immediately!");
```

### Q: What's the difference between JavaScript and TypeScript?

**A:**
- **JavaScript** = The original language
- **TypeScript** = JavaScript + Type checking

**Example:**
```javascript
// JavaScript - no types
function add(a, b) {
  return a + b;
}
add(5, "10");  // Returns "510" - BUG! 🐛

// TypeScript - with types
function add(a: number, b: number): number {
  return a + b;
}
add(5, "10");  // ❌ ERROR: Can't add number + string
```

TypeScript catches bugs BEFORE you run the code!

### Q: What are "props" in React?

**A:** Props = Properties = Data passed to components

Like function parameters, but for UI components:

```typescript
// Parent component
<WelcomeMessage name="Alice" age={20} />

// WelcomeMessage component
function WelcomeMessage(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>You are {props.age} years old</p>
    </div>
  );
}

// Displays: "Hello, Alice! You are 20 years old"
```

### Q: What is "state" in React?

**A:** State = Data that can change over time

Like variables that, when updated, automatically update the UI:

```typescript
function Counter() {
  const [count, setCount] = useState(0);  // State variable
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

Every time you click the button:
1. `count` increases
2. React automatically re-renders the component
3. You see the new number

### Q: What does "serializer" mean in Django?

**A:** A serializer converts data between formats:

```python
# Python Object → JSON (for sending to frontend)
transaction = Transaction.objects.get(id=1)
serializer = TransactionSerializer(transaction)
json_data = serializer.data
# Result: {"id": 1, "amount": 50.00, "description": "Groceries"}

# JSON → Python Object (for saving to database)
data = {"amount": 50.00, "description": "Groceries"}
serializer = TransactionSerializer(data=data)
if serializer.is_valid():
    serializer.save()  # Saves to database
```

Think of it as a translator between database and API.

### Q: What are "migrations" in Django?

**A:** Migrations = Instructions for updating the database

When you change your models, Django creates migration files:

```python
# You change the model
class Transaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    # NEW: Added category field
    category = models.CharField(max_length=50)
```

Run `python manage.py makemigrations` → Creates a migration file

Run `python manage.py migrate` → Updates the database

It's like version control for your database structure!

---

## Tips for Success

### 1. **Use the Django Admin Panel** 🔐

Django comes with a built-in admin interface:
- URL: http://127.0.0.1:8000/admin/
- You can view/edit all database records
- Super useful for debugging!

### 2. **Read Error Messages Carefully** 🐛

Error messages tell you exactly what went wrong:
```
ModuleNotFoundError: No module named 'lucide-react'
```
This means: You need to install the `lucide-react` package!

### 3. **Use Browser DevTools** 🔍

Press F12 in your browser to open DevTools:
- **Console tab**: See JavaScript errors and logs
- **Network tab**: See all HTTP requests to the backend
- **Elements tab**: Inspect HTML/CSS

### 4. **Learn Git Basics** 📚

Essential commands:
```bash
git status                 # See what changed
git add .                  # Stage all changes
git commit -m "Message"    # Save changes
git push                   # Upload to GitHub
git pull                   # Download from GitHub
git checkout branch-name   # Switch branches
```

### 5. **Don't Be Afraid to Break Things!** 💪

- You can always `git checkout` to undo changes
- The database is just a file (db.sqlite3) - you can delete and recreate it
- Experiment and learn!

### 6. **Ask Questions** ❓

When stuck:
1. Read the error message
2. Google the error (add "django" or "react" to your search)
3. Check the documentation
4. Ask your teammates!

---

## Additional Resources

### Documentation:

- **React**: https://react.dev/learn
- **Django**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **TypeScript**: https://www.typescriptlang.org/docs/

### Tutorials:

- **React for Beginners**: https://react.dev/learn/tutorial-tic-tac-toe
- **Django Tutorial**: https://docs.djangoproject.com/en/stable/intro/tutorial01/
- **HTTP/APIs**: https://developer.mozilla.org/en-US/docs/Web/HTTP

### Tools:

- **Postman**: Test API endpoints (https://www.postman.com/)
- **DB Browser for SQLite**: View database graphically (https://sqlitebrowser.org/)
- **VS Code Extensions**:
  - Python
  - ES7+ React/Redux/React-Native snippets
  - Prettier (code formatter)

---

## Conclusion

Congratulations! You now understand:
- ✅ What CardSense does
- ✅ How frontend and backend work together
- ✅ The technologies we use
- ✅ How data flows through the application
- ✅ How to get started

**Next Steps:**
1. Get the project running on your machine
2. Explore the code (start with simple components)
3. Make a small change and see what happens
4. Break things and fix them - that's how you learn!

**Remember:** Every expert developer started as a beginner. The only difference is they kept learning and practicing. You got this! 💪

---

**Questions?** Ask your teammates or create an issue on GitHub!

**Happy Coding! 🚀**

