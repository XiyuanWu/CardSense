import React from 'react';
import { Link } from 'react-router-dom';

type PageMaxWidth = '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

const maxWidthClass: Record<PageMaxWidth, string> = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  maxWidth?: PageMaxWidth;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="page-shell flex items-center justify-center">
    <div className="page-card page-loading">{message}</div>
  </div>
);

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  backTo = '/dashboard',
  backLabel = 'Back to Dashboard',
  maxWidth = '3xl',
  actions,
  children,
}) => {
  return (
    <div className="page-shell">
      <div className={`${maxWidthClass[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="page-header">
          <div className="page-header-text">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <div className="page-header-actions">
            {actions}
            <Link to={backTo} className="page-back-link">
              ← {backLabel}
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
