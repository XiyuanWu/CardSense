import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth.service';
import { User } from '../../types';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const currentUser = (await authService.fetchCurrentUser()) || authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        email: currentUser.email,
      });
    }
  };

  const formatMemberDate = (dateValue?: string) => {
    if (!dateValue) return '—';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await authService.updateProfile(formData);
      if (response.success && response.data) {
        // Update local storage with new user data
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating your profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your personal information</p>
          </div>

          <div className="page-card">
            <div className="page-card-header">
              <div className="profile-header">
                <div className="profile-header-main">
                  <div className="profile-avatar-lg">
                    {user.first_name?.[0] || 'U'}
                    {user.last_name?.[0] || ''}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="page-btn page-btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="page-card-body">
              {message && (
                <div
                  className={`mb-4 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="form-stack">
                  <div className="form-field">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="page-btn page-btn-primary flex-1"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="page-btn page-btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="profile-field-grid">
                    <div className="profile-detail-field">
                      <p className="profile-detail-label">First Name</p>
                      <p className="profile-detail-value">{user.first_name}</p>
                    </div>
                    <div className="profile-detail-field">
                      <p className="profile-detail-label">Last Name</p>
                      <p className="profile-detail-value">{user.last_name}</p>
                    </div>
                  </div>

                  <div className="profile-detail-field">
                    <p className="profile-detail-label">Email Address</p>
                    <p className="profile-detail-value">{user.email}</p>
                  </div>

                  <div className="profile-detail-field">
                    <p className="profile-detail-label">Member Since</p>
                    <p className="profile-detail-value">
                      {formatMemberDate(user.date_joined || user.created_at)}
                    </p>
                  </div>

                  {user.last_login && (
                    <div className="profile-detail-field">
                      <p className="profile-detail-label">Last Login</p>
                      <p className="profile-detail-value">
                        {formatMemberDate(user.last_login)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Profile;

