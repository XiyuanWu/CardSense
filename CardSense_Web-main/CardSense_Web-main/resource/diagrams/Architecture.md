# CardSense - Architecture & Design Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Frontend Architecture](#frontend-architecture)
6. [Security Considerations](#security-considerations)
7. [Scalability & Performance](#scalability--performance)

---

## System Overview

CardSense is a full-stack web application designed to help users track spending, manage budgets, and optimize credit card rewards. The system follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React)                       │
│  - User Interface                                   │
│  - Data Visualization                               │
│  - Real-time Updates                                │
└────────────────────┬────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────┐
│          Backend (Django REST Framework)            │
│  - Business Logic                                   │
│  - Authentication & Authorization                   │
│  - Reward Calculation Engine                        │
│  - Recommendation System                            │
└────────────────────┬────────────────────────────────┘
                     │ ORM (Django Models)
┌────────────────────▼────────────────────────────────┐
│              Database (SQLite/PostgreSQL)           │
│  - User Data                                        │
│  - Transactions                                     │
│  - Card Database                                    │
│  - Budgets & Alerts                                 │
└─────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** React with TypeScript

**Components:**
- **Authentication Module**: Login, registration, password reset
- **Dashboard**: Overview of spending, budgets, and rewards
- **Transaction Manager**: Add, edit, delete, import transactions
- **Budget Planner**: Set and monitor budget limits
- **Card Optimizer**: Find best card for purchases
- **Analytics Dashboard**: Visualizations and reports
- **Notification Center**: Alerts and recommendations

**Key Features:**
- Responsive design for mobile and desktop
- Real-time data updates
- Interactive charts (using Chart.js or D3.js)
- CSV upload with drag-and-drop
- Progressive Web App (PWA) capabilities

### 2. Application Layer (Backend)

**Technology:** Django with Django REST Framework

**Core Modules:**

#### a. Authentication Service
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Password reset via email

#### b. Transaction Service
- CRUD operations for transactions
- CSV parsing and validation
- Automatic categorization
- Transaction filtering and search

#### c. Budget Service
- Budget creation and management
- Real-time budget tracking
- Threshold monitoring
- Alert generation

#### d. Card Management Service
- Card database maintenance
- User card wallet management
- Reward rule engine
- Card comparison logic

#### e. Recommendation Engine
- Spending pattern analysis
- Card suggestion algorithm
- Reward optimization
- Personalized insights

#### f. Analytics Service
- Report generation
- Trend analysis
- Data aggregation
- Export functionality

### 3. Data Layer

**Technology:** SQLite (development) / PostgreSQL (production)

**Key Design Decisions:**
- Normalized schema to reduce redundancy
- Indexed foreign keys for query performance
- Soft deletes for audit trail
- Timestamping for all records

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### transactions
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP NOT NULL,
    category_id INTEGER,
    card_id INTEGER,
    merchant VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (card_id) REFERENCES credit_cards(id)
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

#### budgets
```sql
CREATE TABLE budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### credit_cards
```sql
CREATE TABLE credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(100),
    annual_fee DECIMAL(10, 2) DEFAULT 0,
    image_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### reward_rules
```sql
CREATE TABLE reward_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'cashback', 'points', 'miles'
    reward_value DECIMAL(5, 2) NOT NULL, -- percentage or points per dollar
    cap_amount DECIMAL(10, 2),
    cap_period VARCHAR(20),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (card_id) REFERENCES credit_cards(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Relationships Summary

```
users 1──────* transactions
users 1──────* budgets
users 1──────* user_cards
users 1──────* alerts

transactions *──────1 categories
transactions *──────1 credit_cards
transactions 1──────1 reward_tracking

budgets *──────1 categories
budgets 1──────* budget_alerts

credit_cards 1──────* reward_rules
credit_cards 1──────* user_cards

reward_rules *──────1 categories
```

---

## API Design

### RESTful Endpoints

#### Authentication
```
POST   /api/auth/register/          - Register new user
POST   /api/auth/login/             - Login user
POST   /api/auth/logout/            - Logout user
POST   /api/auth/password-reset/    - Request password reset
PUT    /api/auth/password-reset/confirm/ - Confirm password reset
GET    /api/auth/profile/           - Get user profile
PUT    /api/auth/profile/           - Update user profile
```

#### Transactions
```
GET    /api/transactions/           - List all transactions (paginated)
POST   /api/transactions/           - Create transaction
GET    /api/transactions/{id}/      - Get transaction details
PUT    /api/transactions/{id}/      - Update transaction
DELETE /api/transactions/{id}/      - Delete transaction
POST   /api/transactions/import/    - Import CSV
GET    /api/transactions/export/    - Export transactions
GET    /api/transactions/summary/   - Get spending summary
```

#### Budgets
```
GET    /api/budgets/                - List all budgets
POST   /api/budgets/                - Create budget
GET    /api/budgets/{id}/           - Get budget details
PUT    /api/budgets/{id}/           - Update budget
DELETE /api/budgets/{id}/           - Delete budget
GET    /api/budgets/{id}/status/    - Get current budget status
GET    /api/budgets/summary/        - Get all budgets summary
```

#### Cards
```
GET    /api/cards/                  - List all available cards
GET    /api/cards/{id}/             - Get card details
GET    /api/cards/{id}/rewards/     - Get card reward rules
GET    /api/cards/recommend/        - Get card recommendation
POST   /api/cards/compare/          - Compare multiple cards

GET    /api/user-cards/             - List user's cards
POST   /api/user-cards/             - Add card to wallet
DELETE /api/user-cards/{id}/        - Remove card from wallet
PUT    /api/user-cards/{id}/primary/ - Set as primary card
```

#### Recommendations
```
GET    /api/recommendations/        - Get personalized recommendations
GET    /api/recommendations/cards/  - Get card suggestions
GET    /api/recommendations/insights/ - Get spending insights
POST   /api/recommendations/{id}/dismiss/ - Dismiss recommendation
```

#### Alerts
```
GET    /api/alerts/                 - List all alerts
GET    /api/alerts/unread/          - Get unread alerts
PUT    /api/alerts/{id}/read/       - Mark as read
DELETE /api/alerts/{id}/            - Dismiss alert
PUT    /api/alerts/preferences/     - Update alert preferences
```

#### Analytics
```
GET    /api/analytics/dashboard/    - Get dashboard data
GET    /api/analytics/spending-trends/ - Get spending trends
GET    /api/analytics/category-breakdown/ - Category analysis
GET    /api/analytics/rewards-summary/ - Total rewards earned
POST   /api/analytics/generate-report/ - Generate custom report
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "amount": ["This field is required"]
    }
  }
}
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── PasswordReset.tsx
│   ├── dashboard/
│   │   ├── DashboardOverview.tsx
│   │   ├── SpendingChart.tsx
│   │   └── BudgetProgress.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── CSVUpload.tsx
│   │   └── TransactionFilter.tsx
│   ├── budgets/
│   │   ├── BudgetList.tsx
│   │   ├── BudgetForm.tsx
│   │   └── BudgetCard.tsx
│   ├── cards/
│   │   ├── CardList.tsx
│   │   ├── CardDetails.tsx
│   │   ├── CardRecommendation.tsx
│   │   └── CardComparison.tsx
│   ├── recommendations/
│   │   ├── RecommendationList.tsx
│   │   └── InsightCard.tsx
│   ├── alerts/
│   │   ├── NotificationCenter.tsx
│   │   └── AlertBanner.tsx
│   └── common/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── transaction.service.ts
│   ├── budget.service.ts
│   ├── card.service.ts
│   └── analytics.service.ts
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── transactionSlice.ts
│   │   ├── budgetSlice.ts
│   │   └── cardSlice.ts
│   └── store.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTransactions.ts
│   ├── useBudgets.ts
│   └── useAlerts.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── types/
    ├── user.types.ts
    ├── transaction.types.ts
    ├── budget.types.ts
    └── card.types.ts
