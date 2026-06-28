# CardSense Frontend

Modern React + TypeScript frontend for the CardSense budget tracker and credit card reward optimizer.

## 🚀 Tech Stack

- **Framework:** React 19.2
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Date Handling:** date-fns

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx          # Login page
│   │   └── Register.tsx       # Registration page
│   ├── Dashboard/
│   │   └── Dashboard.tsx      # Main dashboard
│   └── Layout/
│       ├── Navbar.tsx         # Navigation bar
│       └── PrivateRoute.tsx   # Protected route wrapper
├── services/
│   ├── api.ts                 # Base API service
│   ├── auth.service.ts        # Authentication API
│   ├── transaction.service.ts # Transaction API
│   ├── budget.service.ts      # Budget API
│   ├── card.service.ts        # Card API
│   ├── alert.service.ts       # Alert API
│   └── analytics.service.ts   # Analytics API
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   └── formatters.ts          # Utility functions
├── App.tsx                    # Main app component
└── index.tsx                  # Entry point
```

## 🛠️ Setup

### Prerequisites
- Node.js 16+ and npm
- Django backend running on http://127.0.0.1:8000

### Installation

```bash
cd web
npm install
```

### Environment Configuration

Create a `.env` file in the `web/` directory:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

### Running the Development Server

```bash
npm start
```

The app will open at http://localhost:3000

## 🎨 Features Implemented

### ✅ Authentication
- User registration with validation
- Login with JWT token management
- Logout functionality
- Protected routes
- Session persistence

### ✅ Dashboard
- Summary cards (spending, rewards, budgets, alerts)
- Budget progress bars with color coding
- Recent transactions list
- Quick action buttons
- Real-time alerts display

### ✅ Navigation
- Responsive navbar
- User menu dropdown
- Route protection
- Mobile-friendly design

### 🔄 Coming Soon
- Transaction management (add, edit, delete, CSV import)
- Budget creation and monitoring
- Card database browsing
- Card recommendations
- Analytics dashboards
- Spending charts and visualizations

## 🔑 API Integration

All API calls use the centralized service layer:

```typescript
import { authService } from './services/auth.service';
import { transactionService } from './services/transaction.service';
import { budgetService } from './services/budget.service';

// Example: Login
const response = await authService.login({ email, password });

// Example: Get transactions
const transactions = await transactionService.getTransactions();

// Example: Create budget
const budget = await budgetService.createBudget(budgetData);
```

### Authentication

JWT tokens are automatically attached to all API requests. Tokens are stored in `localStorage` and managed by the auth service.

### Error Handling

All services return a standardized `ApiResponse<T>` type:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

## 📱 Components Guide

### Authentication Components

**Login (`components/auth/Login.tsx`)**
- Email/password login form
- Remember me checkbox
- Forgot password link
- Link to registration
- Error handling and loading states

**Register (`components/auth/Register.tsx`)**
- Multi-field registration form
- Password confirmation
- Validation (email format, password length)
- Automatic login after successful registration

### Dashboard Component

**Dashboard (`components/Dashboard/Dashboard.tsx`)**
- **Summary Cards:** Display key metrics
- **Budget Status:** Visual progress bars for each budget
- **Recent Transactions:** List of latest spending
- **Quick Actions:** Shortcuts to common tasks
- **Alerts:** Displays unread notifications

### Layout Components

**Navbar (`components/Layout/Navbar.tsx`)**
- Logo and brand name
- Navigation links
- User profile dropdown
- Logout functionality

**PrivateRoute (`components/Layout/PrivateRoute.tsx`)**
- Protects authenticated routes
- Redirects to login if not authenticated
- Wraps protected pages with Navbar

## 🎨 Styling

The app uses Tailwind CSS for styling. Key design decisions:

### Color Scheme
- **Primary:** Blue-600 (#0284c7)
- **Success:** Green-500
- **Warning:** Orange-500
- **Danger:** Red-600

### Layout
- Max width: 7xl (1280px)
- Responsive breakpoints: sm, md, lg, xl
- Mobile-first design approach

### Custom Tailwind Config
See `tailwind.config.js` for custom color palette and theme extensions.

## 🔐 Security

- JWT token-based authentication
- Tokens stored in `localStorage`
- Automatic token expiration handling (401 redirects)
- CORS configured for development
- Input validation on all forms
- XSS protection via React's default escaping

## 📊 Type Safety

Full TypeScript support with comprehensive type definitions:

```typescript
// User types
User, UserProfile, AuthResponse

// Transaction types
Transaction, TransactionCategory, TransactionFormData

// Budget types
Budget, BudgetFormData

// Card types
CreditCard, UserCard, RewardRule, CardRecommendation

// Analytics types
DashboardData, SpendingAnalytics

// Common types
ApiResponse<T>, Alert, Recommendation
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🏗️ Building for Production

```bash
# Create optimized production build
npm run build

# The build folder will contain optimized static files
```

## 🐛 Troubleshooting

### API Connection Issues
- Ensure Django backend is running on http://127.0.0.1:8000
- Check CORS settings in Django `settings.py`
- Verify `REACT_APP_API_URL` in `.env` file

### Styling Not Working
- Ensure Tailwind CSS is properly configured
- Run `npm install` to ensure `tailwindcss` is installed
- Check that `index.css` imports Tailwind directives

### TypeScript Errors
- Run `npm install` to ensure all type definitions are installed
- Check `tsconfig.json` for proper configuration
- Restart your IDE/editor

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/docs/intro)

## 🤝 Contributing

When adding new features:

1. Create type definitions in `types/index.ts`
2. Add service methods in appropriate service file
3. Create component in relevant directory
4. Add route in `App.tsx`
5. Update this README with new features

## 📝 Notes

- The frontend is designed to work with the Django REST API backend
- All API endpoints follow RESTful conventions
- Authentication uses JWT tokens with automatic refresh
- Components are built with reusability and maintainability in mind
- Tailwind CSS enables rapid UI development

---

**Project:** CardSense - Budget Tracker & Credit Card Reward Optimizer  
**Team:** BBAX (Xiyuan Wu, Andrew Do, Brandon Nguyen, Burhanuddin Taquee)  
**Course:** CS180 Group Project

