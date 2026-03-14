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

      if (editingId) {
        await reportAPI.update(editingId, payload);
        setEditingId(null);
      } else {
        const reportId = `R${String(reports.length + 1).padStart(3, '0')}`;
        await reportAPI.create({ id: reportId, ...payload });
      }

      await fetchData();
      setFormData({ title: '', type: 'program', periodMonth: '', summary: '' });
      setActiveTab('view');
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
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Program</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthExpenses.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center' }}>No expense records for this month</td></tr>
                  ) : (
                    selectedMonthExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>{expense.description}</td>
                        <td>{expense.programName}</td>
                        <td>${Number(expense.amount || 0).toLocaleString()}</td>
                        <td>{expense.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              <button type="submit" className="submit-btn">{editingId ? 'Update Report' : 'Generate Report'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
