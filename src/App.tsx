import React, { useState, useEffect } from 'react';
import {
  getCurrentUser,
  setCurrentUser,
} from './utils/storage';
import {
  fetchEmployeesApi,
  saveEmployeeApi,
  deleteEmployeeApi,
  fetchUsersApi,
  createUserApi,
  toggleUserStatusApi,
  deleteUserApi,
  fetchSettingsApi,
  saveSettingsApi,
  checkServerDbStatus,
  DbStatusInfo,
} from './utils/api';
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
  const [settings, setSettings] = useState<GlobalSettings>({
    employerSignature: '',
    employerStamp: '',
    organizationName: "EMPLOYEES' STATE INSURANCE CORPORATION",
    portalTitle: 'e-Pehchan Smart ID Portal & PDF Registry',
    helplineNo: '1800-11-2526 / 0612-2500123',
  });
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedCardEmp, setSelectedCardEmp] = useState<EmployeeRecord | null>(null);
  const [editingEmp, setEditingEmp] = useState<EmployeeRecord | null>(null);
  const [printPreviewEmp, setPrintPreviewEmp] = useState<EmployeeRecord | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load initial state on mount from Backend API & Fallbacks
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserState(user);

    async function loadInitialData() {
      try {
        const [empData, usrData, settsData, statusData] = await Promise.all([
          fetchEmployeesApi(),
          fetchUsersApi(),
          fetchSettingsApi(),
          checkServerDbStatus(),
        ]);
        setEmployees(empData);
        setUsers(usrData);
        setSettings(settsData);
        setDbStatus(statusData);
      } catch (err) {
        console.warn('Error fetching initial backend data:', err);
      }
    }

    loadInitialData();
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

  // Employee Handlers (Connecting directly to Backend API & SQL)
  const handleSaveEmployeeFromPdf = async (
    employeeData: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newEmp = await saveEmployeeApi(employeeData);
      const updatedList = await fetchEmployeesApi();
      setEmployees(updatedList);
      addToast(
        'success',
        'PDF Transcript Saved to Database!',
        `Employee ${newEmp.name} (IP: ${newEmp.insuranceNo}) saved and synchronized with database.`
      );
      setSelectedCardEmp(newEmp);
    } catch (err) {
      addToast('error', 'Failed to save employee', 'Please check connection.');
    }
  };

  const handleUpdateEmployee = async (id: string, updates: Partial<EmployeeRecord>) => {
    try {
      await saveEmployeeApi({ ...updates, id });
      const updatedList = await fetchEmployeesApi();
      setEmployees(updatedList);
      addToast('success', 'Employee Record Updated', 'Photos, signatures and details synchronized.');
    } catch (err) {
      addToast('error', 'Update Failed', 'Could not update employee record.');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    try {
      await deleteEmployeeApi(id);
      const updatedList = await fetchEmployeesApi();
      setEmployees(updatedList);
      addToast('info', 'Employee Record Deleted', `Removed ${name} from database.`);
    } catch (err) {
      addToast('error', 'Delete Failed', 'Could not delete employee record.');
    }
  };

  // User Management Handlers
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const updatedUser = await toggleUserStatusApi(userId);
      const updatedList = await fetchUsersApi();
      setUsers(updatedList);
      if (updatedUser) {
        addToast(
          'info',
          'User Status Updated',
          `${updatedUser.name} is now ${updatedUser.isActive ? 'Active' : 'Deactivated'}`
        );
      }
    } catch (err) {
      addToast('error', 'Status Update Failed');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await deleteUserApi(userId);
      const updatedList = await fetchUsersApi();
      setUsers(updatedList);
      addToast('info', 'User Deleted', `Removed ${userName} from portal users.`);
    } catch (err) {
      addToast('error', 'Delete User Failed');
    }
  };

  const handleAddUser = async (newUserData: Omit<PortalUser, 'id' | 'createdAt'>) => {
    try {
      const created = await createUserApi(newUserData);
      const updatedList = await fetchUsersApi();
      setUsers(updatedList);
      addToast('success', 'New User Created', `${created.name} (${created.role}) registered in database.`);
    } catch (err) {
      addToast('error', 'Create User Failed');
    }
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings: GlobalSettings) => {
    try {
      const saved = await saveSettingsApi(newSettings);
      setSettings(saved);
      addToast('success', 'Global Settings Saved', 'Employer signature (Sign.jpg) and configuration saved to database.');
    } catch (err) {
      addToast('error', 'Settings Save Failed');
    }
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
