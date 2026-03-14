import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import type { Budget, Program, Expense, Report } from '../types';
import './Dashboard.css';

interface DashboardProps {
  budgets: Budget[];
  programs: Program[];
  expenses: Expense[];
  reports: Report[];
}

export const Dashboard = ({ budgets, programs, expenses, reports }: DashboardProps) => {
  const { content } = useContent();
  const hiddenRoutes = new Set(['/participants', '/girls', '/sponsorships']);
  const isExternalUrl = (value: string) => /^https?:\/\//i.test(value);
  const mergeMenuItems = (configured: any[] | undefined, defaults: any[]) => {
    const merged = (Array.isArray(configured) ? configured : []).filter(
      (item) => !hiddenRoutes.has(item.route)
    );
    const existingRoutes = new Set(merged.map((item) => item.route));

    defaults.forEach((item) => {
      if (!existingRoutes.has(item.route)) {
        merged.push(item);
      }
    });

    return merged;
  };

  const defaultQuickActions = [
    { id: 'donors', route: '/donors', icon: '🤝', label: 'Donor List', description: 'View and manage donor records' },
    { id: 'team', route: '/team', icon: '🧑‍🤝‍🧑', label: 'Team', description: 'Manage workforce and volunteers' },
    { id: 'donations', route: '/donations', icon: '💰', label: 'Donations', description: 'Track payments and receipts' },
    { id: 'grants', route: '/grants', icon: '📜', label: 'Grant Tracking', description: 'Track grant pipeline, awards, and utilization' },
    { id: 'website', route: 'https://adekiberafoundation.org', icon: '🌐', label: 'Website', description: 'Open ADE Kibera Foundation website' },
    { id: 'website-editor', route: 'https://adekiberafoundation.org/wp-admin', icon: '🛠️', label: 'Website Editor', description: 'Open website admin/editor page' },
  ];
  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const activePrograms = programs.filter(p => p.status === 'active').length;
  const totalBeneficiaries = programs.reduce((sum, p) => sum + p.beneficiaries, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;

  const dashboardConfig = content?.dashboard || {};
  const quickActions = mergeMenuItems(content?.navigation?.mainMenu, defaultQuickActions);

  return (
    <div className="dashboard">
      <h1>{dashboardConfig.title || 'NGO Dashboard Overview'}</h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>{dashboardConfig.description || ''}</p>
      
      {quickActions.length > 0 && (
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            {quickActions.map((action: any) => (
              isExternalUrl(action.route) ? (
                <a key={action.id} href={action.route} className="action-btn" target="_blank" rel="noreferrer">
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                  <span className="action-description">{action.description}</span>
                </a>
              ) : (
                <Link key={action.id} to={action.route} className="action-btn">
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                  <span className="action-description">{action.description}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card budget">
          <h3>Total Budget</h3>
          <p className="stat-value">${totalBudget.toLocaleString()}</p>
          <p className="stat-label">Allocated: ${totalAllocated.toLocaleString()}</p>
        </div>

        <div className="stat-card remaining">
          <h3>Remaining Funds</h3>
          <p className="stat-value">${totalRemaining.toLocaleString()}</p>
          <p className="stat-label">{((totalRemaining / totalBudget) * 100).toFixed(1)}% Available</p>
        </div>

        <div className="stat-card expenses">
          <h3>Total Expenses</h3>
          <p className="stat-value">${totalExpenses.toLocaleString()}</p>
          <p className="stat-label">{pendingExpenses} Pending Approval</p>
        </div>

        <div className="stat-card programs">
          <h3>Active Programs</h3>
          <p className="stat-value">{activePrograms}</p>
          <p className="stat-label">of {programs.length} Total</p>
        </div>

        <div className="stat-card beneficiaries">
          <h3>Beneficiaries Reached</h3>
          <p className="stat-value">{totalBeneficiaries.toLocaleString()}</p>
          <p className="stat-label">Across All Programs</p>
        </div>

        <div className="stat-card reports">
          <h3>Reports Generated</h3>
          <p className="stat-value">{reports.length}</p>
          <p className="stat-label">Latest: {reports[0]?.generatedDate}</p>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Programs</h2>
        <div className="recent-programs">
          {programs.slice(0, 3).map(program => (
            <div key={program.id} className="recent-item">
              <h4>{program.name}</h4>
              <p>{program.description}</p>
              <div className="program-stats">
                <span className={`status ${program.status}`}>{program.status}</span>
                <span>Budget: ${program.budget.toLocaleString()}</span>
                <span>Beneficiaries: {program.beneficiaries}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Expenses</h2>
        <div className="recent-expenses">
          {expenses.slice(0, 5).map(expense => (
            <div key={expense.id} className="recent-item expense-item">
              <div className="expense-header">
                <h4>{expense.description}</h4>
                <span className={`status ${expense.status}`}>{expense.status}</span>
              </div>
              <p className="expense-program">{expense.programName}</p>
              <div className="expense-details">
                <span className="amount">${expense.amount.toLocaleString()}</span>
                <span className="date">{expense.date}</span>
                <span className="category">{expense.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
