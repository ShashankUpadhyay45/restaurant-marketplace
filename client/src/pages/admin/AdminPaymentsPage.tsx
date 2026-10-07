import React, { useState } from 'react';
import { CreditCard, IndianRupee, ArrowDownRight, ArrowUpRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

const mockTransactions = [
  { id: 'TXN-001', type: 'PAYMENT', amount: 1250, status: 'SUCCESS', restaurant: 'Spice Symphony', date: '2026-09-29T10:30:00Z' },
  { id: 'TXN-002', type: 'REFUND', amount: 450, status: 'PENDING', restaurant: 'Burger Joint', date: '2026-09-29T11:15:00Z' },
  { id: 'TXN-003', type: 'PAYMENT', amount: 890, status: 'FAILED', restaurant: 'Pasta Place', date: '2026-09-29T11:45:00Z' },
  { id: 'TXN-004', type: 'PAYMENT', amount: 2100, status: 'SUCCESS', restaurant: 'Sushi Master', date: '2026-09-29T12:00:00Z' },
  { id: 'TXN-005', type: 'REFUND', amount: 320, status: 'SUCCESS', restaurant: 'Spice Symphony', date: '2026-09-29T12:30:00Z' },
];

export const AdminPaymentsPage: React.FC = () => {
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);

  const handleProcessRefund = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast({ message: 'Refund gateway integration pending.', type: 'info' });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Refunds</h1>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Integration Pending:</strong> This dashboard will connect to Razorpay/Cashfree in the next phase. Currently displaying mock data.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions Today</h3>
            <IndianRupee className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">₹45,230</div>
          <p className="text-xs text-green-600 flex items-center mt-1">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from yesterday
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Pending Refunds</h3>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <p className="text-xs text-gray-500 mt-1">Amounting to ₹4,250</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Completed Refunds</h3>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">48</div>
          <p className="text-xs text-gray-500 mt-1">This week</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500">Failed Payments</h3>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <p className="text-xs text-red-600 flex items-center mt-1">
            <ArrowDownRight className="h-3 w-3 mr-1" /> -2% from yesterday
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTransactions.map((txn) => (
              <tr key={txn.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    txn.type === 'PAYMENT' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {txn.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{txn.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{txn.restaurant}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center text-sm ${
                    txn.status === 'SUCCESS' ? 'text-green-600' :
                    txn.status === 'PENDING' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {txn.status === 'SUCCESS' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {txn.status === 'PENDING' && <Clock className="w-4 h-4 mr-1" />}
                    {txn.status === 'FAILED' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {txn.type === 'REFUND' && txn.status === 'PENDING' && (
                    <button 
                      onClick={handleProcessRefund}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Process
                    </button>
                  )}
                  {txn.status === 'SUCCESS' && (
                    <button className="text-gray-400 hover:text-gray-600">Receipt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
