import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import { alertService } from '../../services/alert.service';
import type { DashboardData, Alert } from '../../types';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadAlerts();
  }, []);

  const loadDashboard = async () => {
    const response = await analyticsService.getDashboard();
    if (response.success && response.data) {
      setData(response.data);
    }
    setLoading(false);
  };

  const loadAlerts = async () => {
    const response = await alertService.getUnreadAlerts();
    if (response.success && response.data) {
      setAlerts(response.data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg mb-2 ${
                  alert.priority === 'high'
                    ? 'bg-red-100 border border-red-400'
                    : alert.priority === 'medium'
                    ? 'bg-yellow-100 border border-yellow-400'
                    : 'bg-blue-100 border border-blue-400'
                }`}
              >
                <h3 className="font-semibold">{alert.title}</h3>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">This Month's Spending</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(data?.summary.total_spent_this_month || 0)}
            </div>
          </div>

          <Link to="/rewards" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="text-sm text-gray-600 mb-2">Rewards Earned</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.summary.total_rewards_this_month || 0)}
            </div>
            {(data?.summary.total_rewards_this_month ?? 0) > 0 && (
              <div className="text-xs text-blue-600 mt-2">Click to view →</div>
            )}
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Active Budgets</div>
            <div className="text-2xl font-bold text-blue-600">
              {data?.summary.active_budgets || 0}
            </div>
          </div>

          <Link to="/budgets/alerts" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="text-sm text-gray-600 mb-2">Budget Alerts</div>
            <div className="text-2xl font-bold text-orange-600">
              {data?.summary.budget_alerts || 0}
            </div>
            {(data?.summary.budget_alerts ?? 0) > 0 && (
              <div className="text-xs text-blue-600 mt-2">Click to view →</div>
            )}
          </Link>
        </div>

        {/* Budget Status & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Budget Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Budget Status</h2>
              <Link to="/budgets" className="text-blue-600 hover:text-blue-800 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {data?.budget_status && data.budget_status.length > 0 ? (
                data.budget_status.slice(0, 5).map((budget) => (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {budget.category?.name || 'Monthly Budget'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (budget.percentage_used || 0) > 100
                            ? 'bg-red-600'
                            : (budget.percentage_used || 0) > 80
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((budget.percentage_used || 0), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No budget set for this month</p>
                  <Link to="/budgets/create" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                    Create a Budget →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <Link to="/transactions" className="text-blue-600 hover:text-blue-800 text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {data?.recent_transactions && data.recent_transactions.length > 0 ? (
                data.recent_transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {transaction.merchant || 'Unknown Merchant'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(transaction.created_at)} • {(transaction.category || 'OTHER').replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 ml-4">
                      {formatCurrency(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : (transaction.amount || 0))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions yet</p>
                  <Link to="/transactions/add" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                    Add a Transaction →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/transactions/add"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">💳</div>
              <div className="font-medium text-gray-900">Add Transaction</div>
            </Link>

            <Link
              to="/transactions/import"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Import CSV</div>
            </Link>

            <Link
              to="/budgets/create"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="font-medium text-gray-900">Create Budget</div>
            </Link>

            <Link
              to="/cards"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">🎴</div>
              <div className="font-medium text-gray-900">Manage Cards</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

