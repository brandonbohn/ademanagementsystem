import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  reportAPI,
  programAPI,
  expenseAPI,
  budgetAPI,
  donorAPI,
  donationAPI,
  sponsorshipAPI
} from '../services/api';
import './TabbedPage.css';
import './ExpensesPage.css';

type ReportType = 'program' | 'financial' | 'donor' | 'donation' | 'sponsorship';

interface Report {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  generatedDate: string;
  summary: string;
  totalBudget: number;
  totalSpent: number;
  programsCount: number;
  beneficiariesReached: number;
}

type ReportForm = {
  title: string;
  type: ReportType;
  periodMonth: string;
  summary: string;
};

type Snapshot = {
  month: string;
  totalBudget: number;
  totalSpent: number;
  programsCount: number;
  beneficiariesReached: number;
  activePrograms: number;
  pendingExpenses: number;
  monthlyDonationsTotal: number;
  monthlyDonationsCount: number;
  monthlyDonorsCount: number;
  activeSponsorships: number;
  monthlySponsorshipAmount: number;
};

type BudgetLineItem = {
  id: string;
  category: string;
  description: string;
  detail?: string;
  frequency: 'monthly' | 'one-time';
  unitCost: number;
  qty: number;
};

const reportTypeOptions: Array<{ value: ReportType; label: string }> = [
  { value: 'program', label: 'Program Report (Monthly)' },
  { value: 'financial', label: 'Financial Report (Monthly)' },
  { value: 'donor', label: 'Donor Report (Monthly)' },
  { value: 'donation', label: 'Donation Report (Monthly)' },
  { value: 'sponsorship', label: 'Sponsorship Report (Monthly)' }
];

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const getMonthDateRange = (month: string) => {
  const [yearPart, monthPart] = month.split('-');
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const inMonth = (dateValue: string | undefined, month: string) => {
  if (!dateValue || !month) return false;
  const { start, end } = getMonthDateRange(month);
  const value = new Date(dateValue);
  return !Number.isNaN(value.getTime()) && value >= start && value <= end;
};

const overlapsMonth = (startDate: string | undefined, endDate: string | undefined, month: string) => {
  if (!startDate || !month) return false;
  const { start, end } = getMonthDateRange(month);
  const startValue = new Date(startDate);
  const endValue = endDate ? new Date(endDate) : end;
  if (Number.isNaN(startValue.getTime()) || Number.isNaN(endValue.getTime())) return false;
  return startValue <= end && endValue >= start;
};

const formatMonthLabel = (period: string) => {
  const [year, month] = period.split('-');
  if (!year || !month) return period;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

const parseBudgetLineItems = (description: string | undefined): BudgetLineItem[] => {
  if (!description) return [];
  try {
    const parsed = JSON.parse(description);
    if (!Array.isArray(parsed?.lineItems)) return [];
    return parsed.lineItems
      .map((item: any, index: number) => ({
        id: String(item?.id || `line-${index + 1}`),
        category: String(item?.category || 'General'),
        description: String(item?.description || 'Untitled Line Item'),
        detail: item?.detail ? String(item.detail) : undefined,
        frequency: item?.frequency === 'one-time' ? 'one-time' : 'monthly',
        unitCost: Number(item?.unitCost || 0),
        qty: Number(item?.qty || 1)
      }))
      .filter((item: BudgetLineItem) => item.unitCost >= 0 && item.qty >= 0);
  } catch {
    return [];
  }
};

const formatCurrency = (value: number) => `$${Number(value || 0).toLocaleString()}`;

const downloadTextFile = (filename: string, content: string, mime = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const buildSnapshot = (
  month: string,
  programsInput: unknown,
  expensesInput: unknown,
  budgetsInput: unknown,
  donationsInput: unknown,
  sponsorshipsInput: unknown
): Snapshot => {
  const programs = asArray<any>(programsInput);
  const expenses = asArray<any>(expensesInput);
  const budgets = asArray<any>(budgetsInput);
  const donations = asArray<any>(donationsInput);
  const sponsorships = asArray<any>(sponsorshipsInput);

  const monthlyPrograms = programs.filter((p) => overlapsMonth(p?.startDate, p?.endDate, month));
  const monthlyExpenses = expenses.filter((e) => inMonth(e?.date, month));
  const monthlyDonations = donations.filter((d) => inMonth(d?.date, month));
  const monthlySponsorships = sponsorships.filter((s) => overlapsMonth(s?.startDate, s?.endDate, month));

  const totalBudget =
    budgets.reduce((sum, b) => sum + Number(b?.amount || 0), 0) ||
    monthlyPrograms.reduce((sum, p) => sum + Number(p?.budget || 0), 0);

  const totalSpent =
    monthlyExpenses
      .filter((e) => e?.status === 'approved')
      .reduce((sum, e) => sum + Number(e?.amount || 0), 0) ||
    monthlyPrograms.reduce((sum, p) => sum + Number(p?.spent || 0), 0);

  const monthlyDonationsTotal = monthlyDonations
    .filter((d) => d?.status === 'received')
    .reduce((sum, d) => sum + Number(d?.amount || 0), 0);

  const monthlyDonorsCount = new Set(monthlyDonations.map((d) => d?.donorId).filter(Boolean)).size;

  return {
    month,
    totalBudget,
    totalSpent,
    programsCount: monthlyPrograms.length,
    beneficiariesReached: monthlyPrograms.reduce((sum, p) => sum + Number(p?.beneficiaries || 0), 0),
    activePrograms: monthlyPrograms.filter((p) => p?.status === 'active').length,
    pendingExpenses: monthlyExpenses.filter((e) => e?.status === 'pending').length,
    monthlyDonationsTotal,
    monthlyDonationsCount: monthlyDonations.length,
    monthlyDonorsCount,
    activeSponsorships: monthlySponsorships.filter((s) => s?.status === 'active').length,
    monthlySponsorshipAmount: monthlySponsorships.reduce((sum, s) => sum + Number(s?.amount || 0), 0)
  };
};

const buildSummary = (type: ReportType, snapshot: Snapshot) => {
  const period = formatMonthLabel(snapshot.month);
  const utilization = snapshot.totalBudget > 0 ? ((snapshot.totalSpent / snapshot.totalBudget) * 100).toFixed(1) : '0.0';

  if (type === 'program') {
    return `${period}: ${snapshot.activePrograms} active programs of ${snapshot.programsCount} total, reaching ${snapshot.beneficiariesReached.toLocaleString()} beneficiaries.`;
  }

  if (type === 'financial') {
    return `${period}: Spending is $${snapshot.totalSpent.toLocaleString()} against $${snapshot.totalBudget.toLocaleString()} budget (${utilization}% utilization), with ${snapshot.pendingExpenses} pending expenses.`;
  }

  if (type === 'donor') {
    return `${period}: ${snapshot.monthlyDonorsCount} active donors contributed this month; received donations totaled $${snapshot.monthlyDonationsTotal.toLocaleString()}.`;
  }

  if (type === 'donation') {
    return `${period}: ${snapshot.monthlyDonationsCount} donation transactions were logged, totaling $${snapshot.monthlyDonationsTotal.toLocaleString()} received.`;
  }

  return `${period}: ${snapshot.activeSponsorships} active sponsorships with $${snapshot.monthlySponsorshipAmount.toLocaleString()} committed value were tracked.`;
};

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'generate' | 'details'>('view');
  const [reports, setReports] = useState<Report[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [financialDurationMonths, setFinancialDurationMonths] = useState(6);
  const [autoPrintOnGenerate, setAutoPrintOnGenerate] = useState(true);
  const [formData, setFormData] = useState<ReportForm>({
    title: '',
    type: 'program',
    periodMonth: '',
    summary: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsData, programsData, expensesData, budgetsData, donorsData, donationsData, sponsorshipsData] = await Promise.all([
        reportAPI.getAll(),
        programAPI.getAll(),
        expenseAPI.getAll(),
        budgetAPI.getAll(),
        donorAPI.getAll(),
        donationAPI.getAll(),
        sponsorshipAPI.getAll()
      ]);

      setReports(asArray<Report>(reportsData));
      setPrograms(asArray(programsData));
      setExpenses(asArray(expensesData));
      setBudgets(asArray(budgetsData));
      setDonors(asArray(donorsData));
      setDonations(asArray(donationsData));
      setSponsorships(asArray(sponsorshipsData));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'generate') return;
    if (!formData.periodMonth) {
      if (formData.summary) setFormData((prev) => ({ ...prev, summary: '' }));
      return;
    }

    const snapshot = buildSnapshot(
      formData.periodMonth,
      programs,
      expenses,
      budgets,
      donations,
      sponsorships
    );

    const nextSummary = buildSummary(formData.type, snapshot);
    if (nextSummary !== formData.summary) {
      setFormData((prev) => ({ ...prev, summary: nextSummary }));
    }
  }, [activeTab, formData.type, formData.periodMonth, formData.summary, programs, expenses, budgets, donations, sponsorships]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.periodMonth) {
        throw new Error('Please select a month');
      }

      const snapshot = buildSnapshot(
        formData.periodMonth,
        programs,
        expenses,
        budgets,
        donations,
        sponsorships
      );

      const payload = {
        title: formData.title,
        type: formData.type,
        period: formData.periodMonth,
        summary: buildSummary(formData.type, snapshot),
        totalBudget: snapshot.totalBudget,
        totalSpent: snapshot.totalSpent,
        programsCount: snapshot.programsCount,
        beneficiariesReached: snapshot.beneficiariesReached,
        generatedDate: new Date().toISOString().split('T')[0]
      };

      let savedReportId = editingId;

      if (editingId) {
        await reportAPI.update(editingId, payload);
        setEditingId(null);
      } else {
        const reportId = `R${Date.now().toString().slice(-6)}`;
        await reportAPI.create({ id: reportId, ...payload });
        savedReportId = reportId;
      }

      await fetchData();
      setFormData({ title: '', type: 'program', periodMonth: '', summary: '' });

      const nextReport: Report = {
        id: String(savedReportId || `R${Date.now().toString().slice(-6)}`),
        ...payload
      };

      setSelectedReport(nextReport);
      setActiveTab('details');

      if (autoPrintOnGenerate) {
        setTimeout(() => window.print(), 120);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save report');
    }
  };

  const handleEdit = (report: Report) => {
    setEditingId(report.id);
    setFormData({
      title: report.title,
      type: report.type,
      periodMonth: report.period,
      summary: report.summary
    });
    setActiveTab('generate');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', type: 'program', periodMonth: '', summary: '' });
  };

  const filteredByType = (type: ReportType) => reports.filter((r) => r.type === type);

  const selectedMonthExpenses = selectedReport
    ? expenses.filter((expense) => inMonth(expense?.date, selectedReport.period))
    : [];
  const selectedMonthPrograms = selectedReport
    ? programs.filter((program) => overlapsMonth(program?.startDate, program?.endDate, selectedReport.period))
    : [];
  const selectedMonthDonations = selectedReport
    ? donations.filter((donation) => inMonth(donation?.date, selectedReport.period))
    : [];
  const selectedMonthSponsorships = selectedReport
    ? sponsorships.filter((sponsorship) => overlapsMonth(sponsorship?.startDate, sponsorship?.endDate, selectedReport.period))
    : [];

  const selectedReportYear = selectedReport?.period ? Number(selectedReport.period.split('-')[0]) : new Date().getFullYear();
  const selectedMonthApprovedExpenses = selectedMonthExpenses.filter((expense) => expense?.status === 'approved');
  const selectedMonthPendingExpenses = selectedMonthExpenses.filter((expense) => expense?.status === 'pending');

  const reportYearBudgets = selectedReport
    ? budgets.filter((budget) => Number(budget?.year) === selectedReportYear)
    : [];

  const financialLineItems = reportYearBudgets.flatMap((budget) =>
    parseBudgetLineItems(budget?.description).map((item) => ({
      ...item,
      budgetName: String(budget?.name || 'Unnamed Budget')
    }))
  );

  const monthlyEstimated = financialLineItems
    .filter((item) => item.frequency === 'monthly')
    .reduce((sum, item) => sum + item.unitCost * item.qty, 0);

  const oneTimeEstimated = financialLineItems
    .filter((item) => item.frequency === 'one-time')
    .reduce((sum, item) => sum + item.unitCost * item.qty, 0);

  const periodEstimatedTotal = monthlyEstimated + oneTimeEstimated;
  const annualizedEstimatedTotal = monthlyEstimated * financialDurationMonths + oneTimeEstimated;
  const periodActualTotal = selectedMonthApprovedExpenses.reduce((sum, expense) => sum + Number(expense?.amount || 0), 0);
  const variance = periodEstimatedTotal - periodActualTotal;
  const utilization = periodEstimatedTotal > 0 ? ((periodActualTotal / periodEstimatedTotal) * 100).toFixed(1) : '0.0';

  const handlePrintCurrentReport = () => {
    if (!selectedReport) return;
    setTimeout(() => window.print(), 50);
  };

  const buildCurrentReportExportPayload = () => {
    if (!selectedReport) return null;

    const base = {
      report: selectedReport,
      generatedAt: new Date().toISOString(),
      periodLabel: formatMonthLabel(selectedReport.period)
    };

    if (selectedReport.type === 'financial') {
      return {
        ...base,
        metrics: {
          estimatedMonthly: monthlyEstimated,
          estimatedOneTime: oneTimeEstimated,
          estimatedPeriodTotal: periodEstimatedTotal,
          estimatedProgramTotal: annualizedEstimatedTotal,
          actualApprovedTotal: periodActualTotal,
          variance,
          utilizationPercent: Number(utilization),
          approvedCount: selectedMonthApprovedExpenses.length,
          pendingCount: selectedMonthPendingExpenses.length
        },
        estimatedLineItems: financialLineItems,
        actualExpenses: selectedMonthExpenses
      };
    }

    if (selectedReport.type === 'program') {
      return { ...base, rows: selectedMonthPrograms };
    }

    if (selectedReport.type === 'donor') {
      return {
        ...base,
        rows: donors.map((donor) => {
          const donorMonth = selectedMonthDonations.filter((d) => d.donorId === donor.id);
          return {
            id: donor.id,
            fullName: donor.fullName,
            type: donor.type,
            status: donor.status,
            country: donor.country || '-',
            monthlyDonations: donorMonth.length,
            monthlyTotal: donorMonth.reduce((sum, d) => sum + Number(d.amount || 0), 0)
          };
        })
      };
    }

    if (selectedReport.type === 'donation') {
      return { ...base, rows: selectedMonthDonations };
    }

    return { ...base, rows: selectedMonthSponsorships };
  };

  const handleExportCurrentReportJson = () => {
    const payload = buildCurrentReportExportPayload();
    if (!payload || !selectedReport) return;
    const safeTitle = selectedReport.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fileName = `${safeTitle || 'report'}-${selectedReport.period}.json`;
    downloadTextFile(fileName, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  };

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => { setActiveTab('view'); setSelectedReport(null); }}>
          All Reports
        </button>
        {selectedReport && (
          <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
            {selectedReport.title}
          </button>
        )}
        <button className={`tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => { setActiveTab('generate'); setSelectedReport(null); }}>
          + Generate Report
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading reports...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout">
            <h2>All Reports</h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Report Title</th>
                    <th>Type</th>
                    <th>Period</th>
                    <th>Generated Date</th>
                    <th>Total Budget</th>
                    <th>Total Spent</th>
                    <th>Programs</th>
                    <th>Beneficiaries</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center' }}>No reports found</td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <button className="edit-btn" onClick={() => { setSelectedReport(report); setActiveTab('details'); }}>View</button>{' '}
                          <button className="edit-btn" onClick={() => { setSelectedReport(report); setActiveTab('details'); setTimeout(() => window.print(), 80); }}>Print</button>{' '}
                          <button className="edit-btn" onClick={() => handleEdit(report)}>Edit</button>{' '}
                          <button className="delete-btn" onClick={() => handleDelete(report.id)}>Delete</button>
                        </td>
                        <td>{report.title}</td>
                        <td><span className="category-badge">{report.type}</span></td>
                        <td>{formatMonthLabel(report.period)}</td>
                        <td>{new Date(report.generatedDate).toLocaleDateString()}</td>
                        <td>${Number(report.totalBudget || 0).toLocaleString()}</td>
                        <td>${Number(report.totalSpent || 0).toLocaleString()}</td>
                        <td>{report.programsCount}</td>
                        <td>{report.beneficiariesReached}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Reports by Type</h3>
              {reportTypeOptions.map((type) => {
                const list = filteredByType(type.value);
                if (list.length === 0) return null;
                return (
                  <div key={type.value} style={{ marginBottom: '0.5rem', color: '#9bd0ff' }}>
                    {type.label} ({list.length})
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'details' && selectedReport && (
          <div className="form-layout">
            <h2>{selectedReport.title}</h2>
            <p style={{ color: '#bbb' }}>{formatMonthLabel(selectedReport.period)} | {selectedReport.type}</p>
            <p style={{ color: '#ddd' }}>{selectedReport.summary}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="edit-btn" onClick={handlePrintCurrentReport}>Print / Save PDF</button>
              <button type="button" className="edit-btn" onClick={handleExportCurrentReportJson}>Export JSON</button>
            </div>

            {selectedReport.type === 'program' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Budget</th>
                    <th>Spent</th>
                    <th>Beneficiaries</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthPrograms.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No program records for this month</td></tr>
                  ) : (
                    selectedMonthPrograms.map((program) => (
                      <tr key={program.id}>
                        <td>{program.id}</td>
                        <td>{program.name}</td>
                        <td>${Number(program.budget || 0).toLocaleString()}</td>
                        <td>${Number(program.spent || 0).toLocaleString()}</td>
                        <td>{Number(program.beneficiaries || 0).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {selectedReport.type === 'financial' && (
              <>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ color: '#ddd' }}>
                    Program Duration:&nbsp;
                    <select
                      value={financialDurationMonths}
                      onChange={(e) => setFinancialDurationMonths(Number(e.target.value))}
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
                        <option key={m} value={m}>{m} months</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="edit-btn" onClick={() => window.print()}>
                    Print Report
                  </button>
                </div>

                <div className="budget-summary" style={{ marginBottom: '1.25rem' }}>
                  <div className="summary-item">
                    <span>Estimated ({formatMonthLabel(selectedReport.period)}):</span>
                    <span>{formatCurrency(periodEstimatedTotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Actual Approved Spend:</span>
                    <span>{formatCurrency(periodActualTotal)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Variance:</span>
                    <span style={{ color: variance >= 0 ? '#4caf50' : '#ff8a80' }}>
                      {variance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(variance))}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Utilization:</span>
                    <span>{utilization}%</span>
                  </div>
                  <div className="summary-item">
                    <span>{financialDurationMonths}-Month Budget:</span>
                    <span>{formatCurrency(annualizedEstimatedTotal)}</span>
                  </div>
                </div>

                <h3 style={{ color: '#fff', marginBottom: '0.75rem' }}>Estimated Budget Line Items</h3>
                <table className="data-table" style={{ marginBottom: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Budget</th>
                      <th>Category</th>
                      <th>Item</th>
                      <th>Frequency</th>
                      <th>Unit (KES)</th>
                      <th>Qty</th>
                      <th>Period Total (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialLineItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center' }}>
                          No structured line items found in budget descriptions for {selectedReportYear}. Add line items in Budget details and they will appear here.
                        </td>
                      </tr>
                    ) : (
                      financialLineItems.map((item, index) => {
                        const total = item.unitCost * item.qty;
                        return (
                          <tr key={`${item.id}-${index}`}>
                            <td>{(item as any).budgetName}</td>
                            <td>{item.category}</td>
                            <td>{item.description}</td>
                            <td>{item.frequency === 'monthly' ? 'Monthly' : 'One-Time'}</td>
                            <td>${item.unitCost.toLocaleString()}</td>
                            <td>{item.qty}</td>
                            <td>${total.toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <h3 style={{ color: '#fff', marginBottom: '0.75rem' }}>Actual Expenses ({formatMonthLabel(selectedReport.period)})</h3>
                <table className="data-table" style={{ marginBottom: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Program</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMonthExpenses.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center' }}>No expense records for this month</td></tr>
                    ) : (
                      selectedMonthExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description}</td>
                          <td>{expense.programName}</td>
                          <td>{expense.category}</td>
                          <td>${Number(expense.amount || 0).toLocaleString()}</td>
                          <td>{expense.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <div className="budget-summary">
                  <div className="summary-item">
                    <span>Approved Expenses:</span>
                    <span>{selectedMonthApprovedExpenses.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Pending Expenses:</span>
                    <span>{selectedMonthPendingExpenses.length}</span>
                  </div>
                  <div className="summary-item">
                    <span>Monthly Recurring Estimate:</span>
                    <span>${monthlyEstimated.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>One-Time Estimate:</span>
                    <span>${oneTimeEstimated.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            {selectedReport.type === 'donor' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Country</th>
                    <th>Monthly Donations</th>
                    <th>Monthly Total</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center' }}>No donor records found</td></tr>
                  ) : (
                    donors.map((donor) => {
                      const donorMonth = selectedMonthDonations.filter((d) => d.donorId === donor.id);
                      const donorTotal = donorMonth.reduce((sum, d) => sum + Number(d.amount || 0), 0);
                      return (
                        <tr key={donor.id}>
                          <td>{donor.fullName}</td>
                          <td>{donor.type}</td>
                          <td>{donor.status}</td>
                          <td>{donor.country || '-'}</td>
                          <td>{donorMonth.length}</td>
                          <td>${donorTotal.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {selectedReport.type === 'donation' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Donor</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthDonations.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No donation records for this month</td></tr>
                  ) : (
                    selectedMonthDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td>{new Date(donation.date).toLocaleDateString()}</td>
                        <td>{donation.donorName}</td>
                        <td>${Number(donation.amount || 0).toLocaleString()}</td>
                        <td>{donation.method}</td>
                        <td>{donation.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {selectedReport.type === 'sponsorship' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor</th>
                    <th>Candidate</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Frequency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthSponsorships.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center' }}>No sponsorship records for this month</td></tr>
                  ) : (
                    selectedMonthSponsorships.map((s) => (
                      <tr key={s.id}>
                        <td>{s.donorName}</td>
                        <td>{s.girlName}</td>
                        <td>{s.program}</td>
                        <td>${Number(s.amount || 0).toLocaleString()}</td>
                        <td>{s.frequency}</td>
                        <td>{s.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="form-layout">
            <h2>{editingId ? 'Edit Report' : 'Generate New Report'}</h2>
            <p style={{ color: '#bbb', marginBottom: '0.75rem' }}>
              Generated reports are saved to this Reports center and can be printed or exported.
            </p>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ marginBottom: '1rem' }}>
                Cancel Edit
              </button>
            )}
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Report Title:</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <label>Report Type:</label>
                <select name="type" value={formData.type} onChange={handleInputChange} required>
                  {reportTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Month:</label>
                <input type="month" name="periodMonth" value={formData.periodMonth} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <label>Summary:</label>
                <textarea name="summary" value={formData.summary} readOnly rows={5} required />
              </div>
              <div className="form-row" style={{ alignItems: 'center', gap: '0.5rem' }}>
                <input
                  id="autoPrintOnGenerate"
                  type="checkbox"
                  checked={autoPrintOnGenerate}
                  onChange={(e) => setAutoPrintOnGenerate(e.target.checked)}
                />
                <label htmlFor="autoPrintOnGenerate" style={{ marginBottom: 0 }}>
                  Automatically open Print dialog (Save as PDF) after generating report
                </label>
              </div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Report' : 'Generate Report'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
