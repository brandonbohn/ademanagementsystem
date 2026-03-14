export interface ExpenseDetail {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  vendor: string;
  program?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export const monthlyExpenses: MonthlyExpense[] = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 18000 },
  { month: 'Mar', amount: 22000 },
  { month: 'Apr', amount: 19000 },
  { month: 'May', amount: 21000 },
  { month: 'Jun', amount: 24000 },
  { month: 'Jul', amount: 23000 },
  { month: 'Aug', amount: 26000 },
  { month: 'Sep', amount: 25000 },
  { month: 'Oct', amount: 28000 },
  { month: 'Nov', amount: 27000 },
  { month: 'Dec', amount: 30000 },
];

export const expenseDetails: ExpenseDetail[] = [
  { 
    id: 1, 
    date: '2025-01-05', 
    description: 'Office Rent', 
    category: 'Operations', 
    amount: 5000, 
    vendor: 'Property Mgmt Co',
    program: 'Program A',
    receiptNumber: 'REC-001',
    paymentMethod: 'Check',
    notes: 'Monthly office rent payment'
  },
  { 
    id: 2, 
    date: '2025-01-12', 
    description: 'Medical Supplies', 
    category: 'Programs', 
    amount: 3200, 
    vendor: 'MedSupply Inc',
    program: 'Program B',
    receiptNumber: 'REC-002',
    paymentMethod: 'Credit Card',
    notes: 'Medical equipment for health initiative'
  },
  { 
    id: 3, 
    date: '2025-01-18', 
    description: 'Marketing Campaign', 
    category: 'Marketing', 
    amount: 2500, 
    vendor: 'AdAgency LLC',
    receiptNumber: 'REC-003',
    paymentMethod: 'Wire Transfer',
    notes: 'Q1 marketing campaign'
  },
  { 
    id: 4, 
    date: '2025-01-25', 
    description: 'Office Supplies', 
    category: 'Administrative', 
    amount: 1200, 
    vendor: 'Office Depot',
    receiptNumber: 'REC-004',
    paymentMethod: 'Credit Card',
    notes: 'Stationery and office materials'
  },
  { 
    id: 5, 
    date: '2025-01-30', 
    description: 'Staff Training', 
    category: 'Operations', 
    amount: 3100, 
    vendor: 'Training Solutions',
    receiptNumber: 'REC-005',
    paymentMethod: 'Check',
    notes: 'Professional development workshop'
  },
  { 
    id: 6, 
    date: '2025-02-03', 
    description: 'Equipment Purchase', 
    category: 'Programs', 
    amount: 8500, 
    vendor: 'Tech Supplies Co',
    program: 'Program A',
    receiptNumber: 'REC-006',
    paymentMethod: 'Wire Transfer',
    notes: 'Computer equipment for programs'
  },
  { 
    id: 7, 
    date: '2025-02-10', 
    description: 'Utilities', 
    category: 'Operations', 
    amount: 1200, 
    vendor: 'City Utilities',
    receiptNumber: 'REC-007',
    paymentMethod: 'Check',
    notes: 'Electricity and water bill'
  },
  { 
    id: 8, 
    date: '2025-02-15', 
    description: 'Program Materials', 
    category: 'Programs', 
    amount: 4300, 
    vendor: 'Materials Plus',
    program: 'Program B',
    receiptNumber: 'REC-008',
    paymentMethod: 'Credit Card',
    notes: 'Educational materials for outreach'
  },
  { 
    id: 9, 
    date: '2025-02-22', 
    description: 'Social Media Ads', 
    category: 'Marketing', 
    amount: 2000, 
    vendor: 'Digital Marketing',
    receiptNumber: 'REC-009',
    paymentMethod: 'Credit Card',
    notes: 'Facebook and Instagram advertising'
  },
  { 
    id: 10, 
    date: '2025-02-28', 
    description: 'Legal Fees', 
    category: 'Administrative', 
    amount: 2000, 
    vendor: 'Law Firm LLP',
    receiptNumber: 'REC-010',
    paymentMethod: 'Check',
    notes: 'Legal consultation services'
  },
  { 
    id: 11, 
    date: '2025-03-05', 
    description: 'Vehicle Maintenance', 
    category: 'Operations', 
    amount: 3500, 
    vendor: 'Auto Services',
    receiptNumber: 'REC-011',
    paymentMethod: 'Credit Card',
    notes: 'Service and repairs for company vehicles'
  },
  { 
    id: 12, 
    date: '2025-03-12', 
    description: 'Educational Materials', 
    category: 'Programs', 
    amount: 6200, 
    vendor: 'Edu Supply Co',
    program: 'Program A',
    receiptNumber: 'REC-012',
    paymentMethod: 'Wire Transfer',
    notes: 'Books and learning materials'
  },
  { 
    id: 13, 
    date: '2025-03-18', 
    description: 'Website Development', 
    category: 'Marketing', 
    amount: 5000, 
    vendor: 'Web Developers',
    receiptNumber: 'REC-013',
    paymentMethod: 'Check',
    notes: 'Website redesign and development'
  },
  { 
    id: 14, 
    date: '2025-03-25', 
    description: 'Insurance Premium', 
    category: 'Administrative', 
    amount: 4500, 
    vendor: 'Insurance Corp',
    receiptNumber: 'REC-014',
    paymentMethod: 'Check',
    notes: 'Annual insurance coverage'
  },
  { 
    id: 15, 
    date: '2025-03-30', 
    description: 'Travel Expenses', 
    category: 'Operations', 
    amount: 2800, 
    vendor: 'Travel Agency',
    receiptNumber: 'REC-015',
    paymentMethod: 'Credit Card',
    notes: 'Conference travel and accommodation'
  },
];
