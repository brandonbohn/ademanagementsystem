import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI, programAPI } from '../services/api';
import { useContent } from '../contexts/ContentContext';
import './TabbedPage.css';
import './ExpensesPage.css';

interface Expense {
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
  vendor?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  notes?: string;
}

interface Program {
  id: string;
  name: string;
}

export const ExpensesPage = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    programId: '',
    description: '',
    amount: '',
    category: '',
    date: '',
    vendor: '',
    receiptNumber: '',
    paymentMethod: '',
    approvedBy: '',
    notes: ''
  });
  const { content } = useContent();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, programsData] = await Promise.all([
        expenseAPI.getAll(),
        programAPI.getAll()
      ]);
      setExpenses(expensesData);
      setPrograms(programsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyExpenses = () => {
    const monthlyTotals: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });
    return Object.entries(monthlyTotals).map(([month, amount]) => ({ month, amount }));
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyExpenses = getMonthlyExpenses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const program = programs.find(p => p.id === formData.programId);
      
      if (editingId) {
        // Update existing expense
        const expense = expenses.find(exp => exp.id === editingId);
        const updatedExpense = {
          ...formData,
          programName: program?.name || '',
          amount: Number(formData.amount),
          receipt: formData.receiptNumber || 'N/A',
          status: expense?.status || 'pending' as const
        };
        await expenseAPI.update(editingId, updatedExpense);
        setEditingId(null);
      } else {
        // Create new expense
        const newExpense = {
          id: `E${String(expenses.length + 1).padStart(3, '0')}`,
          ...formData,
          programName: program?.name || '',
          amount: Number(formData.amount),
          receipt: formData.receiptNumber || 'N/A',
          status: 'pending' as const
        };
        await expenseAPI.create(newExpense);
      }
      await fetchData();
      setFormData({
        programId: '',
        description: '',
        amount: '',
        category: '',
        date: '',
        vendor: '',
        receiptNumber: '',
        paymentMethod: '',
        approvedBy: '',
        notes: ''
      });
      setAddingNew(false);
    } catch (err: any) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} expense`);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      programId: expense.programId,
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      vendor: expense.vendor || '',
      receiptNumber: expense.receiptNumber || '',
      paymentMethod: expense.paymentMethod || '',
      approvedBy: expense.approvedBy || '',
      notes: expense.notes || ''
    });
    setAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await expenseAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError(err.message || 'Failed to delete expense');
      alert(`Error: ${err.message || 'Failed to delete expense'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAddingNew(false);
    setFormData({
      programId: '',
      description: '',
      amount: '',
      category: '',
      date: '',
      vendor: '',
      receiptNumber: '',
      paymentMethod: '',
      approvedBy: '',
      notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const categories = content?.expenses?.categories || [];
  const paymentMethods = content?.expenses?.paymentMethods || [];

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading expenses...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'expenses' && (
          <div className="expenses-overview">
            <div className="expense-actions">
              <button 
                className="action-btn"
                onClick={() => setAddingNew(true)}
              >
                + Add New Expense
              </button>
            </div>

            {monthlyExpenses.length > 0 && (
              <div className="expense-chart-section">
                <h2>Monthly Expenses - {new Date().getFullYear()}</h2>
                <div className="chart-container">
                  {monthlyExpenses.map((item) => {
                    const maxAmount = Math.max(...monthlyExpenses.map(e => e.amount), 1);
                    const barHeight = (item.amount / maxAmount) * 100;
                    
                    return (
                      <div key={item.month} className="chart-bar">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${barHeight}%` }}
                          title={`$${item.amount.toLocaleString()}`}
                        >
                          <span className="bar-value">${(item.amount / 1000).toFixed(0)}k</span>
                        </div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-total">
                  <strong>Total Expenses:</strong> ${totalExpenses.toLocaleString()}
                </div>
              </div>
            )}

            <div className="expense-table-section">
              <h2>Expense Records</h2>
              
              {addingNew && (
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={handleCancelEdit}
                      style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <form onSubmit={handleSubmit} className="excel-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-row">
                        <label>Date:</label>
                        <input 
                          type="date" 
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required 
                        />
                      </div>
                      <div className="form-row">
                        <label>Description:</label>
                        <input 
                          type="text" 
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Description" 
                          required 
                        />
                      </div>
                      <div className="form-row">
                        <label>Category:</label>
                        <select 
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select...</option>
                          {categories.length > 0 ? (
                            categories.map((cat: string) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))
                          ) : (
                            <>
                             <option value="Programs">Programs</option> 
                      <option value="Activities">Projects</option>
                      <option value="Operations">Operations</option>
                      <option value="Field Activity Budget">Field Activity Budget</option>
                      <option value="Emergency Fund">Emergency Fund</option>
                      <option value="Income Generation">Income Generation</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Vendor:</label>
                        <input 
                          type="text" 
                          name="vendor"
                          value={formData.vendor}
                          onChange={handleInputChange}
                          placeholder="Vendor" 
                          required 
                        />
                      </div>
                      <div className="form-row">
                        <label>Amount:</label>
                        <input 
                          type="number" 
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00" 
                          step="0.01" 
                          required 
                        />
                      </div>
                      <div className="form-row">
                        <label>Program:</label>
                        <select 
                          name="programId"
                          value={formData.programId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select program...</option>
                          {programs.map((prog) => (
                            <option key={prog.id} value={prog.id}>{prog.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Receipt #:</label>
                        <input 
                          type="text" 
                          name="receiptNumber"
                          value={formData.receiptNumber}
                          onChange={handleInputChange}
                          placeholder="Receipt #" 
                        />
                      </div>
                      <div className="form-row">
                        <label>Payment Method:</label>
                        <select 
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select...</option>
                          {paymentMethods.length > 0 ? (
                            paymentMethods.map((method: string) => (
                              <option key={method} value={method}>{method}</option>
                            ))
                          ) : (
                            <>
                              <option value="Cash">Cash</option>
                              <option value="Check">Check</option>
                              <option value="Credit Card">Credit Card</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Approved By:</label>
                        <input 
                          type="text" 
                          name="approvedBy"
                          value={formData.approvedBy}
                          onChange={handleInputChange}
                          placeholder="Approver name" 
                          required 
                        />
                      </div>
                      <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                        <label>Notes:</label>
                        <textarea 
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Notes"
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                      <button type="submit" className="action-btn">{editingId ? 'Update Expense' : 'Add Expense'}</button>
                      <button type="button" className="action-btn cancel-btn" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <table className="data-table expense-detail-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center' }}>No expenses found</td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="edit-btn"
                              onClick={() => handleEdit(expense)}
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
                            <button 
                              className="delete-btn"
                              onClick={() => handleDelete(expense.id)}
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
                          </div>
                        </td>
                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                        <td>{expense.description}</td>
                        <td><span className="category-badge">{expense.category}</span></td>
                        <td>{expense.vendor || '-'}</td>
                        <td className="amount-cell">${expense.amount.toLocaleString()}</td>
                        <td>{expense.programName}</td>
                        <td>
                          <span className={`status-badge status-${expense.status}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td>{expense.paymentMethod || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                    <td className="amount-cell total-amount" colSpan={4}>
                      ${totalExpenses.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
