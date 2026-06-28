import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

interface Budget {
  id: number;
  year_month: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  thresholds: number[];
  fired_flags: number[];
}

const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getAllBudgets();
      console.log('All budgets response:', response);
      if (response.success && response.data) {
        setBudgets(response.data);
      }
    } catch (err) {
      setError('Failed to load budgets');
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (yearMonth: string) => {
    if (!window.confirm(`Are you sure you want to delete the budget for ${formatMonthName(yearMonth)}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const response = await budgetService.deleteBudget(yearMonth);
      
      if (response.success) {
        setSuccess(`Budget for ${formatMonthName(yearMonth)} deleted successfully!`);
        loadBudgets(); // Reload the list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete budget');
      }
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error deleting budget:', err);
    }
  };

  const formatMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'bg-red-500';
    if (percentUsed >= 90) return 'bg-orange-500';
    if (percentUsed >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentUsed: number) => {
    if (percentUsed >= 100) return 'Over Budget!';
    if (percentUsed >= 90) return 'Critical (90%+)';
    if (percentUsed >= 70) return 'Warning (70%+)';
    if (percentUsed >= 50) return 'On Track';
    return 'Good';
  };

  const getStatusIcon = (percentUsed: number) => {
    if (percentUsed >= 90) {
      return <AlertCircle className="text-red-600" size={24} />;
    }
    if (percentUsed >= 70) {
      return <AlertCircle className="text-orange-600" size={24} />;
    }
    return <CheckCircle className="text-green-600" size={24} />;
  };

  const isCurrentMonth = (yearMonth: string) => {
    return yearMonth === getCurrentYearMonth();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
            <p className="text-gray-600">Track your monthly spending and stay on budget</p>
          </div>
          <Link
            to="/budgets/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Budget
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <TrendingUp size={48} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No budgets yet</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Create a monthly budget to track your spending and receive alerts
              </p>
              <Link
                to="/budgets/create"
                className="inline-flex items-center justify-center px-8 py-4 text-white text-lg font-semibold rounded-lg transform hover:scale-105 transition-all shadow-lg bg-blue-600 hover:bg-blue-700"
              >
                Create Your First Budget
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition ${
                  isCurrentMonth(budget.year_month) ? 'border-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(budget.percentage_used)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {formatMonthName(budget.year_month)}
                        {isCurrentMonth(budget.year_month) && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            CURRENT
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Budget: {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(budget.spent)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(budget.remaining)} remaining
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{getStatusText(budget.percentage_used)}</span>
                    <span className="font-semibold">
                      {budget.percentage_used.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getStatusColor(
                        budget.percentage_used
                      )}`}
                      style={{
                        width: `${Math.min(budget.percentage_used, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Threshold Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Alerts at:{' '}
                    {budget.thresholds.map((t) => `${(t * 100).toFixed(0)}%`).join(', ')}
                  </div>
                  <button
                    onClick={() => handleDelete(budget.year_month)}
                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BudgetList;
