import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
  getEmployees,
  saveEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getPortalUsers,
  toggleUserStatus,
  deletePortalUser,
  addPortalUser,
  getGlobalSettings,
  saveGlobalSettings,
} from './utils/storage';
import { PortalUser, EmployeeRecord, GlobalSettings } from './types';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { EmployeeListView } from './components/EmployeeListView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { PdfUploadModal } from './components/PdfUploadModal';
import { IdCardModal } from './components/IdCardModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentUserState, setCurrentUserState] = useState<PortalUser | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>(getGlobalSettings());

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedCardEmp, setSelectedCardEmp] = useState<EmployeeRecord | null>(null);
  const [editingEmp, setEditingEmp] = useState<EmployeeRecord | null>(null);
  const [printPreviewEmp, setPrintPreviewEmp] = useState<EmployeeRecord | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load initial state on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserState(user);
    setEmployees(getEmployees());
    setUsers(getPortalUsers());
    setSettings(getGlobalSettings());
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + Math.random(),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleLogin = (user: PortalUser) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    addToast('success', `Welcome, ${user.name}!`, `Logged in as ${user.role}`);
  };

  const handleLogout = () => {
    setCurrentUserState(null);
    setCurrentUser(null);
    addToast('info', 'Logged out successfully');
  };

  // Employee Handlers
  const handleSaveEmployeeFromPdf = (
    employeeData: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newEmp = addEmployee(employeeData);
    setEmployees(getEmployees());
    addToast(
      'success',
      'PDF Transcript Saved to Database!',
      `Employee ${newEmp.name} (IP: ${newEmp.insuranceNo}) is ready for ID card viewing & printing.`
    );
    // Optionally open the newly created ID card
    setSelectedCardEmp(newEmp);
  };

  const handleUpdateEmployee = (id: string, updates: Partial<EmployeeRecord>) => {
    const updated = updateEmployee(id, updates);
    setEmployees(updated);
    addToast('success', 'Employee Record Updated', 'Photos and details saved successfully.');
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    const updated = deleteEmployee(id);
    setEmployees(updated);
    addToast('info', 'Employee Record Deleted', `Removed ${name} from database.`);
  };

  // User Management Handlers
  const handleToggleUserStatus = (userId: string) => {
    const updated = toggleUserStatus(userId);
    setUsers(updated);
    const targetUser = updated.find((u) => u.id === userId);
    addToast(
      'info',
      'User Status Updated',
      `${targetUser?.name} is now ${targetUser?.isActive ? 'Active' : 'Deactivated'}`
    );
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    const updated = deletePortalUser(userId);
    setUsers(updated);
    addToast('info', 'User Deleted', `Removed ${userName} from portal users.`);
  };

  const handleAddUser = (newUserData: Omit<PortalUser, 'id' | 'createdAt'>) => {
    const updated = addPortalUser(newUserData);
    setUsers(updated);
    addToast('success', 'New User Created', `${newUserData.name} (${newUserData.role}) registered.`);
  };

  // Settings Handlers
  const handleSaveSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
    saveGlobalSettings(newSettings);
    addToast('success', 'Global Settings Saved', 'Employer signature (Sign.jpg) updated.');
  };

  // If not logged in, show Login Page
  if (!currentUserState) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLogin} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUserState}
        settings={settings}
        onLogout={handleLogout}
        onNavigate={setCurrentTab}
        onOpenPdfUpload={() => setIsPdfModalOpen(true)}
        employeeCount={employees.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUserState}
          employeeCount={employees.length}
          userCount={users.length}
          onOpenPdfUpload={() => setIsPdfModalOpen(true)}
        />

        {/* Content View Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {currentTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              users={users}
              settings={settings}
              currentUser={currentUserState}
              onNavigate={setCurrentTab}
              onOpenPdfUpload={() => setIsPdfModalOpen(true)}
              onViewCard={(emp) => setSelectedCardEmp(emp)}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeeListView
              employees={employees}
              settings={settings}
              onOpenPdfUpload={() => setIsPdfModalOpen(true)}
              onViewCard={(emp) => setSelectedCardEmp(emp)}
              onEditEmployee={(emp) => setEditingEmp(emp)}
              onDeleteEmployee={handleDeleteEmployee}
              onOpenPrintPreview={(emp) => setPrintPreviewEmp(emp)}
            />
          )}

          {currentTab === 'users' && (
            <UserManagementView
              users={users}
              currentUser={currentUserState}
              onToggleStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              onAddUser={handleAddUser}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* PDF Upload & Auto-Transcript Modal */}
      <PdfUploadModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onSaveEmployee={handleSaveEmployeeFromPdf}
      />

      {/* Smart ID Card Viewer (Front/Back 3D & Dual-side) */}
      <IdCardModal
        isOpen={!!selectedCardEmp}
        onClose={() => setSelectedCardEmp(null)}
        employee={selectedCardEmp}
        settings={settings}
        onEdit={(emp) => {
          setSelectedCardEmp(null);
          setEditingEmp(emp);
        }}
        onOpenPrintPreview={(emp) => {
          setSelectedCardEmp(null);
          setPrintPreviewEmp(emp);
        }}
      />

      {/* Edit Employee & Photo / Family Photo / Signature Uploader Modal */}
      <EditEmployeeModal
        isOpen={!!editingEmp}
        onClose={() => setEditingEmp(null)}
        employee={editingEmp}
        onSave={handleUpdateEmployee}
      />

      {/* A4 Print Preview Modal (Back Side Left & Front Side Right) */}
      <PrintPreviewModal
        isOpen={!!printPreviewEmp}
        onClose={() => setPrintPreviewEmp(null)}
        employee={printPreviewEmp}
        settings={settings}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
