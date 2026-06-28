import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';

const CreateBudget: React.FC = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    year_month: currentYearMonth,
    amount: '',
    threshold1: '50',
    threshold2: '70',
    threshold3: '90',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prevent creating budgets for past months
    if (formData.year_month < currentYearMonth) {
      setError('Cannot create budget for past months');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Budget amount must be greater than 0');
      return;
    }

    // Validate thresholds
    const t1 = parseFloat(formData.threshold1) / 100;
    const t2 = parseFloat(formData.threshold2) / 100;
    const t3 = parseFloat(formData.threshold3) / 100;

    if (t1 <= 0 || t1 > 1 || t2 <= 0 || t2 > 1 || t3 <= 0 || t3 > 1) {
      setError('Thresholds must be between 1 and 100');
      return;
    }

    if (t1 >= t2 || t2 >= t3) {
      setError('Thresholds must be in increasing order');
      return;
    }

    setLoading(true);

    try {
      const response = await budgetService.createBudget({
        year_month: formData.year_month,
        amount: parseFloat(formData.amount),
        thresholds: [t1, t2, t3],
      });

      if (response.success) {
        navigate('/budgets');
      } else {
        setError(response.error?.message || 'Failed to create budget');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Generate month options (current month + next 11 months) - no past months allowed
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { value: yearMonth, label: monthName };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Budget</h1>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">About Monthly Budgets</h3>
            <p className="text-sm text-blue-800">
              Set a monthly spending budget and customize alert thresholds (default: 50%, 70%, 90%). 
              You'll be notified when your spending crosses these thresholds to help you stay within your limits.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="year_month" className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <select
                id="year_month"
                name="year_month"
                value={formData.year_month}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the month for this budget
              </p>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount ($) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                placeholder="1000.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Total amount you plan to spend this month
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
              <p className="text-sm text-gray-600 mb-4">
                You'll receive alerts when your spending reaches these percentages of your budget.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="threshold1" className="block text-sm font-medium text-gray-700 mb-1">
                    First Alert (%)
                  </label>
                  <input
                    type="number"
                    id="threshold1"
                    name="threshold1"
                    value={formData.threshold1}
                    onChange={handleChange}
                    required
                    min="1"
                    max="99"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="threshold2" className="block text-sm font-medium text-gray-700 mb-1">
                    Second Alert (%)
                  </label>
                  <input
                    type="number"
                    id="threshold2"
                    name="threshold2"
                    value={formData.threshold2}
                    onChange={handleChange}
                    required
                    min="1"
                    max="99"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="threshold3" className="block text-sm font-medium text-gray-700 mb-1">
                    Third Alert (%)
                  </label>
                  <input
                    type="number"
                    id="threshold3"
                    name="threshold3"
                    value={formData.threshold3}
                    onChange={handleChange}
                    required
                    min="1"
                    max="99"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Example:</strong> With a ${formData.amount || '1000'} budget:
                </p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>
                    Alert at ${((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold1) / 100).toFixed(2)} 
                    ({formData.threshold1}%)
                  </li>
                  <li>
                    Alert at ${((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold2) / 100).toFixed(2)}
                    ({formData.threshold2}%)
                  </li>
                  <li>
                    Alert at ${((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold3) / 100).toFixed(2)}
                    ({formData.threshold3}%)
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? 'Creating Budget...' : 'Create Budget'}
              </button>
              <Link
                to="/dashboard"
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBudget;

