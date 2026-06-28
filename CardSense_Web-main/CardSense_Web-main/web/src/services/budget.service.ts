import apiService from './api';
import type { Budget, BudgetFormData } from '../types';

class BudgetService {
  async getBudgets(params?: { is_active?: boolean }) {
    return apiService.get<any[]>('/budgets/', params);
  }
  
  async getAllBudgets() {
    return apiService.get<any[]>('/budgets/');
  }

  async getBudget(id: number) {
    return apiService.get<Budget>(`/budgets/${id}/`);
  }

  async createBudget(data: BudgetFormData) {
    return apiService.post<Budget>('/budgets/', data);
  }

  async updateBudget(id: number, data: Partial<BudgetFormData>) {
    return apiService.put<Budget>(`/budgets/${id}/`, data);
  }

  async deleteBudget(yearMonth?: string) {
    const params = yearMonth ? `?year_month=${yearMonth}` : '';
    return apiService.delete(`/budgets/${params}`);
  }

  async getBudgetStatus(id: number) {
    return apiService.get<{
      budget: Budget;
      spent: number;
      remaining: number;
      percentage_used: number;
      is_exceeded: boolean;
    }>(`/budgets/${id}/status/`);
  }

  async getSummary() {
    return apiService.get<Budget[]>('/budgets/summary/');
  }

  async getCurrentBudget() {
    return apiService.get<{
      budget: number | null;
      mtd: number;
      percent_used: number;
      next_threshold: number | null;
    }>('/budgets/current/');
  }

  async getAlerts() {
    return apiService.get<any[]>('/budgets/alerts/');
  }

  async acknowledgeAlert(id: number) {
    return apiService.post(`/budgets/alerts/${id}/ack/`, {});
  }
}

export const budgetService = new BudgetService();
export default budgetService;

