import { EmployeeRecord, PortalUser, GlobalSettings } from '../types';
import {
  getEmployees as getLocalEmployees,
  saveEmployees as saveLocalEmployees,
  getPortalUsers as getLocalUsers,
  savePortalUsers as saveLocalUsers,
  getGlobalSettings as getLocalSettings,
  saveGlobalSettings as saveLocalSettings,
} from './storage';

export interface DbStatusInfo {
  connectedToSql: boolean;
  storageType: string;
  databaseUrlConfigured: boolean;
  error: string | null;
}

// ----------------------------------------------------
// Health & DB Status API
// ----------------------------------------------------
export async function checkServerDbStatus(): Promise<DbStatusInfo> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Server returned status ' + res.status);
    const data = await res.json();
    return data.database || {
      connectedToSql: false,
      storageType: 'In-Memory / Local',
      databaseUrlConfigured: false,
      error: null,
    };
  } catch (err: any) {
    return {
      connectedToSql: false,
      storageType: 'Client Local State (Offline/Fallback)',
      databaseUrlConfigured: false,
      error: err.message,
    };
  }
}

// ----------------------------------------------------
// Employee API
// ----------------------------------------------------
export async function fetchEmployeesApi(): Promise<EmployeeRecord[]> {
  try {
    const res = await fetch('/api/employees');
    if (res.ok) {
      const result = await res.json();
      if (result.data && Array.isArray(result.data)) {
        saveLocalEmployees(result.data);
        return result.data;
      }
    }
  } catch (e) {
    console.warn('API /api/employees failed, loading local storage:', e);
  }
  return getLocalEmployees();
}

export async function saveEmployeeApi(employee: Partial<EmployeeRecord>): Promise<EmployeeRecord> {
  try {
    const isUpdate = !!employee.id;
    const url = isUpdate ? `/api/employees/${employee.id}` : '/api/employees';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });

    if (res.ok) {
      const result = await res.json();
      return result.data;
    }
  } catch (e) {
    console.warn('API save employee failed, using local storage fallback:', e);
  }

  // Local fallback
  const localList = getLocalEmployees();
  if (employee.id) {
    const idx = localList.findIndex((e) => e.id === employee.id);
    if (idx >= 0) {
      localList[idx] = { ...localList[idx], ...employee, updatedAt: new Date().toISOString() } as EmployeeRecord;
      saveLocalEmployees(localList);
      return localList[idx];
    }
  }

  const newEmp: EmployeeRecord = {
    ...employee,
    id: employee.id || 'emp-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as EmployeeRecord;
  localList.unshift(newEmp);
  saveLocalEmployees(localList);
  return newEmp;
}

export async function deleteEmployeeApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    console.warn('API delete employee failed, deleting locally:', e);
  }

  const localList = getLocalEmployees().filter((e) => e.id !== id);
  saveLocalEmployees(localList);
  return true;
}

// ----------------------------------------------------
// User API
// ----------------------------------------------------
export async function fetchUsersApi(): Promise<PortalUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const result = await res.json();
      if (result.data && Array.isArray(result.data)) {
        saveLocalUsers(result.data);
        return result.data;
      }
    }
  } catch (e) {
    console.warn('API /api/users failed, loading local users:', e);
  }
  return getLocalUsers();
}

export async function createUserApi(userData: Omit<PortalUser, 'id' | 'createdAt'>): Promise<PortalUser> {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      const result = await res.json();
      return result.data;
    }
  } catch (e) {
    console.warn('API create user failed, creating locally:', e);
  }

  const localUsers = getLocalUsers();
  const newUser: PortalUser = {
    ...userData,
    id: 'usr-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  localUsers.push(newUser);
  saveLocalUsers(localUsers);
  return newUser;
}

export async function toggleUserStatusApi(id: string): Promise<PortalUser | null> {
  try {
    const res = await fetch(`/api/users/${id}/toggle-status`, { method: 'PUT' });
    if (res.ok) {
      const result = await res.json();
      return result.data;
    }
  } catch (e) {
    console.warn('API toggle user status failed:', e);
  }

  const localUsers = getLocalUsers();
  const idx = localUsers.findIndex((u) => u.id === id);
  if (idx >= 0) {
    localUsers[idx].isActive = !localUsers[idx].isActive;
    saveLocalUsers(localUsers);
    return localUsers[idx];
  }
  return null;
}

export async function deleteUserApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (e) {
    console.warn('API delete user failed:', e);
  }

  const localUsers = getLocalUsers().filter((u) => u.id !== id);
  saveLocalUsers(localUsers);
  return true;
}

// ----------------------------------------------------
// Global Settings API
// ----------------------------------------------------
export async function fetchSettingsApi(): Promise<GlobalSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const result = await res.json();
      if (result.data) {
        saveLocalSettings(result.data);
        return result.data;
      }
    }
  } catch (e) {
    console.warn('API fetch settings failed:', e);
  }
  return getLocalSettings();
}

export async function saveSettingsApi(settings: GlobalSettings): Promise<GlobalSettings> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const result = await res.json();
      saveLocalSettings(result.data);
      return result.data;
    }
  } catch (e) {
    console.warn('API save settings failed:', e);
  }

  saveLocalSettings(settings);
  return settings;
}
