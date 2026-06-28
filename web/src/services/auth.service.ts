import apiService from './api';
import type { User, LoginCredentials, RegisterData } from '../types';

interface AuthApiResponse {
  user: User;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'email' in value &&
    typeof (value as User).email === 'string'
  );
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthApiResponse>('/auth/login/', credentials);
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async register(data: RegisterData) {
    const response = await apiService.post<AuthApiResponse>('/auth/register/', data);
    if (response.success && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async logout() {
    await apiService.post('/auth/logout/', {});
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  async fetchCurrentUser(): Promise<User | null> {
    const response = await apiService.get<User>('/auth/me/');

    let user: User | null = null;
    if (isUser(response)) {
      user = response;
    } else if (response.success && response.data) {
      user = response.data;
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return this.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  async getProfile() {
    return apiService.get<User>('/auth/me/');
  }

  async updateProfile(data: Partial<User>) {
    return apiService.patch<User>('/auth/profile/', data);
  }

  async requestPasswordReset(email: string) {
    return apiService.post('/auth/password/reset/', { email });
  }

  async confirmPasswordReset(data: { uid: string; token: string; new_password: string; new_password_confirm: string }) {
    return apiService.post('/auth/password/reset/confirm/', data);
  }
}

export const authService = new AuthService();
export default authService;

