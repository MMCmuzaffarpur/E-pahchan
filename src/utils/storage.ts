import { PortalUser, EmployeeRecord, GlobalSettings } from '../types';
import {
  DEFAULT_EMPLOYER_SIGNATURE,
  DEFAULT_EMPLOYER_STAMP,
  DEFAULT_PORTAL_LOGO,
  DEFAULT_AVATAR_MALE,
  DEFAULT_AVATAR_FEMALE,
  DEFAULT_FAMILY_PHOTO,
  DEFAULT_EMPLOYEE_SIGNATURE,
} from './defaultAssets';

const USERS_KEY = 'portal_users_db_v1';
const EMPLOYEES_KEY = 'portal_employees_db_v1';
const SETTINGS_KEY = 'portal_settings_db_v1';
const CURRENT_USER_KEY = 'portal_current_user_v1';

// Initial default portal users
const INITIAL_USERS: PortalUser[] = [
  {
    id: 'user-admin-1',
    name: 'Chief Admin',
    email: 'admin@portal.gov.in',
    password: 'Admin123',
    role: 'Admin',
    isActive: true,
    department: 'Card Administration & Verification',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T10:00:00.000Z',
    lastLogin: 'Today, 10:45 AM',
    authorizeAll: true,
    authorizedEmployeeIds: [],
  },
  {
    id: 'user-staff-2',
    name: 'Operator Vikash Kumar',
    email: 'user@portal.gov.in',
    password: 'User123',
    role: 'User',
    isActive: true,
    department: 'Muzaffarpur Municipal Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01T11:30:00.000Z',
    lastLogin: 'Yesterday, 04:12 PM',
    authorizeAll: false,
    authorizedEmployeeIds: ['emp-100'], // Authorized only for Baby Devi (ESIC 4216776809)
  },
  {
    id: 'user-staff-3',
    name: 'Priya Sharma (Operator)',
    email: 'priya.operator@portal.gov.in',
    password: 'User123',
    role: 'User',
    isActive: true,
    department: 'Tirhut Textile Verification Unit',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-15T09:00:00.000Z',
    lastLogin: '3 days ago',
    authorizeAll: false,
    authorizedEmployeeIds: ['emp-102'], // Authorized for Sunita Devi
  },
];

// Initial pre-loaded parsed employee records from sample PDF transcripts
const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp-100',
    insuranceNo: '4216776809',
    name: 'BABY DEVI',
    gender: 'Female',
    fatherOrHusbandName: 'SATAYANARAYAN RAM',
    relationType: 'Husband',
    dob: '1979-09-05',
    mobileNo: '7667737030',
    address: 'PAKKI SARYA CHOWK, NAGARNIGAM KE PASS, CHANDWARA MUZAFFARPUR',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    employerName: 'MUZAFFARPUR MUNICIPAL CORPORATION',
    employerCode: '42001884020000908',
    employerAddress: 'Near Muzaffarpur Railway Station, Civil Court Campus, Hpo Ps Town, Dist: Muzaffarpur Bihar 842001',
    appointmentDate: '2023-05-01',
    dispensary: 'Kalambagh Chowk, BH (ESIS Disp.)',
    branchOffice: 'DCBO - Muzaffarpur, ESIC DCBO, Behind S.B.I. Bhagwanpur Chowk',
    employeePhoto: DEFAULT_AVATAR_FEMALE,
    familyPhoto: DEFAULT_FAMILY_PHOTO,
    employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    createdAt: '2025-03-01T07:00:00.000Z',
    updatedAt: '2025-03-01T07:00:00.000Z',
    sourcePdfName: 'ESIC_ePehchan_Baby_Devi_4216776809.pdf',
  },
  {
    id: 'emp-101',
    insuranceNo: '3109845621',
    name: 'Ramesh Kumar Verma',
    gender: 'Male',
    fatherOrHusbandName: 'Late Suresh Prasad Verma',
    relationType: 'Father',
    dob: '1989-04-12',
    mobileNo: '9835124578',
    address: 'Ward No 14, Main Road Juran Chapra, Muzaffarpur',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    employerName: 'BHARAT LOGISTICS & COURIER CORP',
    employerCode: '21000854630000901',
    employerAddress: 'Plot 45, Transport Nagar, Patna Highway',
    appointmentDate: '2021-03-01',
    dispensary: 'ESIC Dispensary Bela Industrial Area',
    branchOffice: 'ESIC Sub-Regional Office Muzaffarpur',
    employeePhoto: DEFAULT_AVATAR_MALE,
    familyPhoto: DEFAULT_FAMILY_PHOTO,
    employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    createdAt: '2025-03-01T08:30:00.000Z',
    updatedAt: '2025-03-01T08:30:00.000Z',
    sourcePdfName: 'ESIC_Pehchan_Ramesh_Verma.pdf',
  },
  {
    id: 'emp-102',
    insuranceNo: '3114589632',
    name: 'Sunita Devi',
    gender: 'Female',
    fatherOrHusbandName: 'Manoj Kumar Gupta',
    relationType: 'Husband',
    dob: '1994-11-20',
    mobileNo: '9431876543',
    address: 'Quarter No 88, Sugar Mill Colony, Motihari Road',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842002',
    employerName: 'TIRHUT TEXTILE & GARMENTS PVT LTD',
    employerCode: '11000784960001002',
    employerAddress: 'Industrial Growth Centre, Muzaffarpur',
    appointmentDate: '2022-06-15',
    dispensary: 'ESIC Model Hospital Phulwarisharif',
    branchOffice: 'ESIC Branch Office Kanti',
    employeePhoto: DEFAULT_AVATAR_FEMALE,
    familyPhoto: DEFAULT_FAMILY_PHOTO,
    employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    createdAt: '2025-03-02T10:15:00.000Z',
    updatedAt: '2025-03-02T10:15:00.000Z',
    sourcePdfName: 'Pehchan_Card_Sunita_Devi.pdf',
  },
  {
    id: 'emp-103',
    insuranceNo: '3123654789',
    name: 'Amitabh Ranjan Singh',
    gender: 'Male',
    fatherOrHusbandName: 'Dinesh Prasad Singh',
    relationType: 'Father',
    dob: '1991-07-05',
    mobileNo: '7004123890',
    address: 'Flat 302, Maa Sharda Residency, Mithanpura',
    city: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842002',
    employerName: 'GLOBAL SECURE FACILITY MANAGEMENT LTD',
    employerCode: '31000965840001104',
    employerAddress: 'Tech Park Tower B, Exhibition Road, Patna',
    appointmentDate: '2020-01-10',
    dispensary: 'ESIC Dispensary Maripur',
    branchOffice: 'ESIC Sub-Regional Office Muzaffarpur',
    employeePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    familyPhoto: DEFAULT_FAMILY_PHOTO,
    employeeSignature: DEFAULT_EMPLOYEE_SIGNATURE,
    createdAt: '2025-03-03T14:40:00.000Z',
    updatedAt: '2025-03-03T14:40:00.000Z',
    sourcePdfName: 'Employee_Transcript_Amitabh.pdf',
  },
];

