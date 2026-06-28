import React, { useState } from 'react';
import { authService } from '../../services/auth.service';

interface ToggleRowProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ title, description, enabled, onToggle }) => (
  <div className="settings-row">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`toggle-switch ${enabled ? 'toggle-switch--on' : ''}`}
    >
      <span className="toggle-switch-knob" />
    </button>
  </div>
);

const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    budget_alerts: true,
    transaction_alerts: false,
    weekly_summary: true,
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
    setMessage({ type: 'success', text: 'Notification preferences updated!' });

    setTimeout(() => setMessage(null), 3000);
  };

  const handlePasswordReset = async () => {
    const user = authService.getCurrentUser();
    if (user?.email) {
      try {
        await authService.requestPasswordReset(user.email);
        setMessage({
          type: 'success',
          text: 'Password reset link has been sent to your email!',
        });
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to send password reset email. Please try again.',
        });
      }
    }
  };

  return (
    <div className="page-shell">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="page-card mb-6">
          <div className="page-card-header">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="page-card-subtitle text-sm text-gray-500">
              Manage how you receive notifications and alerts
            </p>
          </div>
          <div className="page-card-body settings-list">
            <ToggleRow
              title="Email Alerts"
              description="Receive important updates via email"
              enabled={notifications.email_alerts}
              onToggle={() => handleNotificationToggle('email_alerts')}
            />
            <ToggleRow
              title="Budget Alerts"
              description="Get notified when approaching budget limits"
              enabled={notifications.budget_alerts}
              onToggle={() => handleNotificationToggle('budget_alerts')}
            />
            <ToggleRow
              title="Transaction Alerts"
              description="Receive notifications for each transaction"
              enabled={notifications.transaction_alerts}
              onToggle={() => handleNotificationToggle('transaction_alerts')}
            />
            <ToggleRow
              title="Weekly Summary"
              description="Get a weekly summary of your spending"
              enabled={notifications.weekly_summary}
              onToggle={() => handleNotificationToggle('weekly_summary')}
            />
          </div>
        </div>

        <div className="page-card mb-6">
          <div className="page-card-header">
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            <p className="page-card-subtitle text-sm text-gray-500">
              Manage your password and security settings
            </p>
          </div>
          <div className="page-card-body">
            <div className="settings-row">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Change your password</p>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="page-btn page-btn-primary"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        <div className="page-card">
          <div className="page-card-header">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            <p className="page-card-subtitle text-sm text-gray-500">Customize your CardSense experience</p>
          </div>
          <div className="page-card-body form-stack">
            <div className="form-field">
              <label htmlFor="currency">Currency</label>
              <select id="currency" defaultValue="USD">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="timezone">Timezone</label>
              <select id="timezone" defaultValue="America/New_York">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="date-format">Date Format</label>
              <select id="date-format" defaultValue="MM/DD/YYYY">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="page-card page-card-danger mt-6">
          <div className="page-card-header page-card-header-danger">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            <p className="page-card-subtitle text-sm text-red-700">Irreversible and destructive actions</p>
          </div>
          <div className="page-card-body">
            <div className="settings-row">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('Account deletion would be implemented here')}
                className="page-btn page-btn-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
