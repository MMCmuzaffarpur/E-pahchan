export type UserRole = 'Admin' | 'User';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface EmployeeFamilyMember {
  name: string;
  relation: string;
  dob?: string;
}

export interface EmployeeRecord {
  id: string;
  insuranceNo: string; // IP / Insurance No (e.g. 5210987654)
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  fatherOrHusbandName: string;
  relationType: 'Father' | 'Husband';
  dob: string; // YYYY-MM-DD
  mobileNo: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  employerName: string;
  employerCode?: string;
  employerAddress?: string;
  appointmentDate?: string;
  dispensary?: string;
  branchOffice?: string;
  
  // Photos and Signatures
  employeePhoto?: string; // base64 or url
  familyPhoto?: string; // base64 or url
  employeeSignature?: string; // base64 or url
  
  // Meta
  createdAt: string;
  updatedAt: string;
  sourcePdfName?: string;
  transcriptData?: Record<string, string>;
}

export interface GlobalSettings {
  organizationName: string;
  portalTitle: string;
  employerSignature: string; // Sign.jpg common for all employees
  employerStamp?: string;
  organizationLogo?: string;
  helplineNo: string;
  websiteUrl: string;
  cardThemeColor: string;
}

export interface ParsedPdfResult {
  rawText: string;
  fields: Partial<EmployeeRecord>;
  confidence: number;
  extractedLines: string[];
}
