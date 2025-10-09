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
  role?: string; // e.g., Member, Elder, Pastor
  emergencyContact?: string;
  profilePicture?: string; // base64 data URL
}

export interface Budget {
  [month: string]: { // YYYY-MM format
    [category: string]: number;
  };
}
