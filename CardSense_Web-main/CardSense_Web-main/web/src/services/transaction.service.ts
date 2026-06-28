import apiService from './api';
import type { Transaction, TransactionFormData, TransactionCategory, CardRecommendationResponse, OptimizationStats } from '../types';

class TransactionService {
  async getTransactions(params?: {
    start_date?: string;
    end_date?: string;
    category_id?: number;
    card_id?: number;
    page?: number;
    page_size?: number;
  }) {
    return apiService.get<Transaction[]>('/transactions/transactions/', params);
  }

  async getTransaction(id: number) {
    return apiService.get<Transaction>(`/transactions/transactions/${id}/`);
  }

  async createTransaction(data: TransactionFormData) {
    return apiService.post<Transaction>('/transactions/transactions/', data);
  }

  async updateTransaction(id: number, data: Partial<TransactionFormData>) {
    return apiService.put<Transaction>(`/transactions/transactions/${id}/`, data);
  }

  async deleteTransaction(id: number) {
    return apiService.delete(`/transactions/transactions/${id}/`);
  }

  async importCSV(file: File) {
    return apiService.uploadFile<{ imported_count: number; failed_count: number; results: any[] }>(
      '/transactions/import-csv/',
      file
    );
  }

  async getCategories() {
    return apiService.get<TransactionCategory[]>('/categories/');
  }

  async getSummary(params?: { start_date?: string; end_date?: string }) {
    return apiService.get('/transactions/summary/', params);
  }

  async exportTransactions(params?: { start_date?: string; end_date?: string; format?: 'csv' | 'pdf' }) {
    return apiService.get('/transactions/export/', params);
  }

  async getCardRecommendation(category: string, amount?: number) {
    return apiService.post<CardRecommendationResponse>('/transactions/recommend-card/', { category, amount });
  }

  async getOptimizationStats() {
    return apiService.get<OptimizationStats>('/transactions/optimization-stats/');
  }
}

export const transactionService = new TransactionService();
export default transactionService;

