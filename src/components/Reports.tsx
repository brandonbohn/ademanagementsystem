import { useState } from 'react';
import type { Report } from '../types';
import { reportAPI, programAPI, expenseAPI, budgetAPI } from '../services/api';
import './Reports.css';
import '../pages/ExpensesPage.css';

interface ReportsProps {
  reports: Report[];
  onEdit?: (report: Report) => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
}

export const Reports = ({ reports, onEdit, onDelete, onRefresh }: ReportsProps) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleViewReport = async (report: Report) => {
    setSelectedReport(report);
    setLoading(true);
    try {
      const [expensesData, programsData, budgetsData] = await Promise.all([
        expenseAPI.getAll(),
        programAPI.getAll(),
        budgetAPI.getAll()
      ]);
      setExpenses(expensesData);
      setPrograms(programsData);
      setBudgets(budgetsData);
    } catch (err) {
      console.error('Error loading report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportAPI.delete(id);
      if (onRefresh) onRefresh();
      if (selectedReport?.id === id) setSelectedReport(null);
    } catch (err: any) {
      console.error('Error deleting report:', err);
      alert(`Error: ${err.message || 'Failed to delete report'}`);
    }
  };

  if (selectedReport) {
    return (
      <div className="reports">
        <button 
          onClick={() => setSelectedReport(null)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          ← Back to All Reports
        </button>

        <h1>{selectedReport.title}</h1>
        
        <div className="reports-summary">
          <div className="summary-card">
            <h3>Type</h3>
            <p className="summary-value">{selectedReport.type}</p>
          </div>
          <div className="summary-card">
            <h3>Period</h3>
            <p className="summary-value">{selectedReport.period}</p>
          </div>
          <div className="summary-card">
            <h3>Total Budget</h3>
            <p className="summary-value">${selectedReport.totalBudget.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p className="summary-value">${selectedReport.totalSpent.toLocaleString()}</p>
          </div>
        </div>

        <div style={{ padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px', marginBottom: '2rem' }}>
          <strong style={{ color: '#fff' }}>Summary:</strong>
          <p style={{ color: '#ccc', marginTop: '0.5rem' }}>{selectedReport.summary}</p>
        </div>

        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
          {selectedReport.type === 'financial' ? '💰 Expenses' : 
           selectedReport.type === 'program' ? '📋 Programs' :
           selectedReport.type === 'donor' ? '💝 Donor Budgets' :
           '📊 Data'}
        </h2>

        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading data...</p>
        ) : selectedReport.type === 'financial' || selectedReport.type === 'quarterly' || selectedReport.type === 'annual' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff' }}>
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
                      <td>${expense.amount.toLocaleString()}</td>
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
            <table className="data-table" style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff' }}>
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
                      <td>${program.budget?.toLocaleString() || 0}</td>
                      <td>${program.spent?.toLocaleString() || 0}</td>
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
            <table className="data-table" style={{ width: '100%', backgroundColor: '#1a1a1a', color: '#fff' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Allocated</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center' }}>No budget data found</td></tr>
                ) : (
                  budgets.map((budget: any) => (
                    <tr key={budget.id}>
                      <td>{budget.id}</td>
                      <td><span className="category-badge">{budget.category}</span></td>
                      <td>${budget.allocated?.toLocaleString() || 0}</td>
                      <td>${budget.spent?.toLocaleString() || 0}</td>
                      <td>${(budget.allocated - budget.spent)?.toLocaleString() || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    );
  }
  const latestReport = reports[0];
  const reportsByType = reports.reduce((acc, report) => {
    if (!acc[report.type]) {
      acc[report.type] = 0;
    }
    acc[report.type]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="reports">
      <h1>Reports Management</h1>
      
      <div className="reports-summary">
        <div className="summary-card">
          <h3>Total Reports</h3>
          <p className="summary-value">{reports.length}</p>
        </div>
        <div className="summary-card">
          <h3>Latest Report</h3>
          <p className="summary-value latest">{latestReport?.generatedDate}</p>
        </div>
        {Object.entries(reportsByType).map(([type, count]) => (
          <div key={type} className="summary-card">
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <p className="summary-value">{count}</p>
          </div>
        ))}
      </div>

      <div className="reports-list">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div>
                <h3>{report.title}</h3>
                <span className="report-id">{report.id}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`type-badge ${report.type}`}>{report.type}</span>
              </div>
            </div>
            
            <div className="report-meta">
              <div className="meta-item">
                <span className="meta-label">Period</span>
                <span className="meta-value">{report.period}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Generated</span>
                <span className="meta-value">{report.generatedDate}</span>
              </div>
            </div>

            <p className="report-summary">{report.summary}</p>
            
            <div className="report-stats">
              <div className="stat-item">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">${report.totalBudget.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value spent">${report.totalSpent.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Programs</span>
                <span className="stat-value">{report.programsCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Beneficiaries</span>
                <span className="stat-value">{report.beneficiariesReached.toLocaleString()}</span>
              </div>
            </div>

            <div className="report-utilization">
              <div className="utilization-bar">
                <div 
                  className="utilization-fill" 
                  style={{ width: `${(report.totalSpent / report.totalBudget) * 100}%` }}
                ></div>
              </div>
              <span className="utilization-label">
                {((report.totalSpent / report.totalBudget) * 100).toFixed(1)}% Budget Utilization
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button 
                className="edit-btn"
                onClick={() => handleViewReport(report)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}
              >
                👁️ View Report Data
              </button>
              {onEdit && (
                <button 
                  className="edit-btn"
                  onClick={() => onEdit(report)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  ✏️ Edit
                </button>
              )}
              {onDelete && (
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(report.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
