import type { NGOData } from '../types';

export const ngoData: NGOData = {
  ngoName: "ADE Donor Management System",
  
  budgets: [
    {
      id: "B001",
      name: "Education Program Budget 2025",
      amount: 500000,
      allocated: 350000,
      remaining: 150000,
      year: 2025,
      category: "Education",
      description: "Annual budget for education initiatives",
      createdDate: "2025-01-15"
    },
    {
      id: "B002",
      name: "Healthcare Initiative 2025",
      amount: 750000,
      allocated: 600000,
      remaining: 150000,
      year: 2025,
      category: "Healthcare",
      description: "Medical supplies and healthcare services",
      createdDate: "2025-01-20"
    },
    {
      id: "B003",
      name: "Community Development 2025",
      amount: 300000,
      allocated: 180000,
      remaining: 120000,
      year: 2025,
      category: "Community",
      description: "Infrastructure and community programs",
      createdDate: "2025-02-01"
    },
    {
      id: "B004",
      name: "Emergency Relief Fund",
      amount: 200000,
      allocated: 50000,
      remaining: 150000,
      year: 2025,
      category: "Emergency",
      description: "Emergency response and disaster relief",
      createdDate: "2025-01-10"
    }
  ],

  programs: [
    {
      id: "P001",
      name: "School Supplies Distribution",
      description: "Providing educational materials to underprivileged schools",
      budget: 150000,
      spent: 120000,
      startDate: "2025-02-01",
      endDate: "2025-12-31",
      status: "active",
      beneficiaries: 5000,
      location: "Northern Region"
    },
    {
      id: "P002",
      name: "Mobile Health Clinics",
      description: "Medical outreach to remote communities",
      budget: 400000,
      spent: 280000,
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      status: "active",
      beneficiaries: 12000,
      location: "Rural Areas"
    },
    {
      id: "P003",
      name: "Clean Water Initiative",
      description: "Installing water wells in villages",
      budget: 180000,
      spent: 95000,
      startDate: "2025-03-01",
      endDate: "2025-11-30",
      status: "active",
      beneficiaries: 8000,
      location: "Eastern Province"
    },
    {
      id: "P004",
      name: "Adult Literacy Program",
      description: "Evening classes for adult education",
      budget: 80000,
      spent: 80000,
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      status: "completed",
      beneficiaries: 2500,
      location: "Urban Centers"
    },
    {
      id: "P005",
      name: "Food Security Project",
      description: "Agricultural training and seeds distribution",
      budget: 250000,
      spent: 45000,
      startDate: "2025-04-01",
      endDate: "2026-03-31",
      status: "active",
      beneficiaries: 10000,
      location: "Southern Region"
    }
  ],

  expenses: [
    {
      id: "E001",
      programId: "P001",
      programName: "School Supplies Distribution",
      description: "Textbooks and notebooks purchase",
      amount: 45000,
      category: "Materials",
      date: "2025-03-15",
      receipt: "REC-2025-001",
      approvedBy: "John Doe",
      status: "approved"
    },
    {
      id: "E002",
      programId: "P002",
      programName: "Mobile Health Clinics",
      description: "Medical equipment and supplies",
      amount: 125000,
      category: "Equipment",
      date: "2025-02-20",
      receipt: "REC-2025-002",
      approvedBy: "Jane Smith",
      status: "approved"
    },
    {
      id: "E003",
      programId: "P003",
      programName: "Clean Water Initiative",
      description: "Well drilling equipment rental",
      amount: 55000,
      category: "Equipment",
      date: "2025-04-10",
      receipt: "REC-2025-003",
      approvedBy: "John Doe",
      status: "approved"
    },
    {
      id: "E004",
      programId: "P001",
      programName: "School Supplies Distribution",
      description: "Transportation costs for distribution",
      amount: 18000,
      category: "Logistics",
      date: "2025-05-05",
      receipt: "REC-2025-004",
      approvedBy: "Jane Smith",
      status: "approved"
    },
    {
      id: "E005",
      programId: "P002",
      programName: "Mobile Health Clinics",
      description: "Staff salaries for medical personnel",
      amount: 85000,
      category: "Personnel",
      date: "2025-06-01",
      receipt: "REC-2025-005",
      approvedBy: "John Doe",
      status: "approved"
    },
    {
      id: "E006",
      programId: "P005",
      programName: "Food Security Project",
      description: "Seeds and farming tools",
      amount: 32000,
      category: "Materials",
      date: "2025-05-20",
      receipt: "REC-2025-006",
      approvedBy: "Jane Smith",
      status: "pending"
    },
    {
      id: "E007",
      programId: "P003",
      programName: "Clean Water Initiative",
      description: "Community training workshops",
      amount: 12000,
      category: "Training",
      date: "2025-06-15",
      receipt: "REC-2025-007",
      approvedBy: "John Doe",
      status: "approved"
    }
  ],

  reports: [
    {
      id: "R001",
      title: "Q1 2025 Financial Report",
      type: "financial",
      period: "January - March 2025",
      generatedDate: "2025-04-05",
      summary: "Total expenditure of $420,000 across all programs. Budget utilization at 84%.",
      totalBudget: 500000,
      totalSpent: 420000,
      programsCount: 4,
      beneficiariesReached: 15000
    },
    {
      id: "R002",
      title: "Q2 2025 Program Performance",
      type: "program",
      period: "April - June 2025",
      generatedDate: "2025-07-10",
      summary: "All active programs on track. Mobile Health Clinics reached 8,000 beneficiaries.",
      totalBudget: 550000,
      totalSpent: 380000,
      programsCount: 5,
      beneficiariesReached: 22000
    },
    {
      id: "R003",
      title: "Mid-Year Donor Report 2025",
      type: "donor",
      period: "January - June 2025",
      generatedDate: "2025-07-15",
      summary: "Comprehensive overview of donor contributions and program impact.",
      totalBudget: 1050000,
      totalSpent: 800000,
      programsCount: 5,
      beneficiariesReached: 37500
    },
    {
      id: "R004",
      title: "Annual Report 2024",
      type: "annual",
      period: "Full Year 2024",
      generatedDate: "2025-01-31",
      summary: "Successful year with 95% budget utilization and 50,000 beneficiaries reached.",
      totalBudget: 1800000,
      totalSpent: 1710000,
      programsCount: 8,
      beneficiariesReached: 50000
    }
  ]
};
