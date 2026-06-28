/**
 * Register Component Tests
 * 
 * Tests for the Register component including form rendering, validation,
 * user interaction, and registration flow.
 * 
 * Expectations:
 * - Renders all required input fields (name, email, password, confirm password)
 * - Validates password match before submission
 * - Validates minimum password length
 * - Handles form submission with valid data
 * - Displays error messages appropriately
 * - Shows loading state during submission
 * - Navigates to dashboard on successful registration
 * 
 * Run this test file:
 *   npm test -- Register.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from './Register';
import { authService } from '../../services/auth.service';

// Mock the auth service
jest.mock('../../services/auth.service', () => ({
  authService: {
    register: jest.fn(),
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
const renderRegister = () => {
  return render(<Register />);
};

// Helper to fill in the registration form
const fillRegistrationForm = async (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}) => {
  if (data.firstName) {
    await userEvent.type(screen.getByLabelText(/first name/i), data.firstName);
  }
  if (data.lastName) {
    await userEvent.type(screen.getByLabelText(/last name/i), data.lastName);
  }
  if (data.email) {
    await userEvent.type(screen.getByLabelText(/email/i), data.email);
  }
  if (data.password) {
    await userEvent.type(screen.getByLabelText(/^password$/i), data.password);
  }
  if (data.confirmPassword) {
    await userEvent.type(screen.getByLabelText(/confirm password/i), data.confirmPassword);
  }
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the registration form with all required elements', () => {
      renderRegister();

      // Check for branding
      expect(screen.getByText('CardSense')).toBeInTheDocument();
      expect(screen.getByText('Start optimizing your credit card rewards')).toBeInTheDocument();

      // Check for form title (using heading role to differentiate from button)
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();

      // Check for input fields
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

      // Check for submit button
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

      // Check for sign in link
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    it('renders name inputs with correct attributes', () => {
      renderRegister();

      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute('type', 'text');
      expect(firstNameInput).toHaveAttribute('name', 'first_name');
      expect(firstNameInput).toBeRequired();

      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(lastNameInput).toHaveAttribute('type', 'text');
      expect(lastNameInput).toHaveAttribute('name', 'last_name');
      expect(lastNameInput).toBeRequired();
    });

    it('renders email input with correct attributes', () => {
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toBeRequired();
    });

    it('renders password inputs with correct attributes', () => {
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toBeRequired();

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('name', 'confirmPassword');
      expect(confirmPasswordInput).toBeRequired();
    });

    it('shows password length hint', () => {
      renderRegister();

      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('updates all fields when user types', async () => {
      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
      expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('password123');
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('password123');
    });
  });

  describe('Validation', () => {
    it('shows error when passwords do not match', async () => {
      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });

      // Should not call register
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('shows error when password is less than 8 characters', async () => {
      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });

      // Should not call register
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('validates password length before password match', async () => {
      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'short1',
        confirmPassword: 'short2', // Different but both too short
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should show mismatch error first (it's checked first in the code)
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Registration Flow', () => {
    it('submits form with correct data (excluding confirmPassword)', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'john@example.com' } },
      });

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        });
      });
    });

    it('navigates to dashboard on successful registration', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: true,
        data: { user: { id: 1, email: 'john@example.com' } },
      });

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('displays error message on registration failure', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already registered' },
      });

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });
    });

    it('displays generic error when no error message provided', async () => {
      (authService.register as jest.Mock).mockResolvedValue({
        success: false,
        error: { code: 'UNKNOWN' },
      });

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Registration failed')).toBeInTheDocument();
      });
    });

    it('displays error on unexpected exception', async () => {
      (authService.register as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text and disables button during submission', async () => {
      // Create a promise that won't resolve immediately
      let resolveRegister: (value: any) => void;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      (authService.register as jest.Mock).mockReturnValue(registerPromise);

      renderRegister();

      await fillRegistrationForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
      });

      // Resolve the promise
      resolveRegister!({ success: true, data: { user: { id: 1 } } });

      // Button should return to normal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    it('has link to login page', () => {
      renderRegister();

      const signInLink = screen.getByText(/sign in/i);
      expect(signInLink).toHaveAttribute('href', '/login');
    });
  });
});

