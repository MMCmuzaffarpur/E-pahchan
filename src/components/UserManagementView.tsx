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
  X,
  Lock,
  Eye,
  EyeOff,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  Building,
} from 'lucide-react';
import { PortalUser, UserRole, EmployeeRecord } from '../types';

interface UserManagementViewProps {
  users: PortalUser[];
  currentUser: PortalUser;
  employees: EmployeeRecord[];
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
  onAddUser: (user: Omit<PortalUser, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, updates: Partial<PortalUser>) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  employees,
  onToggleStatus,
  onDeleteUser,
  onAddUser,
  onUpdateUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Add User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('User123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('User');
  const [newUserDepartment, setNewUserDepartment] = useState('Data Entry & Verification');
  const [newUserAuthorizeAll, setNewUserAuthorizeAll] = useState(false);
  const [newUserSelectedEmpIds, setNewUserSelectedEmpIds] = useState<string[]>([]);
  const [addModalEmpSearch, setAddModalEmpSearch] = useState('');

  // Edit User Form State
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('User');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [editUserAuthorizeAll, setEditUserAuthorizeAll] = useState(true);
  const [editUserSelectedEmpIds, setEditUserSelectedEmpIds] = useState<string[]>([]);
  const [editModalEmpSearch, setEditModalEmpSearch] = useState('');

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('User123');
    setNewUserRole('User');
    setNewUserDepartment('Card Verification Cell');
    setNewUserAuthorizeAll(false);
    // Pre-select first employee if available as sample
    setNewUserSelectedEmpIds(employees.length > 0 ? [employees[0].id] : []);
    setAddModalEmpSearch('');
    setIsAddModalOpen(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const isAll = newUserRole === 'Admin' ? true : newUserAuthorizeAll;

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || (newUserRole === 'Admin' ? 'Admin123' : 'User123'),
      role: newUserRole,
      isActive: true,
      department: newUserDepartment,
      authorizeAll: isAll,
      authorizedEmployeeIds: isAll ? [] : newUserSelectedEmpIds,
      avatarUrl:
        newUserRole === 'Admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    });

    setIsAddModalOpen(false);
  };

  const openEditModal = (user: PortalUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword(user.password || (user.role === 'Admin' ? 'Admin123' : 'User123'));
    setEditUserRole(user.role);
    setEditUserDepartment(user.department || '');
    setEditUserAuthorizeAll(user.role === 'Admin' ? true : (user.authorizeAll ?? false));
    setEditUserSelectedEmpIds(user.authorizedEmployeeIds || []);
    setEditModalEmpSearch('');
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const isAll = editUserRole === 'Admin' ? true : editUserAuthorizeAll;

    onUpdateUser(editingUser.id, {
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      password: editUserPassword.trim(),
      role: editUserRole,
      department: editUserDepartment,
      authorizeAll: isAll,
      authorizedEmployeeIds: isAll ? [] : editUserSelectedEmpIds,
    });

    setEditingUser(null);
  };

  const toggleEmpSelectionForAdd = (id: string) => {
    setNewUserSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleEmpSelectionForEdit = (id: string) => {
    setEditUserSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Portal User Management (यूजर मेनू & ऑथराइजेशन)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {users.length} Registered Users
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Admin (Full Control) एवं User (Operator) &bull; हर यूजर को केवल निर्धारित Employee ID Card देखने का अधिकार दें
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          <span>+ Create New User (नया यूजर बनाएं)</span>
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
                <th className="py-3.5 px-4">User Profile & Login</th>
                <th className="py-3.5 px-4">Role Access</th>
                <th className="py-3.5 px-4">Password (पासवर्ड)</th>
                <th className="py-3.5 px-4">Authorized Employee Cards (कार्ड अधिकार)</th>
                <th className="py-3.5 px-4 text-center">Status (सक्रिय/निष्क्रिय)</th>
                <th className="py-3.5 px-4 text-center">Actions (कंट्रोल)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => {
                const pass = user.password || (user.role === 'Admin' ? 'Admin123' : 'User123');
                const isPassVisible = !!revealedPasswords[user.id];
                const isFullAccess = user.role === 'Admin' || user.authorizeAll !== false;
                const authCount = user.authorizedEmployeeIds ? user.authorizedEmployeeIds.length : 0;

                return (
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
                          src={
                            user.avatarUrl ||
                            (user.role === 'Admin'
                              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80')
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white text-xs">{user.name}</p>
                            {user.id === currentUser.id && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                                You (लॉगिन सत्र)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                          <p className="text-[10px] text-slate-500">{user.department || 'Administration'}</p>
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

                    {/* Password */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-200 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {isPassVisible ? pass : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(user.id)}
                          className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title="Show/Hide Password"
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Authorized Employees Permission */}
                    <td className="py-3.5 px-4">
                      {isFullAccess ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            ★ All Employees ({employees.length} Cards)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                            🔒 {authCount} Authorized Cards
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            {user.authorizedEmployeeIds && user.authorizedEmployeeIds.length > 0 ? (
                              employees
                                .filter((e) => user.authorizedEmployeeIds?.includes(e.id))
                                .map((e) => e.name)
                                .join(', ')
                            ) : (
                              <span className="text-rose-400 italic">No employee assigned</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status Switch */}
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

                    {/* Actions: Edit Permissions & Delete */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit Permissions & Authorizations"
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Permissions</span>
                        </button>

                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            title="Delete User"
                            className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ADD NEW USER MODAL (With Employee Permissions Matrix) */}
      {/* ---------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create New Portal User (नया यूजर जोड़ें)</h3>
                  <p className="text-xs text-slate-400">Set Login credentials & Assign Employee ID Card Authorizations</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name (पूरा नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Operator"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / Email (लॉगिन ईमेल/आईडी) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. operator1@portal.gov.in"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Login Password (पासवर्ड) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="e.g. User123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Permission (रोल) *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="User">User / Operator (Restricted to Authorized Employees)</option>
                    <option value="Admin">Admin (Full Control, Uploads & All Employees)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Unit Name
                </label>
                <input
                  type="text"
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  placeholder="e.g. Muzaffarpur Card Verification Cell"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>

              {/* ---------------------------------------------------- */}
              {/* EMPLOYEE AUTHORIZATION MATRIX (KEY REQUIREMENT) */}
              {/* ---------------------------------------------------- */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Employee Card Authorization (इस यूजर को कौन से Employees का कार्ड दिखेगा?)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      User लॉगिन करने पर सिर्फ ऑथराइज्ड एम्प्लॉई का कार्ड व डेटा ही प्रदर्शित होगा।
                    </p>
                  </div>

                  {newUserRole !== 'Admin' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUserSelectedEmpIds(employees.map((e) => e.id))}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      >
                        Select All ({employees.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserSelectedEmpIds([])}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {newUserRole === 'Admin' ? (
                  <div className="p-3 bg-blue-950/50 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Admin users automatically have authorization to view and manage <b>all employee cards</b>.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Authorization Scope Radio */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                        newUserAuthorizeAll
                          ? 'bg-blue-950/60 border-blue-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="authScope"
                          checked={newUserAuthorizeAll}
                          onChange={() => setNewUserAuthorizeAll(true)}
                          className="text-blue-600"
                        />
                        <span className="font-semibold">All Employees (सभी कार्ड दिखाएं)</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                        !newUserAuthorizeAll
                          ? 'bg-indigo-950/60 border-indigo-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="authScope"
                          checked={!newUserAuthorizeAll}
                          onChange={() => setNewUserAuthorizeAll(false)}
                          className="text-indigo-600"
                        />
                        <span className="font-semibold">Selected Only ({newUserSelectedEmpIds.length} Chune Gaye)</span>
                      </label>
                    </div>

                    {!newUserAuthorizeAll && (
                      <div className="space-y-2 mt-2">
                        <input
                          type="text"
                          value={addModalEmpSearch}
                          onChange={(e) => setAddModalEmpSearch(e.target.value)}
                          placeholder="Search employee by Name, IP/Insurance No..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                        />

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
                          {employees
                            .filter(
                              (emp) =>
                                emp.name.toLowerCase().includes(addModalEmpSearch.toLowerCase()) ||
                                emp.insuranceNo.includes(addModalEmpSearch) ||
                                emp.employerName.toLowerCase().includes(addModalEmpSearch.toLowerCase())
                            )
                            .map((emp) => {
                              const isChecked = newUserSelectedEmpIds.includes(emp.id);
                              return (
                                <div
                                  key={emp.id}
                                  onClick={() => toggleEmpSelectionForAdd(emp.id)}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-indigo-950/60 border border-indigo-800/80 text-white'
                                      : 'bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="text-indigo-400">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-600" />
                                      )}
                                    </div>
                                    <img
                                      src={emp.employeePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                      alt={emp.name}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                    />
                                    <div>
                                      <p className="text-xs font-bold">{emp.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        IP: {emp.insuranceNo} &bull; {emp.employerName}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {emp.city || 'Bihar'}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  Save & Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT USER PERMISSIONS & AUTHORIZATION MODAL */}
      {/* ---------------------------------------------------- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Edit User Authorizations: {editingUser.name}
                  </h3>
                  <p className="text-xs text-slate-400">Update Password, Role & Allowed Employee ID Cards</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name (पूरा नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password (पासवर्ड) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserPassword}
                    onChange={(e) => setEditUserPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Role Permission *
                  </label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                  >
                    <option value="User">User / Operator (Restricted to Authorized Employees)</option>
                    <option value="Admin">Admin (Full Control, Uploads & All Employees)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editUserDepartment}
                  onChange={(e) => setEditUserDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500"
                />
              </div>

              {/* Employee Authorization Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      Employee Card Authorization (कार्ड एक्सेस अधिकार)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      User लॉगिन करने पर सिर्फ इन ऑथराइज्ड एम्प्लॉई का कार्ड व डेटा ही दिखेगा।
                    </p>
                  </div>

                  {editUserRole !== 'Admin' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditUserSelectedEmpIds(employees.map((e) => e.id))}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      >
                        Select All ({employees.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditUserSelectedEmpIds([])}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>

                {editUserRole === 'Admin' ? (
                  <div className="p-3 bg-blue-950/50 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Admin role grants complete access to <b>all {employees.length} employee records</b>.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Radio Options */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                        editUserAuthorizeAll
                          ? 'bg-blue-950/60 border-blue-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="editAuthScope"
                          checked={editUserAuthorizeAll}
                          onChange={() => setEditUserAuthorizeAll(true)}
                          className="text-blue-600"
                        />
                        <span className="font-semibold">All Employees (सभी कार्ड दिखाएं)</span>
                      </label>

                      <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${
                        !editUserAuthorizeAll
                          ? 'bg-indigo-950/60 border-indigo-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="editAuthScope"
                          checked={!editUserAuthorizeAll}
                          onChange={() => setEditUserAuthorizeAll(false)}
                          className="text-indigo-600"
                        />
                        <span className="font-semibold">Selected Only ({editUserSelectedEmpIds.length} Cards)</span>
                      </label>
                    </div>

                    {!editUserAuthorizeAll && (
                      <div className="space-y-2 mt-2">
                        <input
                          type="text"
                          value={editModalEmpSearch}
                          onChange={(e) => setEditModalEmpSearch(e.target.value)}
                          placeholder="Search employee to authorize..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                        />

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
                          {employees
                            .filter(
                              (emp) =>
                                emp.name.toLowerCase().includes(editModalEmpSearch.toLowerCase()) ||
                                emp.insuranceNo.includes(editModalEmpSearch) ||
                                emp.employerName.toLowerCase().includes(editModalEmpSearch.toLowerCase())
                            )
                            .map((emp) => {
                              const isChecked = editUserSelectedEmpIds.includes(emp.id);
                              return (
                                <div
                                  key={emp.id}
                                  onClick={() => toggleEmpSelectionForEdit(emp.id)}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-indigo-950/60 border border-indigo-800/80 text-white'
                                      : 'bg-slate-900/60 border border-transparent text-slate-300 hover:bg-slate-800/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="text-indigo-400">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-600" />
                                      )}
                                    </div>
                                    <img
                                      src={emp.employeePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                      alt={emp.name}
                                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                    />
                                    <div>
                                      <p className="text-xs font-bold">{emp.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">
                                        IP: {emp.insuranceNo} &bull; {emp.employerName}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {emp.city || 'Bihar'}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Update User Permissions
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
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-600/30 cursor-pointer"
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
