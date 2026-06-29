import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import CardIcon from '../icons/CardIcon';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', match: (path: string) => path === '/dashboard' || path === '/rewards' },
  { to: '/transactions', label: 'Transactions', match: (path: string) => path.startsWith('/transactions') },
  { to: '/budgets', label: 'Budgets', match: (path: string) => path.startsWith('/budgets') },
  { to: '/cards', label: 'Cards', match: (path: string) => path.startsWith('/cards') },
  { to: '/analytics', label: 'Analytics', match: (path: string) => path.startsWith('/analytics') },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
              <CardIcon size={32} className="text-brand" />
              <span className="text-2xl font-bold text-brand">CardSense</span>
            </Link>

            <div className="hidden md:flex ml-10 space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-main-link ${
                    item.match(location.pathname) ? 'nav-main-link--active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
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

