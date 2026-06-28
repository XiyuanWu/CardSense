import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';
import PageLayout from '../Layout/PageLayout';

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

    if (formData.year_month < currentYearMonth) {
      setError('Cannot create budget for past months');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Budget amount must be greater than 0');
      return;
    }

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

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { value: yearMonth, label: monthName };
  });

  return (
    <PageLayout title="Create Budget" subtitle="Set a monthly spending limit and alert thresholds">
      <div className="page-card">
        <div className="page-card-body">
          <div className="page-info-box">
            <h3>About Monthly Budgets</h3>
            <p>
              Set a monthly spending budget and customize alert thresholds (default: 50%, 70%, 90%).
              You&apos;ll be notified when your spending crosses these thresholds to help you stay
              within your limits.
            </p>
          </div>

          {error && <div className="page-alert page-alert--error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <div className="form-field">
              <label htmlFor="year_month">Month *</label>
              <select
                id="year_month"
                name="year_month"
                value={formData.year_month}
                onChange={handleChange}
                required
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="form-field-help">Select the month for this budget</p>
            </div>

            <div className="form-field">
              <label htmlFor="amount">Budget Amount ($) *</label>
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
              />
              <p className="form-field-help">Total amount you plan to spend this month</p>
            </div>

            <div className="form-section-divider">
              <h3 className="form-section-title">Alert Thresholds</h3>
              <p className="form-field-help" style={{ marginBottom: '0.75rem' }}>
                You&apos;ll receive alerts when your spending reaches these percentages of your
                budget.
              </p>

              <div className="form-stack">
                <div className="form-field">
                  <label htmlFor="threshold1">First Alert (%)</label>
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
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="threshold2">Second Alert (%)</label>
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
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="threshold3">Third Alert (%)</label>
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
                  />
                </div>
              </div>

              <div className="form-example-box">
                <p>
                  <strong>Example:</strong> With a ${formData.amount || '1000'} budget:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
                  <li>
                    Alert at $
                    {(
                      ((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold1)) /
                      100
                    ).toFixed(2)}{' '}
                    ({formData.threshold1}%)
                  </li>
                  <li>
                    Alert at $
                    {(
                      ((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold2)) /
                      100
                    ).toFixed(2)}{' '}
                    ({formData.threshold2}%)
                  </li>
                  <li>
                    Alert at $
                    {(
                      ((parseFloat(formData.amount) || 1000) * parseFloat(formData.threshold3)) /
                      100
                    ).toFixed(2)}{' '}
                    ({formData.threshold3}%)
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="page-btn page-btn-primary">
                {loading ? 'Creating Budget...' : 'Create Budget'}
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

export default CreateBudget;
