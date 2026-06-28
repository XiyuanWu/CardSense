import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transaction.service';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PageLayout from '../Layout/PageLayout';

interface UploadResult {
  row: number;
  status: 'imported' | 'error';
  transaction_id?: number;
  errors?: any;
}

const CSVUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    imported_count: number;
    failed_count: number;
    results: UploadResult[];
  } | null>(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResults(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await transactionService.importCSV(file);

      if (response.success && response.data) {
        setResults(response.data);
        setFile(null);
      } else {
        setError(typeof response.error === 'string' ? response.error : response.error?.message || 'Upload failed. Please check your file format.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during upload. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'merchant,amount,category,date,card,notes',
      'Whole Foods,125.50,GROCERIES,2024-11-28,Blue Cash Preferred,Weekly grocery shopping',
      'Shell Gas Station,45.00,GAS,2024-11-27,,Card will be recommended',
      'Amazon,89.99,ONLINE_SHOPPING,2024-11-26,Premium Rewards,Electronics',
      'Chipotle,12.50,DINING,2024-11-25,,Using recommended card for dining'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="Import Transactions (CSV)"
      subtitle="Bulk upload your transaction history from a spreadsheet"
      maxWidth="4xl"
    >
      <div className="page-card">
        <div className="page-card-body">
          <div className="page-info-box">
            <h3>CSV Format Requirements</h3>
            <ul>
              <li>Required columns: merchant, amount, category</li>
              <li>Optional columns: card, date, notes</li>
              <li>Date format: YYYY-MM-DD — uses current date if not provided</li>
              <li>Card: leave blank to use the recommended card</li>
            </ul>
            <button type="button" onClick={downloadSampleCSV} className="page-link mt-3" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              Download Sample CSV
            </button>
          </div>

          {error && (
            <div className="page-alert page-alert--error flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Section */}
          {!results && (
            <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
                  dragActive
                    ? 'border-brand bg-purple-50'
                    : 'border-gray-300 hover:border-brand'
                }`}
              >
                <Upload
                  className={`mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`}
                  size={48}
                />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label className="page-btn page-btn-primary cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className="mt-6 p-4 page-list-item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="text-blue-600 mr-3" size={24} />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="page-btn page-btn-primary w-full mt-4"
                  >
                    {uploading ? 'Uploading...' : 'Upload and Import'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-green-600 mr-2" size={24} />
                    <span className="font-semibold text-green-900">Successfully Imported</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{results.imported_count}</p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <XCircle className="text-red-600 mr-2" size={24} />
                    <span className="font-semibold text-red-900">Failed</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{results.failed_count}</p>
                </div>
              </div>

              {/* Detailed Results */}
              {results.results.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Detailed Results:</h3>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {results.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 border-b last:border-b-0 ${
                          result.status === 'imported' ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            {result.status === 'imported' ? (
                              <CheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                            ) : (
                              <XCircle className="text-red-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Row {result.row}
                                {result.status === 'imported' && result.transaction_id && (
                                  <span className="text-gray-500 ml-2">
                                    (Transaction ID: {result.transaction_id})
                                  </span>
                                )}
                              </p>
                              {result.errors && (
                                <div className="mt-1 text-xs text-red-700">
                                  {JSON.stringify(result.errors)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="form-actions">
                <button type="button" onClick={() => setResults(null)} className="page-btn page-btn-primary">
                  Upload Another File
                </button>
                <Link to="/transactions" className="page-btn page-btn-secondary">
                  View Transactions
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="page-card mt-4">
        <div className="page-card-body">
          <h3 className="page-section-title">Available Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {[
              'SELECTED_CATEGORIES',
              'RENT',
              'ONLINE_SHOPPING',
              'DINING',
              'GROCERIES',
              'PHARMACY',
              'GAS',
              'GENERAL_TRAVEL',
              'AIRLINE_TRAVEL',
              'HOTEL_TRAVEL',
              'TRANSIT',
              'ENTERTAINMENT',
              'OTHER',
            ].map((cat) => (
              <code key={cat} className="px-2 py-1 bg-white rounded text-gray-700 border border-gray-200">
                {cat}
              </code>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CSVUpload;

