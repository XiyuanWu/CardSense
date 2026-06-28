import apiService from './api';
import type { CreditCard, UserCard, CardBenefit, RewardRule } from '../types';

class CardService {
  // Card database (read-only for users)
  async getAllCards() {
    return apiService.get<CreditCard[]>('/cards/cards/');
  }

  async getCard(id: number) {
    return apiService.get<CreditCard>(`/cards/cards/${id}/`);
  }

  // Reward rules (read-only)
  async getRewardRules() {
    return apiService.get<RewardRule[]>('/cards/reward-rules/');
  }

  // Card benefits (read-only)
  async getCardBenefits() {
    return apiService.get<CardBenefit[]>('/cards/card-benefits/');
  }

  // User cards (full CRUD for personalization)
  async getUserCards() {
    return apiService.get<UserCard[]>('/cards/user-cards/');
  }

  async addUserCard(card_id: number, notes?: string, is_active: boolean = true) {
    return apiService.post<UserCard>('/cards/user-cards/', { 
      card: card_id, 
      notes,
      is_active 
    });
  }

  async updateUserCard(id: number, data: { notes?: string; is_active?: boolean }) {
    return apiService.patch<UserCard>(`/cards/user-cards/${id}/`, data);
  }

  async removeUserCard(id: number) {
    return apiService.delete(`/cards/user-cards/${id}/`);
  }

  // Get rewards earned per card
  async getCardRewards() {
    return apiService.get<Array<{
      card_id: number;
      card_name: string;
      card_issuer: string;
      rewards_earned: number;
    }>>('/cards/rewards/');
  }
}

export const cardService = new CardService();
export default cardService;

