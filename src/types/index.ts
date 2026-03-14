// Core data types for the NGO Donor Management System

export interface Budget {
  id: string;
  name: string;
  amount: number;
  allocated: number;
  remaining: number;
  year: number;
  category: string;
  description: string;
  createdDate: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned' | 'on-hold';
  beneficiaries: number;
  location: string;
}

export interface Expense {
  id: string;
  programId: string;
  programName: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Report {
  id: string;
  title: string;
  type: 'financial' | 'program' | 'donor' | 'quarterly' | 'annual';
  period: string;
  generatedDate: string;
  summary: string;
  totalBudget: number;
  totalSpent: number;
  programsCount: number;
  beneficiariesReached: number;
}

export interface NGOData {
  ngoName: string;
  budgets: Budget[];
  programs: Program[];
  expenses: Expense[];
  reports: Report[];
}

export interface Donor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  type: 'individual' | 'organization';
  status: 'active' | 'inactive';
  country: string;
  notes?: string;
}

export interface Girl {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: string;
  program: string;
  status: 'active' | 'graduated' | 'inactive';
  sponsorshipStatus: 'sponsored' | 'partial' | 'unsponsored';
  sponsorId?: string;
  notes?: string;
}

export interface Sponsorship {
  id: string;
  donorId: string;
  donorName: string;
  girlId: string;
  girlName: string;
  program: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'closed';
  notes?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  sponsorshipId?: string;
  amount: number;
  currency: string;
  date: string;
  method: 'cash' | 'bank' | 'mobile-money' | 'card';
  reference: string;
  status: 'received' | 'pending' | 'failed' | 'refunded';
  notes?: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  roleType: 'employee' | 'volunteer';
  roleTitle: string;
  startDate: string;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
  program?: string;
  notes?: string;
}

export interface Participant {
  id: string;
  fullName: string;
  programId: string;
  programName: string;
  category: 'girl' | 'boy' | 'youth' | 'adult' | 'household' | 'other';
  gender: 'female' | 'male' | 'other';
  age?: number;
  status: 'active' | 'inactive' | 'completed';
  guardianName?: string;
  phone?: string;
  location?: string;
  notes?: string;
}

export type ViewType = 'dashboard' | 'budgets' | 'programs' | 'expenses' | 'reports';
