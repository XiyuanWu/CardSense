import apiService from './api';
import type { UserCategorySelection, OptimizerResult, RewardCategory } from '../types';

class OptimizerService {
  // User category selections (CRUD)
  async getUserCategorySelections() {
    return apiService.get<UserCategorySelection[]>('/optimizer/user-category-selections/');
  }

  async addCategorySelection(category_tag: RewardCategory) {
    return apiService.post<UserCategorySelection>('/optimizer/user-category-selections/', { 
      category_tag 
    });
  }

  async removeCategorySelection(id: number) {
    return apiService.delete(`/optimizer/user-category-selections/${id}/`);
  }

  // Optimizer dashboard - get best cards for all user's selected categories
  async getOptimizerDashboard() {
    return apiService.get<OptimizerResult[]>('/optimizer/my-optimizer-dashboard/');
  }
}

export const optimizerService = new OptimizerService();
export default optimizerService;

