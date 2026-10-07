import React, { useEffect, useState } from 'react';
import { getMockDatabase, saveMockDatabase } from '../../data/mockData';
import { AdminKYCApplication } from '../../types';
import { useToastStore } from '../../store/useToastStore';
import { FileText, Check, X, FileEdit } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<AdminKYCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToastStore();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    appId: string;
    action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
    reason: string;
  }>({ isOpen: false, appId: '', action: 'APPROVED', reason: '' });

  useEffect(() => {
    const loadData = () => {
      const db = getMockDatabase();
      setApplications(db.applications || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleUpdateStatus = (appId: string, status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', reason?: string) => {
    const db = getMockDatabase();
    const updatedApps = (db.applications || []).map(app => 
      app._id === appId ? { ...app, status, adminNotes: reason || app.adminNotes } : app
    );
    db.applications = updatedApps;
    saveMockDatabase(db);
    setApplications(updatedApps);
    showToast({ message: `Application status updated to ${status}`, type: status === 'APPROVED' ? 'success' : 'info' });
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const queueStats = {
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    changes: applications.filter(a => a.status === 'CHANGES_REQUESTED').length,
  };

  if (loading) return <div className="p-6">Loading applications...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">KYC Applications</h1>

      <div className="flex gap-4">
        <Badge label="Pending" count={queueStats.pending} color="bg-yellow-100 text-yellow-800" />
        <Badge label="Changes Requested" count={queueStats.changes} color="bg-orange-100 text-orange-800" />
        <Badge label="Approved" count={queueStats.approved} color="bg-green-100 text-green-800" />
        <Badge label="Rejected" count={queueStats.rejected} color="bg-red-100 text-red-800" />
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={FileText} title="No applications found" description="There are no pending KYC applications to review." />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">Business Details</th>
                <th className="py-3 px-4 font-medium">FSSAI / GSTIN</th>
                <th className="py-3 px-4 font-medium">Submitted</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <React.Fragment key={app._id}>
                  <tr className={`border-b hover:bg-gray-50 ${expandedId === app._id ? 'bg-gray-50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{app.restaurantName}</div>
                      <div className="text-xs text-gray-500">Owner: {app.ownerName} ({app.city})</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <div>FSSAI: {app.fssaiLicenseNumber}</div>
                      <div>GSTIN: {app.gstinNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedId === app._id ? 'Collapse' : 'Review'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === app._id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan={5} className="p-4">
                        <div className="bg-white p-4 rounded border grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                            <ul className="space-y-2 text-sm text-blue-600">
                              <li><a href="#" className="hover:underline flex items-center"><FileText className="w-4 h-4 mr-2" /> PAN Card</a></li>
                              <li><a href="#" className="hover:underline flex items-center"><FileText className="w-4 h-4 mr-2" /> FSSAI License</a></li>
                              <li><a href="#" className="hover:underline flex items-center"><FileText className="w-4 h-4 mr-2" /> GST Certificate</a></li>
                              <li><a href="#" className="hover:underline flex items-center"><FileText className="w-4 h-4 mr-2" /> Cancelled Cheque</a></li>
                            </ul>
                          </div>
                          <div className="flex flex-col justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Admin Actions</h4>
                              {app.status !== 'PENDING' && (
                                <p className="text-sm text-gray-600 mb-4">Current Status: <strong>{app.status}</strong></p>
                              )}
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <button 
                                onClick={() => setConfirmDialog({ isOpen: true, appId: app._id, action: 'APPROVED', reason: '' })}
                                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 flex items-center justify-center"
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </button>
                              <button 
                                onClick={() => setConfirmDialog({ isOpen: true, appId: app._id, action: 'CHANGES_REQUESTED', reason: '' })}
                                className="flex-1 bg-orange-500 text-white py-2 px-3 rounded text-sm font-medium hover:bg-orange-600 flex items-center justify-center"
                              >
                                <FileEdit className="w-4 h-4 mr-1" /> Request Changes
                              </button>
                              <button 
                                onClick={() => setConfirmDialog({ isOpen: true, appId: app._id, action: 'REJECTED', reason: '' })}
                                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 flex items-center justify-center"
                              >
                                <X className="w-4 h-4 mr-1" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={`Confirm Action: ${confirmDialog.action}`}
        message={`Are you sure you want to mark this application as ${confirmDialog.action}?`}
        confirmText="Confirm"
        isDestructive={confirmDialog.action === 'REJECTED'}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => handleUpdateStatus(confirmDialog.appId, confirmDialog.action, 'Action applied by admin')}
      />
    </div>
  );
};

const Badge = ({ label, count, color }: { label: string, count: number, color: string }) => (
  <div className={`px-4 py-2 rounded-lg ${color} flex items-center space-x-2 shadow-sm`}>
    <span className="font-medium text-sm">{label}</span>
    <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    APPROVED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    CHANGES_REQUESTED: 'bg-orange-100 text-orange-800'
  }[status] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles}`}>{status}</span>;
};

export default AdminApplicationsPage;
