import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { transactionService } from '../../services/transaction.service';
import { cardService } from '../../services/card.service';
import type { UserCard } from '../../types';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

const CATEGORY_CHOICES = [
  { value: 'SELECTED_CATEGORIES', label: 'Selected Categories' },
  { value: 'RENT', label: 'Rent' },
  { value: 'ONLINE_SHOPPING', label: 'Online Shopping' },
  { value: 'DINING', label: 'Dining' },
  { value: 'GROCERIES', label: 'Groceries' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'GAS', label: 'Gas' },
  { value: 'GENERAL_TRAVEL', label: 'General Travel' },
  { value: 'AIRLINE_TRAVEL', label: 'Airline Travel' },
  { value: 'HOTEL_TRAVEL', label: 'Hotel Travel' },
  { value: 'TRANSIT', label: 'Transit' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'OTHER', label: 'Other' },
];

interface Recommendation {
  best_card: {
    card_id: number;
    card_name: string;
  } | null;
  multiplier: number;
  rationale: string;
  top3: Array<{
    card_id: number;
    card_name: string;
    multiplier: number;
  }>;
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: '',
    card: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    loadUserCards();
  }, []);

  const loadUserCards = async () => {
    const response = await cardService.getUserCards();
    if (response.success && response.data) {
      setUserCards(response.data.filter((card) => card.is_active));
    }
    setLoadingCards(false);
  };

  const fetchRecommendation = async (category: string, amount?: string) => {
    if (!category) {
      setRecommendation(null);
      return;
    }

    setLoadingRecommendation(true);
    try {
      const response = await transactionService.getCardRecommendation(
        category,
        amount ? parseFloat(amount) : undefined
      );

      if (response.success && response.data) {
        setRecommendation(response.data.recommendation);
      }
    } catch (err) {
      console.error('Failed to fetch recommendation:', err);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.merchant.trim()) {
      setError('Merchant name is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    setLoading(true);

    try {
      let cardToUse: number | undefined = undefined;
      if (formData.card) {
        cardToUse = parseInt(formData.card);
      } else if (recommendation?.best_card?.card_id) {
        cardToUse = recommendation.best_card.card_id;
      }

      const response = await transactionService.createTransaction({
        merchant: formData.merchant,
        amount: parseFloat(formData.amount),
        category: formData.category,
        card_actually_used: cardToUse,
        notes: formData.notes || undefined,
      });

      if (response.success) {
        navigate('/transactions');
      } else {
        setError(response.error?.message || 'Failed to create transaction');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'category') {
      fetchRecommendation(value, formData.amount);
    } else if (name === 'amount' && formData.category) {
      fetchRecommendation(formData.category, value);
    }
  };

  if (loadingCards) {
    return <PageLoading message="Loading cards..." />;
  }

  return (
    <PageLayout title="Add Transaction" subtitle="Record a new purchase and earn rewards">
      <div className="page-card">
        <div className="page-card-body">
          {error && <div className="page-alert page-alert--error">{error}</div>}

          {userCards.length === 0 && (
            <div className="page-info-box">
              <h3>Tip: Add cards for better recommendations</h3>
              <p>
                You can still add transactions, but adding cards to your wallet will give you
                personalized recommendations.{' '}
                <Link to="/cards" className="page-link">
                  Go to Cards
                </Link>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-field">
              <label htmlFor="merchant">Merchant Name *</label>
              <input
                type="text"
                id="merchant"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                required
                placeholder="e.g., Whole Foods, Amazon, Shell"
              />
            </div>

            <div className="form-field">
              <label htmlFor="amount">Amount ($) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {CATEGORY_CHOICES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.category && (
              <div className="recommendation-box">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Recommended Card</h3>
                {loadingRecommendation ? (
                  <p className="text-sm text-gray-600">Loading recommendation...</p>
                ) : recommendation && recommendation.best_card ? (
                  <div>
                    <p className="text-base font-bold text-green-800 mb-1">
                      {recommendation.best_card.card_name || 'Unknown Card'}
                    </p>
                    <p className="text-sm text-gray-700 mb-1">{recommendation.rationale}</p>
                    {formData.amount && parseFloat(formData.amount) > 0 && (
                      <p className="text-sm font-semibold text-green-600">
                        Potential Reward: $
                        {((parseFloat(formData.amount) * recommendation.multiplier) / 100).toFixed(
                          2
                        )}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    No card recommendations available for this category.
                  </p>
                )}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="card">Card Used (Optional)</label>
              <p className="form-field-help" style={{ marginBottom: '0.375rem' }}>
                Leave blank to use the recommended card above
              </p>
              <select
                id="card"
                name="card"
                value={formData.card}
                onChange={handleChange}
                disabled={userCards.length === 0}
              >
                <option value="">Use recommended card</option>
                {userCards.map((userCard) => (
                  <option key={userCard.id} value={userCard.card_id}>
                    {userCard.card_name || `Card ${userCard.card_id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional details about this transaction..."
                className="resize-none"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="page-btn page-btn-primary">
                {loading ? 'Adding Transaction...' : 'Add Transaction'}
              </button>
              <Link to="/dashboard" className="page-btn page-btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default AddTransaction;