const INITIAL_SETTINGS: GlobalSettings = {
  organizationName: "EMPLOYEES' STATE INSURANCE CORPORATION",
  portalTitle: 'e-Pehchan Smart ID Portal & PDF Transcript Engine',
  employerSignature: DEFAULT_EMPLOYER_SIGNATURE, // This Sign.jpg is common for all employees
  employerStamp: DEFAULT_EMPLOYER_STAMP,
  organizationLogo: DEFAULT_PORTAL_LOGO,
  helplineNo: '1800-11-2526 / 1800-11-3839',
  websiteUrl: 'www.esic.gov.in',
  cardThemeColor: '#0f3a69',
};

// Users management
export function getPortalUsers(): PortalUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function savePortalUsers(users: PortalUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function toggleUserStatus(userId: string): PortalUser[] {
  const users = getPortalUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, isActive: !u.isActive };
    }
    return u;
  });
  savePortalUsers(updated);
  return updated;
}

export function deletePortalUser(userId: string): PortalUser[] {
  const users = getPortalUsers().filter((u) => u.id !== userId);
  savePortalUsers(users);
  return users;
}

export function updatePortalUser(userId: string, updates: Partial<PortalUser>): PortalUser[] {
  const users = getPortalUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, ...updates };
    }
    return u;
  });
  savePortalUsers(updated);
  return updated;
}

export function addPortalUser(newUser: Omit<PortalUser, 'id' | 'createdAt'>): PortalUser[] {
  const users = getPortalUsers();
  const user: PortalUser = {
    ...newUser,
    id: 'user-' + Date.now(),
    password: newUser.password || (newUser.role === 'Admin' ? 'Admin123' : 'User123'),
    authorizeAll: newUser.authorizeAll ?? (newUser.role === 'Admin'),
    authorizedEmployeeIds: newUser.authorizedEmployeeIds || [],
    createdAt: new Date().toISOString(),
    lastLogin: 'Never',
  };
  const updated = [user, ...users];
  savePortalUsers(updated);
  return updated;
}

// Current User Auth
export function getCurrentUser(): PortalUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to logged-in Admin on initial load for instant preview
      const defaultAdmin = INITIAL_USERS[0];
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultAdmin));
      return defaultAdmin;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USERS[0];
  }
}

export function setCurrentUser(user: PortalUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

// Employees management
export function getEmployees(): EmployeeRecord[] {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY);
    if (!raw) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployees(employees: EmployeeRecord[]): void {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
}

export function addEmployee(record: Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>): EmployeeRecord {
  const employees = getEmployees();
  const newEmp: EmployeeRecord = {
    ...record,
    id: 'emp-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newEmp, ...employees];
  saveEmployees(updated);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<EmployeeRecord>): EmployeeRecord[] {
  const employees = getEmployees();
  const updated = employees.map((emp) => {
    if (emp.id === id) {
      return {
        ...emp,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return emp;
  });
  saveEmployees(updated);
  return updated;
}

export function deleteEmployee(id: string): EmployeeRecord[] {
  const employees = getEmployees().filter((emp) => emp.id !== id);
  saveEmployees(employees);
  return employees;
}

// Settings management
export function getGlobalSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SETTINGS;
  }
}

export function saveGlobalSettings(settings: GlobalSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
