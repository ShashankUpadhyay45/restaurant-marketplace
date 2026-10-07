import React, { useState } from 'react';
import { useToastStore } from '../../store/useToastStore';
import { Search, UserCog, Mail } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const MOCK_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@platform.com', role: 'admin', status: 'ACTIVE', joined: '2023-01-15' },
  { id: '2', name: 'John Doe', email: 'john@restaurant.com', role: 'owner', status: 'ACTIVE', joined: '2023-03-22' },
  { id: '3', name: 'Jane Smith', email: 'jane@customer.com', role: 'customer', status: 'ACTIVE', joined: '2023-06-10' },
  { id: '4', name: 'Mike Rider', email: 'mike@delivery.com', role: 'delivery', status: 'SUSPENDED', joined: '2023-08-05' },
  { id: '5', name: 'Sarah Owner', email: 'sarah@bistro.com', role: 'owner', status: 'ACTIVE', joined: '2023-10-12' },
  { id: '6', name: 'Tom Eater', email: 'tom@foodie.com', role: 'customer', status: 'ACTIVE', joined: '2024-01-02' },
];

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const { showToast } = useToastStore();

  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, userId: string, newRole: string}>({isOpen: false, userId: '', newRole: ''});

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast({ message: `User ${newStatus.toLowerCase()} successfully`, type: 'success' });
  };

  const handleChangeRole = (id: string, newRole: string) => {
    setConfirmDialog({ isOpen: true, userId: id, newRole });
  };

  const confirmRoleChange = () => {
    setUsers(users.map(u => u.id === confirmDialog.userId ? { ...u, role: confirmDialog.newRole } : u));
    showToast({ message: 'User role updated', type: 'success' });
    setConfirmDialog({ isOpen: false, userId: '', newRole: '' });
  };

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    owners: users.filter(u => u.role === 'owner').length,
    delivery: users.filter(u => u.role === 'delivery').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.total} />
        <StatCard title="Customers" value={stats.customers} />
        <StatCard title="Restaurant Owners" value={stats.owners} />
        <StatCard title="Delivery Riders" value={stats.delivery} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-md px-4 py-2 bg-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="OWNER">Owner</option>
          <option value="DELIVERY">Delivery</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-sm">
                <th className="py-3 px-4 font-medium">User</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Joined Date</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-1" /> {user.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.joined}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <select 
                        className="text-sm border rounded p-1"
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        disabled={user.role === 'admin'}
                      >
                        <option value="customer">Customer</option>
                        <option value="owner">Owner</option>
                        <option value="delivery">Delivery</option>
                      </select>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={user.role === 'admin'}
                        className={`text-sm font-medium ${user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                      >
                        {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Change User Role"
        message={`Are you sure you want to change this user's role to ${confirmDialog.newRole.toUpperCase()}?`}
        confirmText="Change Role"
        onClose={() => setConfirmDialog({ isOpen: false, userId: '', newRole: '' })}
        onConfirm={confirmRoleChange}
      />
    </div>
  );
};

const StatCard = ({ title, value }: { title: string, value: number }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
    </div>
    <UserCog className="w-8 h-8 text-blue-100" />
  </div>
);

export default AdminUsersPage;
