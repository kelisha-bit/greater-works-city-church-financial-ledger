export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum UserRole {
  ADMIN = 'admin',
  TREASURER = 'treasurer',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  PASTOR = 'pastor',
  DEACON = 'deacon',
  MEMBER = 'member',
  GUEST = 'guest'
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
  // Added church member details
  birthday?: string; // ISO date string yyyy-mm-dd
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  householdName?: string; // Household or family unit name
  familyLinks?: string[]; // related member names or IDs (UI-dependent)
  membershipStatus?: 'Active' | 'Inactive';
  baptismDate?: string; // ISO date string
  joinDate?: string; // ISO date string (church join date)
  ministries?: string[]; // e.g., Ushering, Choir
  departments?: string[]; // e.g., Youth, Women, Men
  notes?: string;
  // Address extensions (Ghana context)
  address2?: string;
  city?: string; // e.g., Accra, Kumasi
  region?: string; // e.g., Greater Accra, Ashanti
  postalCode?: string; // Ghana Post GPS or postal code
  // Personal additions
  gender?: 'Male' | 'Female' | 'Other';
  idType?: string; // e.g., Ghana Card, Passport
  idNumber?: string;
  occupation?: string;
  employer?: string;
  educationLevel?: string;
  // Family
  spouseName?: string;
  numberOfChildren?: number;
  childrenNamesAges?: string[]; // e.g., ["John (10)", "Mary (7)"]
  // Church
  previousChurch?: string;
  membershipClassCompleted?: boolean;
  membershipClassDate?: string; // ISO date
  spiritualGifts?: string[];
  confirmationDate?: string; // ISO date
  communionDate?: string; // ISO date
  // Ministry/Groups
  serviceTeamRole?: string;
  // Contact & Consent
  preferredContactMethod?: 'Phone' | 'Email' | 'SMS' | 'WhatsApp';
  whatsappNumber?: string;
  optInEmail?: boolean;
  optInSMS?: boolean;
  optInWhatsApp?: boolean;
  mediaConsent?: boolean;
  // Address extras
  country?: string;
  landmark?: string; // directions or landmark
  // Emergency/Health
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  accessibilityNeeds?: string;
  // Stewardship
  titheNumber?: string; // envelope number
  // Other
  prayerRequests?: string;
}

export interface Budget {
  category: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'members' | 'specific';
  specificRecipients?: string[];
  priority: 'low' | 'medium' | 'high';
  date: Date | any; // Firestore Timestamp or Date
  createdBy: string;
  createdAt: Date | any; // Firestore Timestamp or Date
  status: 'draft' | 'published' | 'archived';
  scheduledFor?: Date | any; // Firestore Timestamp or Date for future publishing
  updatedAt?: Date | any; // Firestore Timestamp or Date
  updatedBy?: string;
  readBy?: string[]; // Array of user IDs who have read the announcement
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  categories?: string[]; // e.g., ['general', 'events', 'prayer', 'giving']
  expiresAt?: Date | any; // Optional expiration date
  allowComments?: boolean;
  commentsCount?: number;
  isPinned?: boolean;
  metadata?: Record<string, any>; // For any additional data
}
