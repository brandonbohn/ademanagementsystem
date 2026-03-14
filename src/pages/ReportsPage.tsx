import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, programAPI, expenseAPI, budgetAPI } from '../services/api';
import { useContent } from '../contexts/ContentContext';
import './TabbedPage.css';
import './ExpensesPage.css';

interface Report {
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

type ReportForm = {
  title: string;
  type: Report['type'];
  period: string;
  summary: string;
};

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [reports, setReports] = useState<Report[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState<ReportForm>({
    title: '',
    type: 'financial',
    period: '',
    summary: ''
  });
  const { content } = useContent();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsData, programsData, expensesData, budgetsData] = await Promise.all([
        reportAPI.getAll(),
        programAPI.getAll(),
        expenseAPI.getAll(),
        budgetAPI.getAll()
      ]);
      setReports(reportsData);
      setPrograms(programsData);
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Calculate totals from existing data
      const totalBudget = programs.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
      const totalSpent = programs.reduce((sum: number, p: any) => sum + (p.spent || 0), 0);
      const programsCount = programs.length;
      const beneficiariesReached = programs.reduce((sum: number, p: any) => sum + (p.beneficiaries || 0), 0);

      if (editingId) {
        // Update existing report
        const report = reports.find(r => r.id === editingId);
        const updatedReport = {
          ...formData,
          generatedDate: report?.generatedDate || new Date().toISOString().split('T')[0],
          totalBudget,
          totalSpent,
          programsCount,
          beneficiariesReached
        };
        await reportAPI.update(editingId, updatedReport);
        setEditingId(null);
      } else {
        // Create new report
        const newReport = {
          id: `R${String(reports.length + 1).padStart(3, '0')}`,
          ...formData,
          generatedDate: new Date().toISOString().split('T')[0],
          totalBudget,
          totalSpent,
          programsCount,
          beneficiariesReached
        };
        await reportAPI.create(newReport);
      }
      
