import type { Expense } from '../types';
import './Expenses.css';

interface ExpensesProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export const Expenses = ({ expenses, onEdit, onDelete }: ExpensesProps) => {
  const totalExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    if (expense.status === 'approved') {
      acc[expense.category] += expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="expenses">
      <h1>Expenses Management</h1>
      
      <div className="expenses-summary">
        <div className="summary-card">
          <h3>Total Approved</h3>
          <p className="summary-value">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Approved</h3>
          <p className="summary-value">{approvedExpenses}</p>
        </div>
        <div className="summary-card pending">
          <h3>Pending</h3>
          <p className="summary-value">{pendingExpenses}</p>
        </div>
        <div className="summary-card rejected">
          <h3>Rejected</h3>
          <p className="summary-value">{rejectedExpenses}</p>
        </div>
      </div>

      <div className="category-breakdown">
        <h2>Expenses by Category</h2>
        <div className="category-grid">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="category-card">
              <h4>{category}</h4>
              <p className="category-amount">${amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="expenses-list">
        <h2>All Expenses</h2>
        {expenses.map(expense => (
          <div key={expense.id} className="expense-card">
            <div className="expense-header">
              <div>
                <h3>{expense.description}</h3>
                <p className="expense-program">{expense.programName}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`status-badge ${expense.status}`}>{expense.status}</span>
                {(onEdit || onDelete) && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(expense)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this expense?')) {
                            onDelete(expense.id);
                          }
                        }}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="expense-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value amount">${expense.amount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value category-badge">{expense.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{expense.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Receipt</span>
                  <span className="detail-value">{expense.receipt}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Approved By</span>
                  <span className="detail-value">{expense.approvedBy}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Program ID</span>
                  <span className="detail-value">{expense.programId}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
