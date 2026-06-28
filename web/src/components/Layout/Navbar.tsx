import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import CardIcon from '../icons/CardIcon';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <CardIcon size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">CardSense</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
              >
                Transactions
              </Link>
              <Link
                to="/budgets"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
              >
                Budgets
              </Link>
              <Link
                to="/cards"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
              >
                Cards
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
              >
                Analytics
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative nav-user-menu" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="nav-user-trigger flex items-center space-x-2 text-gray-700"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="nav-user-avatar">
                  {user?.first_name?.[0] || 'D'}
                  {user?.last_name?.[0] || 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.first_name || 'Demo'} {user?.last_name || 'User'}
                </span>
              </button>

              {showUserMenu && (
                <div className="nav-user-dropdown">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="nav-user-menu-item"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="nav-user-menu-item"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-user-menu-item nav-user-menu-item--logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

