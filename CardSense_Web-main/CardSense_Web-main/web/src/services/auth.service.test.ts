/**
 * Auth Service Tests
 * 
 * Tests for the authentication service including login, register, logout,
 * and session management functionality.
 * 
 * Expectations:
 * - Login: successful login stores user in localStorage and returns success
 * - Login: failed login returns error and doesn't store user
 * - Register: successful registration stores user and returns success
 * - Register: failed registration returns error
 * - Logout: clears localStorage and redirects to login
 * - getCurrentUser: retrieves and parses user from localStorage
 * - isAuthenticated: returns true when user exists in localStorage
 * 
 * Run this test file:
 *   npm test -- auth.service.test.ts
 */

import { authService } from './auth.service';
import apiService from './api';

// Mock the api service
jest.mock('./api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('AuthService', () => {
  // Clear localStorage and reset mocks before each test
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      created_at: '2024-01-01T00:00:00Z',
    };

    it('stores user in localStorage on successful login', async () => {
      const mockResponse = {
        success: true,
        data: { user: mockUser },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(apiService.post).toHaveBeenCalledWith('/auth/login/', mockCredentials);
      expect(result.success).toBe(true);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('does not store user on failed login', async () => {
      const mockResponse = {
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('returns error response when API fails', async () => {
      const mockResponse = {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Internal server error' },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Internal server error');
    });
  });

  describe('register', () => {
    const mockRegisterData = {
      email: 'newuser@example.com',
      password: 'securepass123',
      first_name: 'New',
      last_name: 'User',
    };

    const mockUser = {
      id: 2,
      email: 'newuser@example.com',
      first_name: 'New',
      last_name: 'User',
      created_at: '2024-01-01T00:00:00Z',
    };

    it('stores user in localStorage on successful registration', async () => {
      const mockResponse = {
        success: true,
        data: { user: mockUser },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register(mockRegisterData);

      expect(apiService.post).toHaveBeenCalledWith('/auth/register/', mockRegisterData);
      expect(result.success).toBe(true);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('does not store user on failed registration', async () => {
      const mockResponse = {
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.register(mockRegisterData);

      expect(result.success).toBe(false);
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears localStorage and redirects to login', async () => {
      // Set up initial state
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com' }));
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      await authService.logout();

      expect(apiService.post).toHaveBeenCalledWith('/auth/logout/', {});
      expect(localStorage.getItem('user')).toBeNull();
      expect(mockLocation.href).toBe('/login');
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when stored in localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('returns null when no user in localStorage', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('returns null for invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid-json');

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when user exists in localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when no user in localStorage', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('returns false when localStorage user is empty string', () => {
      localStorage.setItem('user', '');

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getProfile', () => {
    it('calls API to get user profile', async () => {
      const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User' };
      (apiService.get as jest.Mock).mockResolvedValue({ success: true, data: mockUser });

      const result = await authService.getProfile();

      expect(apiService.get).toHaveBeenCalledWith('/auth/me/');
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfile', () => {
    it('calls API to update user profile', async () => {
      const updateData = { first_name: 'Updated' };
      (apiService.patch as jest.Mock).mockResolvedValue({ success: true, data: { ...updateData } });

      const result = await authService.updateProfile(updateData);

      expect(apiService.patch).toHaveBeenCalledWith('/auth/profile/', updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('requestPasswordReset', () => {
    it('calls API to request password reset', async () => {
      const email = 'test@example.com';
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      const result = await authService.requestPasswordReset(email);

      expect(apiService.post).toHaveBeenCalledWith('/auth/password/reset/', { email });
      expect(result.success).toBe(true);
    });
  });

  describe('confirmPasswordReset', () => {
    it('calls API to confirm password reset', async () => {
      const resetData = {
        uid: 'abc123',
        token: 'token123',
        new_password: 'newpass123',
        new_password_confirm: 'newpass123',
      };
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      const result = await authService.confirmPasswordReset(resetData);

      expect(apiService.post).toHaveBeenCalledWith('/auth/password/reset/confirm/', resetData);
      expect(result.success).toBe(true);
    });
  });
});


