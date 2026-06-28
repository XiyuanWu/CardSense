import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import PrivateRoute from './components/Layout/PrivateRoute';
import AddTransaction from './components/Transactions/AddTransaction';
import TransactionList from './components/Transactions/TransactionList';
import CSVUpload from './components/Transactions/CSVUpload';
import CreateBudget from './components/Budgets/CreateBudget';
import BudgetList from './components/Budgets/BudgetList';
import BudgetAlerts from './components/Budgets/BudgetAlerts';
import CardManagement from './components/Cards/CardManagement';
import RewardsBreakdown from './components/Rewards/RewardsBreakdown';
import Profile from './components/Profile/Profile';
import Settings from './components/Profile/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions/add"
          element={
            <PrivateRoute>
              <AddTransaction />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions/import"
          element={
            <PrivateRoute>
              <CSVUpload />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <TransactionList />
            </PrivateRoute>
          }
        />

        <Route
          path="/budgets/create"
          element={
            <PrivateRoute>
              <CreateBudget />
            </PrivateRoute>
          }
        />

        <Route
          path="/budgets"
          element={
            <PrivateRoute>
              <BudgetList />
            </PrivateRoute>
          }
        />

        <Route
          path="/budgets/alerts"
          element={
            <PrivateRoute>
              <BudgetAlerts />
            </PrivateRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <PrivateRoute>
              <RewardsBreakdown />
            </PrivateRoute>
          }
        />

        <Route
          path="/cards"
          element={
            <PrivateRoute>
              <CardManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-gray-600 mt-2">Analytics dashboard coming soon...</p>
              </div>
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

