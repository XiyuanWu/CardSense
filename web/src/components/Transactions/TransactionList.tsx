import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transaction.service';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Trash2, Calendar, DollarSign, Upload, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import PageLayout, { PageLoading } from '../Layout/PageLayout';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions();
      console.log('Transactions API response:', response);
      if (response.success && response.data) {
        console.log('Transaction data:', response.data);
        console.log('Number of transactions:', response.data.length);
        // Backend returns category as a string, not an object
        setTransactions(response.data as any);
      } else {
        console.error('Response not successful or no data:', response);
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.success) {
        loadTransactions(); // Reload list
      } else {
        setError('Failed to delete transaction');
      }
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'GROCERIES': 'bg-green-100 text-green-800',
      'DINING': 'bg-orange-100 text-orange-800',
      'GAS': 'bg-blue-100 text-blue-800',
      'ONLINE_SHOPPING': 'bg-purple-100 text-purple-800',
      'ENTERTAINMENT': 'bg-pink-100 text-pink-800',
      'GENERAL_TRAVEL': 'bg-indigo-100 text-indigo-800',
      'AIRLINE_TRAVEL': 'bg-cyan-100 text-cyan-800',
      'HOTEL_TRAVEL': 'bg-teal-100 text-teal-800',
      'TRANSIT': 'bg-yellow-100 text-yellow-800',
      'PHARMACY': 'bg-emerald-100 text-emerald-800',
      'RENT': 'bg-red-100 text-red-800',
      'SELECTED_CATEGORIES': 'bg-slate-100 text-slate-800',
      'OTHER': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatCategoryName = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return <PageLoading message="Loading transactions..." />;
  }

  return (
    <PageLayout
      title="All Transactions"
      subtitle="View and manage your transaction history"
      maxWidth="6xl"
      actions={
        <div className="page-header-btn-group">
          <Link to="/transactions/import" className="page-btn page-btn-secondary">
            Import CSV
          </Link>
          <Link to="/transactions/add" className="page-btn page-btn-primary">
            Add Transaction
          </Link>
        </div>
      }
    >
      {error && <div className="page-alert page-alert--error">{error}</div>}

      {transactions.length === 0 ? (
        <div className="page-card">
          <div className="page-empty-state">
            <div className="page-empty-state-icon" style={{ backgroundColor: '#eef2ff', color: '#5e17eb' }}>
              <DollarSign size={28} />
            </div>
            <h3>No transactions yet</h3>
            <p>Start tracking your spending by adding transactions or importing from a CSV file</p>
            <div className="page-header-btn-group" style={{ justifyContent: 'center' }}>
              <Link to="/transactions/add" className="page-btn page-btn-primary inline-flex items-center gap-2">
                <Plus size={16} />
                Add Transaction
              </Link>
              <Link to="/transactions/import" className="page-btn page-btn-secondary inline-flex items-center gap-2">
                <Upload size={16} />
                Import CSV
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200">
              Tip: You can bulk import transactions using a CSV file to save time
            </p>
          </div>
        </div>
      ) : (
        <div className="page-card">
          <div className="page-data-table-wrap">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Optimization
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {formatDate(transaction.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.merchant}</div>
                        {transaction.notes && (
                          <div className="text-xs text-gray-500 mt-1">{transaction.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor((transaction as any).category || 'OTHER')}`}>
                          {formatCategoryName((transaction as any).category || 'OTHER')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {transaction.card_actually_used_details ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{transaction.card_actually_used_details.name}</div>
                            <div className="text-xs text-gray-500">{transaction.card_actually_used_details.issuer}</div>
                          </div>
                        ) : transaction.recommended_card_details ? (
                          <div className="text-sm">
                            <div className="font-medium text-green-700 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13 10V3L4 14h7v7l9-11h-7z" clipRule="evenodd" />
                              </svg>
                              {transaction.recommended_card_details.name}
                            </div>
                            <div className="text-xs text-green-600">Recommended</div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No card</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {(transaction as any).used_optimal_card ? (
                          <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle size={14} className="mr-1" />
                            Optimized
                          </div>
                        ) : !transaction.card_actually_used ? (
                          <div className="text-sm">
                            <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mb-1">
                              <AlertTriangle size={14} className="mr-1" />
                              No Card Used
                            </div>
                            {transaction.recommended_card_details && Number((transaction as any).missed_reward) > 0 && (
                              <div className="text-xs text-gray-500">
                                Could earn ${Number((transaction as any).missed_reward).toFixed(2)} with {transaction.recommended_card_details.name}
                              </div>
                            )}
                          </div>
                        ) : (transaction as any).missed_reward != null && Number((transaction as any).missed_reward) > 0 ? (
                          <div className="text-sm">
                            <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium mb-1">
                              <AlertTriangle size={14} className="mr-1" />
                              Missed ${Number((transaction as any).missed_reward).toFixed(2)}
                            </div>
                            {transaction.recommended_card_details && (
                              <div className="text-xs text-gray-500">
                                Should use {transaction.recommended_card_details.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">—</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right font-semibold text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {formatCurrency(
                        transactions.reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount), 0)
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="text-green-600">{transactions.filter((t: any) => t.used_optimal_card).length} optimized</div>
                        <div className="text-yellow-600">{transactions.filter((t: any) => !t.card_actually_used).length} no card</div>
                        <div className="text-red-600">{transactions.filter((t: any) => t.card_actually_used && !t.used_optimal_card).length} suboptimal</div>
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default TransactionList;