      await fetchData();
      setFormData({
        title: '',
        type: 'financial',
        period: '',
        summary: ''
      });
      setActiveTab('view');
    } catch (err: any) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} report`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (report: Report) => {
    setEditingId(report.id);
    setFormData({
      title: report.title,
      type: report.type,
      period: report.period,
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
      console.error('Error deleting report:', err);
      setError(err.message || 'Failed to delete report');
      alert(`Error: ${err.message || 'Failed to delete report'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      type: 'financial',
      period: '',
      summary: ''
    });
  };

  const reportTypes = content?.reports?.types || [];
  const filterByType = (type: string) => reports.filter(r => r.type === type);

  const viewReportDetails = (report: Report) => {
    setSelectedReport(report);
    setActiveTab('details');
  };

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => { setActiveTab('view'); setSelectedReport(null); }}
        >
          All Reports
        </button>
        {selectedReport && (
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📊 {selectedReport.title}
          </button>
        )}
        <button 
          className={`tab ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => { setActiveTab('generate'); setSelectedReport(null); }}
        >
          + Generate Report
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading reports...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout">
            <div style={{ backgroundColor: 'red', color: 'white', padding: '1rem', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              🔴 DEBUG: If you see this, the ReportsPage code is loading correctly!
            </div>
            <h2>All Reports</h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px', maxWidth: '250px', backgroundColor: '#2196F3', color: 'white', fontWeight: 'bold' }}>⚡ ACTIONS</th>
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
                      <td style={{ backgroundColor: '#fff3cd', padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', visibility: 'visible' }}>
                          <button 
                            className="edit-btn"
                            onClick={() => viewReportDetails(report)}
                            style={{
                              display: 'inline-block !important',
                              padding: '0.6rem 1rem !important',
                              backgroundColor: '#4CAF50 !important',
                              color: 'white !important',
                              border: '3px solid #000 !important',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '1rem !important',
                              fontWeight: 'bold !important'
                            }}
                          >
                            👁️ VIEW
                          </button>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(report)}
                            style={{
                              display: 'inline-block !important',
                              padding: '0.6rem 1rem !important',
                              backgroundColor: '#2196F3 !important',
                              color: 'white !important',
                              border: '3px solid #000 !important',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '1rem !important',
                              fontWeight: 'bold !important'
                            }}
                          >
                            ✏️ EDIT
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(report.id)}
                            style={{
                              display: 'inline-block !important',
                              padding: '0.6rem 1rem !important',
                              backgroundColor: '#f44336 !important',
                              color: 'white !important',
                              border: '3px solid #000 !important',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '1rem !important',
                              fontWeight: 'bold !important'
                            }}
                          >
                            🗑️ DELETE
                          </button>
                        </div>
                      </td>
                      <td>{report.title}</td>
                      <td><span className="category-badge">{report.type}</span></td>
                      <td>{report.period}</td>
                      <td>{new Date(report.generatedDate).toLocaleDateString()}</td>
                      <td>${report.totalBudget.toLocaleString()}</td>
                      <td>${report.totalSpent.toLocaleString()}</td>
                      <td>{report.programsCount}</td>
                      <td>{report.beneficiariesReached}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {reportTypes.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Reports by Type</h3>
                {reportTypes.map((type: any) => {
                  const typeReports = filterByType(type.value);
                  if (typeReports.length === 0) return null;

                  return (
                    <div key={type.value} style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: '#2196F3', marginBottom: '0.5rem' }}>
                        {type.icon} {type.label} ({typeReports.length})
                      </h4>
                      <ul style={{ color: '#fff', listStyle: 'none', padding: 0 }}>
                        {typeReports.map(report => (
                          <li key={report.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
                            {report.title} - {report.period}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && selectedReport && (
          <div className="form-layout">
            <div style={{ marginBottom: '2rem' }}>
              <h2>{selectedReport.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px', marginTop: '1rem' }}>
                <div style={{ color: '#fff' }}>
                  <strong>Type:</strong> <span className="category-badge">{selectedReport.type}</span>
                </div>
                <div style={{ color: '#fff' }}>
                  <strong>Period:</strong> {selectedReport.period}
                </div>
                <div style={{ color: '#fff' }}>
                  <strong>Generated:</strong> {new Date(selectedReport.generatedDate).toLocaleDateString()}
                </div>
                <div style={{ color: '#fff' }}>
                  <strong>Total Budget:</strong> ${selectedReport.totalBudget.toLocaleString()}
                </div>
                <div style={{ color: '#fff' }}>
                  <strong>Total Spent:</strong> ${selectedReport.totalSpent.toLocaleString()}
                </div>
                <div style={{ color: '#fff' }}>
                  <strong>Programs:</strong> {selectedReport.programsCount}
                </div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px', marginTop: '1rem' }}>
                <strong style={{ color: '#fff' }}>Summary:</strong>
                <p style={{ color: '#ccc', marginTop: '0.5rem' }}>{selectedReport.summary}</p>
              </div>
            </div>

            <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>
              {selectedReport.type === 'financial' ? '💰 Expenses' : 
               selectedReport.type === 'program' ? '📋 Programs' :
               selectedReport.type === 'donor' ? '💝 Donor Budgets' :
               '📊 Data'}
            </h3>

            {selectedReport.type === 'financial' || selectedReport.type === 'quarterly' || selectedReport.type === 'annual' ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Program</th>
                      <th>Status</th>
                      <th>Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center' }}>No expenses found</td></tr>
                    ) : (
                      expenses.map((expense: any) => (
                        <tr key={expense.id}>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td>{expense.description}</td>
                          <td><span className="category-badge">{expense.category}</span></td>
                          <td className="amount-cell">${expense.amount.toLocaleString()}</td>
                          <td>{expense.programName}</td>
                          <td><span className={`status-badge status-${expense.status}`}>{expense.status}</span></td>
                          <td>{expense.vendor || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : selectedReport.type === 'program' ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Program Name</th>
                      <th>Description</th>
                      <th>Budget</th>
                      <th>Spent</th>
                      <th>Location</th>
                      <th>Beneficiaries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: 'center' }}>No programs found</td></tr>
                    ) : (
                      programs.map((program: any) => (
                        <tr key={program.id}>
                          <td>{program.id}</td>
                          <td>{program.name}</td>
                          <td>{program.description}</td>
                          <td className="amount-cell">${program.budget?.toLocaleString() || 0}</td>
                          <td className="amount-cell">${program.spent?.toLocaleString() || 0}</td>
                          <td>{program.location || '-'}</td>
                          <td>{program.beneficiaries?.toLocaleString() || 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : selectedReport.type === 'donor' ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Allocated</th>
                      <th>Spent</th>
                      <th>Remaining</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center' }}>No budget data found</td></tr>
                    ) : (
                      budgets.map((budget: any) => (
                        <tr key={budget.id}>
                          <td>{budget.id}</td>
                          <td><span className="category-badge">{budget.category}</span></td>
                          <td className="amount-cell">${budget.allocated?.toLocaleString() || 0}</td>
                          <td className="amount-cell">${budget.spent?.toLocaleString() || 0}</td>
                          <td className="amount-cell">${(budget.allocated - budget.spent)?.toLocaleString() || 0}</td>
                          <td><span className={`status-badge`}>{budget.status || 'active'}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="form-layout">
            <h2>{editingId ? 'Edit Report' : 'Generate New Report'}</h2>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel Edit
              </button>
            )}
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Report Title:</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter report title" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Report Type:</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  {reportTypes.length > 0 ? (
                    reportTypes.map((type: any) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="financial">Financial</option>
                      <option value="program">Program</option>
                      <option value="donor">Donor</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </>
                  )}
                </select>
              </div>
              <div className="form-row">
                <label>Period:</label>
                <input 
                  type="text" 
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  placeholder="e.g., Q1 2026, Jan-Mar 2026" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Summary:</label>
                <textarea 
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  placeholder="Enter report summary..."
                  required
                  rows={5}
                />
              </div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Report' : 'Generate Report'}</button>
            </form>

            {programs.length > 0 && (
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Current Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#fff' }}>
                  <div>
                    <strong>Total Programs:</strong> {programs.length}
                  </div>
                  <div>
                    <strong>Total Budget:</strong> ${programs.reduce((sum: number, p: any) => sum + (p.budget || 0), 0).toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Spent:</strong> ${programs.reduce((sum: number, p: any) => sum + (p.spent || 0), 0).toLocaleString()}
                  </div>
                  <div>
                    <strong>Total Beneficiaries:</strong> {programs.reduce((sum: number, p: any) => sum + (p.beneficiaries || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};