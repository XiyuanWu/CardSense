import apiService from './api';
import type { Alert } from '../types';

class AlertService {
  async getAlerts(params?: { is_read?: boolean }) {
    return apiService.get<Alert[]>('/alerts/', params);
  }

  async getUnreadAlerts() {
    return apiService.get<Alert[]>('/alerts/unread/');
  }

  async markAsRead(id: number) {
    return apiService.put(`/alerts/${id}/read/`);
  }

  async dismissAlert(id: number) {
    return apiService.delete(`/alerts/${id}/`);
  }

  async updatePreferences(preferences: Record<string, boolean>) {
    return apiService.put('/alerts/preferences/', { preferences });
  }
}

export const alertService = new AlertService();
export default alertService;

