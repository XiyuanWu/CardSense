import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetService } from '../../services/budget.service';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';

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
      console.log('Alerts response:', response);
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
        loadAlerts(); // Reload to update status
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const getAlertColor = (threshold: number) => {
    if (threshold >= 0.9) return 'border-red-500 bg-red-50';
    if (threshold >= 0.7) return 'border-orange-500 bg-orange-50';
    return 'border-yellow-500 bg-yellow-50';
  };

  const getAlertIcon = (threshold: number) => {
    if (threshold >= 0.9) return <AlertTriangle className="text-red-600" size={24} />;
    if (threshold >= 0.7) return <AlertTriangle className="text-orange-600" size={24} />;
    return <Bell className="text-yellow-600" size={24} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Alerts</h1>
            <p className="text-gray-600">View and manage your budget threshold alerts</p>
          </div>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={48} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No budget alerts</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Great job! You haven't crossed any budget thresholds yet.
              </p>
              <Link
                to="/budgets"
                className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                View Budget
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg border-l-4 shadow p-6 ${getAlertColor(alert.threshold)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getAlertIcon(alert.threshold)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {(alert.threshold * 100).toFixed(0)}% Budget Threshold Reached
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Month: {alert.year_month} • Triggered: {formatDate(alert.fired_at)}
                      </p>
                      <p className="text-gray-700">
                        You spent <span className="font-semibold">{formatCurrency(alert.spend_at_fire)}</span> when this alert was triggered.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {alert.status === 'pending' ? (
                      <>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Pending
                        </span>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                        >
                          Acknowledge
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center">
                        <CheckCircle size={14} className="mr-1" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">About Budget Alerts</h3>
          <p className="text-sm text-blue-800">
            Budget alerts are automatically triggered when your spending crosses your custom thresholds (default: 50%, 70%, 90%). 
            You can set your own threshold percentages when creating a budget. Acknowledging an alert helps you stay aware of your spending patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetAlerts;

