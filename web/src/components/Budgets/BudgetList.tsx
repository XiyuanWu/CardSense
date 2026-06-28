import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

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
    return <PageLoading message="Loading budgets..." />;
  }

  return (
    <PageLayout
      title="Budget Management"
      subtitle="Track your monthly spending and stay on budget"
      maxWidth="4xl"
      backTo="/dashboard"
      actions={
        <Link to="/budgets/create" className="page-btn page-btn-primary">
          Create Budget
        </Link>
      }
    >
      {success && <div className="page-alert page-alert--success">{success}</div>}
      {error && <div className="page-alert page-alert--error">{error}</div>}

      {budgets.length === 0 ? (
        <div className="page-card">
          <div className="page-empty-state">
            <div className="page-empty-state-icon" style={{ backgroundColor: '#eef2ff', color: '#5e17eb' }}>
              <TrendingUp size={28} />
            </div>
            <h3>No budgets yet</h3>
            <p>Create a monthly budget to track your spending and receive alerts</p>
            <Link to="/budgets/create" className="page-btn page-btn-primary">
              Create Your First Budget
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className={`page-list-item ${
                isCurrentMonth(budget.year_month) ? 'border-brand' : ''
              }`}
              style={
                isCurrentMonth(budget.year_month)
                  ? { borderColor: '#5e17eb', borderWidth: '2px' }
                  : undefined
              }
            >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(budget.percentage_used)}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {formatMonthName(budget.year_month)}
                        {isCurrentMonth(budget.year_month) && (
                          <span className="ml-2 text-xs text-white px-2 py-0.5 rounded" style={{ backgroundColor: '#5e17eb' }}>
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
                    type="button"
                    onClick={() => handleDelete(budget.year_month)}
                    className="page-btn page-btn-danger inline-flex items-center gap-1"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}
    </PageLayout>
  );
};

export default BudgetList;
