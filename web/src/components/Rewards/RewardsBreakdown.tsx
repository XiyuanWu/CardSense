import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cardService } from '../../services/card.service';
import { transactionService } from '../../services/transaction.service';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DollarSign, CreditCard, TrendingUp } from 'lucide-react';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

interface CardReward {
  card_id: number;
  card_name: string;
  card_issuer: string;
  rewards_earned: number;
}

const RewardsBreakdown: React.FC = () => {
  const [cardRewards, setCardRewards] = useState<CardReward[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsResponse, transactionsResponse] = await Promise.all([
        cardService.getCardRewards(),
        transactionService.getTransactions(),
      ]);

      if (rewardsResponse.success && rewardsResponse.data) {
        setCardRewards(rewardsResponse.data);
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
    } catch (err) {
      setError('Failed to load rewards data');
      console.error('Error loading rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalRewards = () => {
    return cardRewards.reduce((sum, card) => sum + card.rewards_earned, 0);
  };

  const getTransactionReward = (transaction: any): number => {
    if (transaction.actual_reward !== undefined && transaction.actual_reward !== null) {
      return parseFloat(transaction.actual_reward);
    }
    return 0;
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GROCERIES: 'bg-green-100 text-green-800',
      DINING: 'bg-orange-100 text-orange-800',
      GAS: 'bg-blue-100 text-blue-800',
      ONLINE_SHOPPING: 'bg-purple-100 text-purple-800',
      ENTERTAINMENT: 'bg-pink-100 text-pink-800',
      GENERAL_TRAVEL: 'bg-indigo-100 text-indigo-800',
      AIRLINE_TRAVEL: 'bg-cyan-100 text-cyan-800',
      HOTEL_TRAVEL: 'bg-teal-100 text-teal-800',
      TRANSIT: 'bg-yellow-100 text-yellow-800',
      PHARMACY: 'bg-emerald-100 text-emerald-800',
      RENT: 'bg-red-100 text-red-800',
      SELECTED_CATEGORIES: 'bg-slate-100 text-slate-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <PageLoading message="Loading rewards..." />;
  }

  return (
    <PageLayout
      title="Rewards Breakdown"
      subtitle="See how you earned your rewards this month"
      maxWidth="6xl"
    >
      {error && <div className="page-alert page-alert--error">{error}</div>}

      <div className="page-stat-banner">
        <div>
          <p className="page-stat-banner-label">Total Rewards This Month</p>
          <p className="page-stat-banner-value">{formatCurrency(getTotalRewards())}</p>
          <p className="page-stat-banner-meta">
            Based on {transactions.length} transaction
            {transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="page-stat-banner-icon">
          <DollarSign size={28} strokeWidth={2} />
        </div>
      </div>

      <div className="page-section">
        <h2 className="page-section-title">Rewards by Card</h2>

        {cardRewards.length === 0 ? (
          <div className="page-card">
            <div className="page-empty-state">
              <div className="page-empty-state-icon">
                <TrendingUp size={28} />
              </div>
              <h3>No rewards yet</h3>
              <p>Add transactions to start earning rewards!</p>
              <Link to="/transactions/add" className="page-btn page-btn-primary">
                Add Transaction
              </Link>
            </div>
          </div>
        ) : (
          <div className="page-reward-grid">
            {cardRewards.map((card) => (
              <div key={card.card_id} className="page-reward-card">
                <div className="page-reward-card-top">
                  <div>
                    <h3 className="page-reward-card-name">{card.card_name}</h3>
                    <p className="page-reward-card-issuer">{card.card_issuer}</p>
                  </div>
                  <CreditCard className="text-green-600" size={22} />
                </div>
                <div className="page-reward-card-amount">
                  <span className="page-reward-card-label">Earned This Month</span>
                  <span className="page-reward-card-value">
                    {formatCurrency(card.rewards_earned)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="page-section">
          <h2 className="page-section-title">Recent Transactions with Rewards</h2>
          <div className="page-card">
            <div className="page-data-table-wrap">
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th>Card</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'right' }}>Reward</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => {
                      const reward = getTransactionReward(transaction);
                      return (
                        <tr key={transaction.id}>
                          <td>{formatDate(transaction.created_at)}</td>
                          <td className="font-medium text-gray-900">{transaction.merchant}</td>
                          <td>
                            {transaction.card_actually_used_details?.name ||
                              transaction.recommended_card_details?.name ||
                              'N/A'}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                                transaction.category || 'OTHER'
                              )}`}
                            >
                              {formatCategoryName(transaction.category || 'OTHER')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td
                            style={{ textAlign: 'right' }}
                            className="font-semibold text-green-600"
                          >
                            +{formatCurrency(reward)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {transactions.length > 10 && (
            <p className="text-center mt-4">
              <Link to="/transactions" className="page-link">
                View All Transactions →
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="page-info-box">
        <h3>How Rewards Are Calculated</h3>
        <p>
          Your rewards are calculated based on your card&apos;s reward rates for each transaction
          category. For example, if your card offers 6% back on groceries and you spend $100 at a
          grocery store, you&apos;ll earn $6.00 in rewards.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <strong>Tip:</strong> Use cards with higher reward rates for specific categories to
          maximize your earnings!
        </p>
      </div>
    </PageLayout>
  );
};

export default RewardsBreakdown;
