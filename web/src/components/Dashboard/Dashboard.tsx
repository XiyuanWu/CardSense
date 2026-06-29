import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';
import { alertService } from '../../services/alert.service';
import type { DashboardData, Alert } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const loadDashboard = useCallback(async () => {
    const response = await analyticsService.getDashboard();
    if (response.success && response.data) {
      setData(response.data);
    }
    setLoading(false);
  }, []);

  const loadAlerts = useCallback(async () => {
    const response = await alertService.getUnreadAlerts();
    if (response.success && response.data) {
      setAlerts(response.data);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDashboard();
    loadAlerts();
  }, [location.pathname, loadDashboard, loadAlerts]);

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-600';
    if (percentage > 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="dashboard-card text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
          Dashboard
        </h1>

        {alerts.length > 0 && (
          <div className="mb-6 flex flex-col gap-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`dashboard-card ${
                  alert.priority === 'high'
                    ? 'bg-red-100'
                    : alert.priority === 'medium'
                    ? 'bg-yellow-100'
                    : 'bg-blue-100'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-stat-grid mb-6">
          <div className="dashboard-stat-card dashboard-card">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              This Month&apos;s Spending
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data?.summary.total_spent_this_month || 0)}
            </div>
          </div>

          <Link
            to="/rewards"
            className="dashboard-stat-card dashboard-card dashboard-card--interactive"
          >
            <div className="text-sm font-semibold text-gray-900 mb-2">Rewards Earned</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.summary.total_rewards_this_month || 0)}
            </div>
            {(data?.summary.total_rewards_this_month ?? 0) > 0 && (
              <div className="text-xs text-brand mt-2">View breakdown →</div>
            )}
          </Link>

          <div className="dashboard-stat-card dashboard-card">
            <div className="text-sm font-semibold text-gray-900 mb-2">Active Budgets</div>
            <div className="text-2xl font-bold text-gray-900">
              {data?.summary.active_budgets || 0}
            </div>
          </div>

          <Link
            to="/budgets/alerts"
            className="dashboard-stat-card dashboard-card dashboard-card--interactive"
          >
            <div className="text-sm font-semibold text-gray-900 mb-2">Budget Alerts</div>
            <div className="text-2xl font-bold text-orange-600">
              {data?.summary.budget_alerts || 0}
            </div>
            {(data?.summary.budget_alerts ?? 0) > 0 && (
              <div className="text-xs text-brand mt-2">View alerts →</div>
            )}
          </Link>
        </div>

        <div className="dashboard-section-grid mb-6">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Budget Status</h2>
              <Link to="/budgets" className="text-brand hover:text-brand text-sm font-semibold">
                View all →
              </Link>
            </div>
            <div>
              {data?.budget_status && data.budget_status.length > 0 ? (
                <div className="space-y-4">
                  {data.budget_status.slice(0, 5).map((budget) => (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center mb-2 gap-4">
                      <span className="text-sm font-semibold text-gray-900 truncate min-w-0">
                        {budget.category?.name || 'Monthly Budget'}
                      </span>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount || 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="dashboard-progress-track flex-1">
                        <div
                          className={`dashboard-progress-bar ${getProgressColor(
                            budget.percentage_used || 0
                          )}`}
                          style={{
                            width: `${Math.min(budget.percentage_used || 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-900 w-10 text-right">
                        {Math.round(budget.percentage_used || 0)}%
                      </span>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-empty">
                  <p>No budget set for this month</p>
                  <Link
                    to="/budgets/create"
                    className="text-brand text-sm font-semibold inline-block"
                  >
                    Create a Budget →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Recent Transactions</h2>
              <Link
                to="/transactions"
                className="text-brand hover:text-brand text-sm font-semibold"
              >
                View all →
              </Link>
            </div>
            <div>
              {data?.recent_transactions && data.recent_transactions.length > 0 ? (
                data.recent_transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="dashboard-row">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {transaction.merchant || 'Unknown Merchant'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(transaction.created_at)} •{' '}
                        {(transaction.category || 'OTHER').replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="font-semibold text-sm text-gray-900 ml-2 whitespace-nowrap">
                      {formatCurrency(
                        typeof transaction.amount === 'string'
                          ? parseFloat(transaction.amount)
                          : transaction.amount || 0
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-empty">
                  <p>No transactions yet</p>
                  <Link
                    to="/transactions/add"
                    className="text-brand text-sm font-semibold inline-block"
                  >
                    Add a Transaction →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Quick Actions</h2>
          </div>
          <div className="dashboard-quick-grid">
            <Link to="/transactions/add" className="dashboard-quick-action">
              <div className="text-2xl mb-1">💳</div>
              <div className="font-semibold text-sm text-gray-900">Add Transaction</div>
            </Link>

            <Link to="/transactions/import" className="dashboard-quick-action">
              <div className="text-2xl mb-1">📊</div>
              <div className="font-semibold text-sm text-gray-900">Import CSV</div>
            </Link>

            <Link to="/budgets/create" className="dashboard-quick-action">
              <div className="text-2xl mb-1">💰</div>
              <div className="font-semibold text-sm text-gray-900">Create Budget</div>
            </Link>

            <Link to="/cards" className="dashboard-quick-action">
              <div className="text-2xl mb-1">🎴</div>
              <div className="font-semibold text-sm text-gray-900">Manage Cards</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
