# CardSense Frontend-Backend Connection Setup Guide

## Changes Made

### Backend Changes

1. **Updated API Response Format** (`accounts/views.py`)
   - All endpoints now return standardized responses with `success`, `data`, `message`, and `error` fields
   - Login endpoint now accepts `email` instead of `username`
   - User authentication now looks up users by email

2. **Updated Serializers** (`accounts/serializers.py`)
   - Register serializer now accepts `confirmPassword` (camelCase) matching frontend
   - Username is auto-generated from email (e.g., `user@example.com` → `user`)
   - Added email uniqueness validation

3. **CORS & CSRF Configuration** (`api/settings.py`)
   - Enabled `CORS_ALLOW_CREDENTIALS` for session cookies
   - Added CSRF trusted origins for localhost:3000
   - Configured session and CSRF cookie settings for cross-origin requests

4. **Added CSRF Endpoint** (`accounts/views.py`, `accounts/auth_urls.py`)
   - New endpoint: `GET /api/auth/csrf/` to initialize CSRF token

### Frontend Changes

1. **Updated API Service** (`web/src/services/api.ts`)
   - Removed Bearer token authentication (now uses session authentication)
   - Added CSRF token handling from cookies
   - Automatically initializes CSRF token before first POST request
   - Configured `withCredentials: true` for session cookies

2. **Updated Auth Service** (`web/src/services/auth.service.ts`)
   - Removed token-based authentication
   - Uses session authentication with cookies
   - Stores user info in localStorage (not token)

3. **Updated Login & Register Components**
   - Uncommented real API calls
   - Removed temporary mock navigation
   - Added proper error handling

## How to Test

### 1. Start the Backend Server

```bash
# Navigate to the project root
cd C:\Users\Brandon\Coding\CardSense

# Activate virtual environment (if you have one)
# venv\Scripts\activate

# Run migrations (if not done already)
python manage.py migrate

# Start the Django server
python manage.py runserver
```

The backend should be running at `http://127.0.0.1:8000/`

### 2. Start the Frontend Server

```bash
# Open a new terminal
cd C:\Users\Brandon\Coding\CardSense\web

# Install dependencies (if not done already)
npm install

# Start the React development server
npm start
```

The frontend should be running at `http://localhost:3000/`

### 3. Test Registration

1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - First Name: Your first name
   - Last Name: Your last name
   - Email: test@example.com
   - Password: password123 (at least 8 characters)
   - Confirm Password: password123
3. Click "Create Account"
4. You should be redirected to the dashboard

### 4. Test Login

1. Navigate to `http://localhost:3000/login`
2. Use the credentials you just registered:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. You should be redirected to the dashboard

## API Endpoints Available

- `GET /api/auth/csrf/` - Get CSRF token
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/me/` - Get current user info
- `PATCH /api/auth/profile/` - Update user profile
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset

## Troubleshooting

### CSRF Token Issues
- Make sure both servers are running
- Check browser console for any CORS errors
- Try clearing cookies and refreshing the page

### CORS Issues
- Ensure backend is running on `http://127.0.0.1:8000`
- Ensure frontend is running on `http://localhost:3000`
- Check Django settings for CORS configuration

### Session Issues
- Sessions are stored in cookies
- Make sure cookies are enabled in your browser
- Check that `withCredentials: true` is set in axios requests

### Authentication Issues
- Check browser DevTools → Application → Cookies
- You should see `sessionid` and `csrftoken` cookies
- If cookies are missing, check CORS configuration

## How Authentication Works

1. **First Request**: Frontend calls `/api/auth/csrf/` to get CSRF token
2. **Registration/Login**: Frontend sends credentials to backend
3. **Backend**: Creates session and sends `sessionid` cookie
4. **Subsequent Requests**: Frontend includes:
   - `sessionid` cookie (automatic via `withCredentials`)
   - `X-CSRFToken` header (extracted from `csrftoken` cookie)

## Next Steps

Once authentication is working, you can:
1. Test other API endpoints (transactions, budgets, cards, optimizer)
2. Implement the dashboard with real data
3. Add protected routes
4. Add user profile management
5. Implement password reset flow

