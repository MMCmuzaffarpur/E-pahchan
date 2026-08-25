import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Plus,
  Mail,
  Building,
  Lock,
} from 'lucide-react';
import { PortalUser, UserRole } from '../types';

interface UserManagementViewProps {
  users: PortalUser[];
  currentUser: PortalUser;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onAddUser: (user: Omit<PortalUser, 'id' | 'createdAt'>) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onToggleStatus,
  onDeleteUser,
  onAddUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('User');
  const [newUserDepartment, setNewUserDepartment] = useState('Data Entry & Verification');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      isActive: true,
      department: newUserDepartment,
      avatarUrl:
        newUserRole === 'Admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('User');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Portal User Management (यूजर मेनू)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {users.length} Registered Users
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            2 Type Users: Admin (Full Control) & User (Operator) &bull; Active / Deactive व Delete सुविधा
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>+ Add New User (नया यूजर जोड़ें)</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by User Name, Email, Department..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User Profile & Name</th>
                <th className="py-3.5 px-4">Role Access</th>
                <th className="py-3.5 px-4">Department / Unit</th>
                <th className="py-3.5 px-4 text-center">Account Status (सक्रिय/निष्क्रिय)</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-center">Actions (कंट्रोल)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    !user.isActive ? 'opacity-65 bg-slate-950/40' : ''
                  }`}
                >
                  {/* Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-xs">{user.name}</p>
                          {user.id === currentUser.id && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        user.role === 'Admin'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}
                    >
                      {user.role === 'Admin' ? (
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                      )}
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="py-3.5 px-4">
                    <p className="text-slate-200">{user.department || 'Administration'}</p>
                    <p className="text-[10px] text-slate-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>

                  {/* ACTIVE / DEACTIVE TOGGLE SWITCH */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      title={user.isActive ? 'Click to Deactivate' : 'Click to Activate'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        user.isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 hover:bg-emerald-900'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700/80 hover:bg-rose-900'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{user.isActive ? 'Active (सक्रिय)' : 'Deactive (निष्क्रिय)'}</span>
                    </button>
                  </td>

                  {/* Last Login */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {user.lastLogin || 'Recent'}
                  </td>

                  {/* Actions (Delete) */}
                  <td className="py-3.5 px-4 text-center">
                    {user.id !== currentUser.id ? (
                      <button
                        onClick={() => setDeleteConfirmId(user.id)}
                        title="Delete User (यूजर हटाएं)"
                        className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-semibold italic">Current Session</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Portal User</h3>
                  <p className="text-[11px] text-slate-400">नया यूजर या ऑपरेटर जोड़ें</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address (ईमेल) *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@portal.gov.in"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Permission (2 प्रकार के यूजर) *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                >
                  <option value="Admin">Admin (Full Control, User Management & Settings)</option>
                  <option value="User">User / Operator (Upload PDF & Generate ID Cards)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Section
                </label>
                <input
                  type="text"
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  placeholder="e.g. Card Verification Cell"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Delete Portal User?</h3>
            <p className="text-xs text-slate-400">
              इस यूजर का लॉगिन खाता व एक्सेस हमेशा के लिए हटा दिया जाएगा।
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const u = users.find((item) => item.id === deleteConfirmId);
                  onDeleteUser(deleteConfirmId, u?.name || 'User');
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