```

### State Management

**Technology:** Redux Toolkit or Context API

**Key State Slices:**
- `auth`: User authentication state
- `transactions`: Transaction data and filters
- `budgets`: Budget information and status
- `cards`: Card database and user cards
- `recommendations`: Personalized suggestions
- `alerts`: Notifications and alerts
- `ui`: UI state (loading, modals, etc.)

---

## Security Considerations

### Authentication & Authorization
- JWT tokens with expiration
- Refresh token rotation
- Password requirements (min 8 chars, mixed case, numbers, symbols)
- Rate limiting on login attempts
- CSRF protection

### Data Security
- All passwords hashed with bcrypt
- HTTPS only in production
- SQL injection prevention via ORM
- XSS protection
- Input validation and sanitization

### API Security
- Token-based authentication
- Permission-based access control
- Request rate limiting
- CORS configuration
- API versioning

---

## Scalability & Performance

### Performance Optimizations

**Backend:**
- Database query optimization with indexes
- Caching frequently accessed data (Redis)
- Pagination for large datasets
- Async task processing for heavy operations
- Database connection pooling

**Frontend:**
- Code splitting and lazy loading
- Memoization of expensive computations
- Debouncing user input
- Virtual scrolling for long lists
- Image optimization and CDN usage

### Scalability Considerations

**Current (SQLite):**
- Suitable for development and small deployments
- Single-user access pattern

**Future (PostgreSQL + Redis):**
- Horizontal scaling with load balancers
- Database replication for read scalability
- Caching layer for frequent queries
- Background job processing (Celery)
- Microservices architecture for high load

### Monitoring & Logging
- Application logging (errors, warnings, info)
- Performance monitoring
- User activity tracking
- API endpoint metrics
- Database query performance

---

## Implementation Phases

### Phase 1: Core Foundation (Weeks 1-3)
- User authentication system
- Basic transaction CRUD
- Simple budget tracking
- Database schema implementation

### Phase 2: Card System (Weeks 4-5)
- Card database setup
- Reward rules engine
- Card recommendation logic
- User card wallet

### Phase 3: Intelligence Layer (Weeks 6-7)
- Alert system
- Recommendation engine
- Analytics dashboard
- Spending insights

### Phase 4: Polish & Testing (Weeks 8-9)
- UI/UX improvements
- Bug fixes
- Performance optimization
- Comprehensive testing
- Documentation
- Deployment

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + TypeScript | UI Components |
| State Management | Redux Toolkit | Client State |
| Styling | Tailwind CSS | Responsive Design |
| Charts | Chart.js / Recharts | Data Visualization |
| Backend | Django 5.2 | Application Logic |
| API | Django REST Framework | RESTful API |
| Database | SQLite → PostgreSQL | Data Persistence |
| Authentication | JWT | Secure Auth |
| Testing | Jest + Pytest | Unit & Integration Tests |
| Deployment | Docker + Nginx | Production Hosting |

---

## Conclusion

This architecture provides a solid foundation for CardSense while maintaining flexibility for future enhancements. The modular design allows for independent development and testing of features, and the technology choices balance ease of development with production readiness.

