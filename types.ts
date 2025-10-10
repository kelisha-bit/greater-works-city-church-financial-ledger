export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  receipts?: Receipt[];
  donorName?: string; // For tracking individual donations
  donorContact?: string; // Optional contact info for donors
}

export interface Receipt {
  id: string; // generated uid
  name: string; // original filename
  mimeType: string;
  dataUrl: string; // base64 data URL
}

export interface ChartData {
  name: string;
  value: number;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  dateJoined: string; // ISO string

  // Personal Information
  dateOfBirth?: string; // ISO string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

  // Church Information
  role?: string; // e.g., Member, Elder, Pastor, Deacon, etc.
  membershipStatus?: 'Active' | 'Inactive' | 'Pending' | 'Former' | 'Visitor';
  baptismDate?: string; // ISO string
  ministries?: string[]; // Array of ministry involvement
  smallGroup?: string;
  volunteerRoles?: string[];

  // Family Information
  familyMembers?: {
    spouse?: string;
    children?: Array<{
      name: string;
      age?: number;
      relationship?: string;
    }>;
  };

  // Contact & Emergency Information
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };

  // Professional & Skills
  occupation?: string;
  skills?: string[]; // For volunteer matching

  // Additional Information
  previousChurch?: string;
  allergies?: string;
  notes?: string;

  // Media
  profilePicture?: string; // base64 data URL
}

export interface Budget {
  [month: string]: { // YYYY-MM format
    [category: string]: number;
  };
}
