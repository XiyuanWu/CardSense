import apiService from './api';
import type { DashboardData, SpendingAnalytics } from '../types';

class AnalyticsService {
  async getDashboard() {
    return apiService.get<DashboardData>('/analytics/dashboard/');
  }

  async getSpendingTrends(params?: { start_date?: string; end_date?: string; period?: 'day' | 'week' | 'month' }) {
    return apiService.get('/analytics/spending-trends/', params);
  }

  async getCategoryBreakdown(params?: { start_date?: string; end_date?: string }) {
    return apiService.get('/analytics/category-breakdown/', params);
  }

  async getRewardsSummary(params?: { start_date?: string; end_date?: string }) {
    return apiService.get('/analytics/rewards-summary/', params);
  }

  async generateReport(params: {
    report_type: string;
    start_date: string;
    end_date: string;
    format?: 'pdf' | 'csv';
  }) {
    return apiService.post<SpendingAnalytics>('/analytics/generate-report/', params);
  }

  async comparePeriods(params: {
    period1_start: string;
    period1_end: string;
    period2_start: string;
    period2_end: string;
  }) {
    return apiService.get('/analytics/compare-periods/', params);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;

