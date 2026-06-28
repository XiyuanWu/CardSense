import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

interface BudgetAlert {
  id: number;
  year_month: string;
  threshold: number;
  spend_at_fire: number;
  fired_at: string;
  status: string;
}

const BudgetAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getAlerts();
      if (response.data) {
        setAlerts(response.data);
      }
    } catch (err) {
      setError('Failed to load alerts');
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      const response = await budgetService.acknowledgeAlert(id);
      if (response.data || response.success) {
        loadAlerts();
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const getAlertBorderClass = (threshold: number) => {
    if (threshold >= 0.9) return 'border-red-500';
    if (threshold >= 0.7) return 'border-orange-500';
    return 'border-yellow-500';
  };

  const getAlertIcon = (threshold: number) => {
    if (threshold >= 0.9) return <AlertTriangle className="text-red-600" size={22} />;
    if (threshold >= 0.7) return <AlertTriangle className="text-orange-600" size={22} />;
    return <Bell className="text-yellow-600" size={22} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <PageLoading message="Loading alerts..." />;
  }

  return (
    <PageLayout
      title="Budget Alerts"
      subtitle="View and manage your budget threshold alerts"
      maxWidth="4xl"
    >
      {error && <div className="page-alert page-alert--error">{error}</div>}

      {alerts.length === 0 ? (
        <div className="page-card">
          <div className="page-empty-state">
            <div className="page-empty-state-icon">
              <CheckCircle size={28} />
            </div>
            <h3>No budget alerts</h3>
            <p>Great job! You haven&apos;t crossed any budget thresholds yet.</p>
            <Link to="/budgets" className="page-btn page-btn-primary">
              View Budget
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`page-list-item page-list-item--alert ${getAlertBorderClass(
                alert.threshold
              )}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getAlertIcon(alert.threshold)}</div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {(alert.threshold * 100).toFixed(0)}% Budget Threshold Reached
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Month: {alert.year_month} • Triggered: {formatDate(alert.fired_at)}
                    </p>
                    <p className="text-sm text-gray-700">
                      You spent{' '}
                      <span className="font-semibold">
                        {formatCurrency(alert.spend_at_fire)}
                      </span>{' '}
                      when this alert was triggered.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === 'pending' ? (
                    <>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="page-btn page-btn-primary"
                      >
                        Acknowledge
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                      <CheckCircle size={14} />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-info-box" style={{ marginTop: '1.5rem' }}>
        <h3>About Budget Alerts</h3>
        <p>
          Budget alerts are automatically triggered when your spending crosses your custom
          thresholds (default: 50%, 70%, 90%). You can set your own threshold percentages when
          creating a budget. Acknowledging an alert helps you stay aware of your spending patterns.
        </p>
      </div>
    </PageLayout>
  );
};

export default BudgetAlerts;
