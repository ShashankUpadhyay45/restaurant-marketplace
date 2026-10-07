import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  ShieldAlert, 
  TrendingUp, 
  Store, 
  Users, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Clock,
  DollarSign
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, rRes, lRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/restaurants'),
        api.get('/admin/audit-logs')
      ]);
      setMetrics(mRes.metrics);
      setRestaurants(rRes.restaurants || []);
      setAuditLogs(lRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/restaurants/${id}/verify`, { status });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleUpdateCommission = async (id: string, currentRate: number) => {
    const input = prompt(`Enter new commission percentage for this restaurant:`, currentRate.toString());
    if (input === null) return;
    const rate = parseFloat(input);
    if (isNaN(rate) || rate < 0 || rate > 30) {
      alert('Please enter a valid rate between 0% and 30%.');
      return;
    }
    try {
      await api.patch(`/admin/restaurants/${id}/commission`, { commissionRate: rate });
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update commission rate.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-purple-600" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600">Platform Governance & Compliance</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-stone-900 mt-1">Superadmin Headquarters</h1>
        <p className="text-xs text-stone-500 mt-1">Merchant onboarding, FSSAI verification, commission controls, and audit trails</p>
      </div>

      {isLoading ? (
        <div className="h-64 bg-stone-100 rounded-3xl animate-pulse" />
      ) : (
        <>
          {/* Platform Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Gross Merchandise Value</span>
              <h3 className="font-display text-3xl font-bold text-stone-900">
                ₹{metrics?.gmv?.toLocaleString('en-IN') || '0.00'}
              </h3>
              <p className="text-[11px] text-stone-400">Total marketplace transactions</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Platform Net Take</span>
              <h3 className="font-display text-3xl font-bold text-purple-700">
                ₹{metrics?.platformNetRevenue?.toLocaleString('en-IN') || '0.00'}
              </h3>
              <p className="text-[11px] text-stone-400">Platform fees + capped commissions</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Partner Restaurants</span>
              <h3 className="font-display text-3xl font-bold text-stone-900">
                {metrics?.totalRestaurants || 0}
              </h3>
              <p className="text-[11px] text-stone-400">{metrics?.approvedRestaurants || 0} approved & active</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-2">
              <span className="text-xs uppercase font-bold text-stone-500">Pending KYC Review</span>
              <h3 className="font-display text-3xl font-bold text-amber-600">
                {metrics?.pendingKyc || 0}
              </h3>
              <p className="text-[11px] text-stone-400">Awaiting merchant license check</p>
            </div>
          </div>

          {/* Restaurant Onboarding & Commission Controls */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display text-xl font-bold text-stone-900">Restaurant Directory & Verification Queue</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                    <th className="p-4 font-bold">Restaurant & Owner</th>
                    <th className="p-4 font-bold">Mode & Cuisine</th>
                    <th className="p-4 font-bold">FSSAI / Tax ID</th>
                    <th className="p-4 font-bold">Commission Rate</th>
                    <th className="p-4 font-bold">Verification Status</th>
                    <th className="p-4 font-bold">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {restaurants.map(rest => (
                    <tr key={rest._id} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <span className="font-bold text-stone-900 block">{rest.name}</span>
                        <span className="text-[10px] text-stone-400">Owner: {rest.ownerId?.fullName} ({rest.ownerId?.email})</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                          {rest.operatingMode}
                        </span>
                        <p className="text-[10px] text-stone-500 mt-1">{rest.cuisineTypes.join(', ')}</p>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-stone-700">
                        {rest.fssaiLicenseNumber}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-stone-900">{rest.commissionRate}%</span>
                          <button
                            onClick={() => handleUpdateCommission(rest._id, rest.commissionRate)}
                            className="p-1 text-stone-400 hover:text-stone-700"
                            title="Edit Commission"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rest.verificationStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          rest.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {rest.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {rest.verificationStatus !== 'APPROVED' && (
                            <button
                              onClick={() => handleVerify(rest._id, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {rest.verificationStatus !== 'REJECTED' && (
                            <button
                              onClick={() => handleVerify(rest._id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-display text-xl font-bold text-stone-900">Compliance & Security Audit Trail</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px]">
                    <th className="pb-3 font-bold">Action</th>
                    <th className="pb-3 font-bold">Performed By</th>
                    <th className="pb-3 font-bold">Target Resource</th>
                    <th className="pb-3 font-bold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {auditLogs.map(log => (
                    <tr key={log._id}>
                      <td className="py-3 font-bold text-purple-700">{log.action}</td>
                      <td className="py-3 text-stone-800">{log.performedBy?.fullName || 'System'} ({log.role})</td>
                      <td className="py-3 text-stone-600">{log.targetResource} ({log.targetId})</td>
                      <td className="py-3 text-stone-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

    </div>
  );
};
