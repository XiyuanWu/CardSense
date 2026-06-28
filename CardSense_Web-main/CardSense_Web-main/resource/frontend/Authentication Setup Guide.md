# Authentication Setup Guide

## Current Status: ⏳ AUTHENTICATION NOT YET ENABLED

The frontend has temporary authentication disabled to allow testing without a backend. **Do NOT re-enable authentication yet** because the backend authentication endpoints are not implemented.

---

## Backend TODO: Authentication Endpoints Needed

Your buddy needs to implement these endpoints in the `accounts` app:

### Required Endpoints

```python
# accounts/urls.py should include:
urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/password/reset/', PasswordResetView.as_view(), name='password-reset'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
```

### Expected API Responses

**POST /api/accounts/auth/login/**
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (success):
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

**POST /api/accounts/auth/register/**
```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

Response (success):
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  }
}
```

**GET /api/accounts/auth/me/**
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## Frontend Changes Already Made

✅ **auth.service.ts** - Updated with correct URL paths and TODO comments
- URLs changed from `/auth/*` to `/accounts/auth/*`
- Added TODO comments for backend implementation
- Ready to use once backend is implemented

---

## When Backend is Ready: Re-enable Authentication

Follow these steps **ONLY AFTER** your buddy implements the authentication endpoints:

### Step 1: Re-enable PrivateRoute Protection

**File: `web/src/components/Layout/PrivateRoute.tsx`**

```typescript
// CHANGE FROM:
import React from 'react';
import Navbar from './Navbar';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // TEMPORARY: Disabled auth check for development (no backend yet)
  // const isAuthenticated = authService.isAuthenticated();
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// CHANGE TO:
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import Navbar from './Navbar';

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};
```

---

### Step 2: Re-enable Real Login

**File: `web/src/components/auth/Login.tsx`**

**Line 3** - Uncomment the import:
```typescript
import { authService } from '../../services/auth.service';
```

**Lines 19-37** - Replace the temporary code:
```typescript
// DELETE THIS:
// TEMPORARY: Skip backend API call for frontend testing
// Just navigate to dashboard immediately
setTimeout(() => {
  navigate('/dashboard');
}, 500);

// UNCOMMENT THIS:
try {
  const response = await authService.login(formData);
  if (response.success) {
    navigate('/dashboard');
  } else {
    setError(response.error?.message || 'Login failed');
  }
} catch (err) {
  setError('An unexpected error occurred');
} finally {
  setLoading(false);
}
```

---

### Step 3: Re-enable Real Registration

**File: `web/src/components/auth/Register.tsx`**

**Line 3** - Uncomment the import:
```typescript
import { authService } from '../../services/auth.service';
```

**Lines 33-51** - Replace the temporary code with real API call (similar pattern to Login.tsx)

---

## Quick Search Method

Search your codebase for these keywords to find all places that need changes:

1. **"TEMPORARY"** - Find all temporary authentication bypasses
2. **"TODO:"** in `auth.service.ts` - See what backend needs to implement
3. **"uncomment when backend"** - Find code that needs to be uncommented

---

## Testing Authentication (After Backend Ready)

### 1. Test Registration
```bash
# In browser console or API tool
POST http://127.0.0.1:8000/api/accounts/auth/register/
{
  "email": "test@example.com",
  "password": "testpass123",
  "first_name": "Test",
  "last_name": "User"
}
```

### 2. Test Login
```bash
POST http://127.0.0.1:8000/api/accounts/auth/login/
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

### 3. Test Protected Endpoint
```bash
GET http://127.0.0.1:8000/api/cards/user-cards/
Headers: Authorization: Bearer <token-from-login>
```

---

## Checklist for Backend Developer

- [ ] Implement User model (or use Django's default)
- [ ] Implement authentication views (Login, Register, Logout)
- [ ] Set up JWT or Session authentication in DRF
- [ ] Add authentication URLs to `accounts/urls.py`
- [ ] Test endpoints return correct response format
- [ ] Ensure CORS allows credentials if using sessions
- [ ] Add authentication to protected endpoints (cards, optimizer, etc.)
- [ ] Test token validation and expiration
- [ ] Implement password reset functionality

---

## Current File States

| File | Status | Action Needed |
|------|--------|---------------|
| `auth.service.ts` | ✅ Updated | None - Ready for backend |
| `PrivateRoute.tsx` | ⏸️ Disabled | Re-enable when backend ready |
| `Login.tsx` | ⏸️ Using mock | Re-enable when backend ready |
| `Register.tsx` | ⏸️ Using mock | Re-enable when backend ready |

---

## Summary

**DO NOW:**
- ✅ Keep authentication disabled
- ✅ Continue testing frontend without auth
- ✅ Auth service URLs are already fixed

**DO LATER (when backend ready):**
- [ ] Re-enable PrivateRoute authentication check
- [ ] Re-enable real login API call
- [ ] Re-enable real registration API call
- [ ] Test end-to-end authentication flow

---

**Last Updated**: October 29, 2025
**Backend Auth Status**: ❌ Not Implemented
**Frontend Auth Status**: ⏸️ Disabled for Testing

