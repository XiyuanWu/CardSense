/**
 * Login Component Tests
 * 
 * Tests for the Login component including form rendering, validation,
 * user interaction, and authentication flow.
 * 
 * Expectations:
 * - Renders email and password input fields
 * - Renders sign in button and links
 * - Handles form submission with valid credentials
 * - Displays error message on login failure
 * - Shows loading state during submission
 * - Navigates to dashboard on successful login
 * 
 * Run this test file:
 *   npm test -- Login.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { authService } from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Helper to render component
const renderLogin = () => {
  return render(<Login />);
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the login form with all required elements', () => {
      renderLogin();

      // Check for branding
      expect(screen.getByText('CardSense')).toBeInTheDocument();
      expect(screen.getByText('Maximize your credit card rewards')).toBeInTheDocument();

      // Check for form title
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();

      // Check for input fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Check for links
      expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toBeRequired();
    });

    it('renders password input with correct attributes', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toBeRequired();
    });

    it('renders remember me checkbox', () => {
      renderLogin();

      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('updates email field when user types', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('updates password field when user types', async () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('submits form with entered credentials', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'test@example.com' } },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Login Flow', () => {
    it('navigates to dashboard on successful login', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'test@example.com' } },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('displays error message on login failure', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'wrong@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('displays generic error when no error message provided', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'UNKNOWN' },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('displays error on unexpected exception', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text and disables button during submission', async () => {
      // Create a promise that won't resolve immediately
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      (authService.login as jest.Mock).mockReturnValue(loginPromise);

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      fireEvent.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      });

      // Resolve the promise
      resolveLogin!({ success: true, data: { user: { id: 1 } } });

      // Button should return to normal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('has link to forgot password page', () => {
      renderLogin();

      const forgotLink = screen.getByText(/forgot password\?/i);
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

    it('has link to register page', () => {
      renderLogin();

      const signUpLink = screen.getByText(/sign up/i);
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });
});

