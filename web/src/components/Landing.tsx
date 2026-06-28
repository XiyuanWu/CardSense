import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  PieChart, 
  Shield, 
  Zap, 
  DollarSign 
} from 'lucide-react';
import CardIcon from './icons/CardIcon';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <CardIcon size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CardSense</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors inline-block"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg inline-block no-underline"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6">
            Maximize Your Credit Card
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Rewards & Savings
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            CardSense helps you optimize your credit card usage, track spending, 
            and earn maximum rewards on every purchase. Smart recommendations powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl inline-block no-underline"
            >
              Start Optimizing Free
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 shadow-md hover:shadow-lg inline-block no-underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
          Everything You Need to Manage Your Cards
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <CardIcon size={28} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Smart Card Selection
            </h3>
            <p className="text-gray-600">
              Get personalized recommendations on which card to use for maximum rewards on every purchase.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Transaction Tracking
            </h3>
            <p className="text-gray-600">
              Monitor all your card transactions in one place with automatic categorization and insights.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <PieChart className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Budget Management
            </h3>
            <p className="text-gray-600">
              Set spending limits and get alerts when you're approaching your budget thresholds.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="h-7 w-7 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Rewards Optimizer
            </h3>
            <p className="text-gray-600">
              Maximize cashback and points by using the right card for each category automatically.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Real-time Analytics
            </h3>
            <p className="text-gray-600">
              Visualize your spending patterns and track your savings with beautiful, intuitive dashboards.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Bank-Level Security
            </h3>
            <p className="text-gray-600">
              Your financial data is encrypted and protected with industry-leading security standards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Saving Money?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are maximizing their credit card rewards with CardSense.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl no-underline"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <CardIcon size={24} className="text-blue-500" />
              <span className="text-xl font-bold text-white">CardSense</span>
            </div>
            <p className="text-center md:text-right">
              © 2025 CardSense. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

