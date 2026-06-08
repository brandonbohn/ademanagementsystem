import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { budgetAPI, contentAPI } from '../services/api';
import { useContent } from '../contexts/ContentContext';
import './TabbedPage.css';

interface Budget {
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

export const BudgetsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    year: new Date().getFullYear(),
    amount: '',
    description: ''
  });
  const { content, refreshContent } = useContent();

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await contentAPI.deleteBudgetCategory(categoryId);
      await refreshContent();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetAPI.getAll();
      setBudgets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing budget
        const budget = budgets.find(b => b.id === editingId);
        const updatedBudget = {
          ...formData,
          amount: Number(formData.amount),
          allocated: budget?.allocated || 0,
          remaining: budget?.remaining || Number(formData.amount)
        };
        await budgetAPI.update(editingId, updatedBudget);
        setEditingId(null);
      } else {
        // Create new budget
        const newBudget = {
          ...formData,
          amount: Number(formData.amount),
        };
        await budgetAPI.create(newBudget);
      }
      await fetchBudgets();
      setFormData({
        name: '',
        category: '',
        year: new Date().getFullYear(),
        amount: '',
        description: ''
      });
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} budget`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setFormData({
      name: budget.name,
      category: budget.category,
      year: budget.year,
      amount: String(budget.amount),
      description: budget.description
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await budgetAPI.delete(id);
      await fetchBudgets();
    } catch (err: any) {
      console.error('Error deleting budget:', err);
      setError(err.message || 'Failed to delete budget');
      alert(`Error: ${err.message || 'Failed to delete budget'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: '',
      year: new Date().getFullYear(),
      amount: '',
      description: ''
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  const budgetsByCategory = (category: string) => 
    budgets.filter(b => b.category.toLowerCase() === category.toLowerCase());

  const categories = content?.budgets?.categories || [];

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {categories.map((cat: any) => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              className={`tab ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.name}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(cat.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#f44336',
                cursor: 'pointer',
                fontSize: '1.2rem',
                marginLeft: '0.5rem',
                padding: '0.25rem'
              }}
              title="Delete category"
            >
              ×
            </button>
          </div>
        ))}
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          + Add Budget
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading budgets...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'overview' && (
          <div className="form-layout">
            <h2>Budget Overview - {new Date().getFullYear()}</h2>
            <div className="budget-summary">
              <div className="summary-item">
                <span>Total Budget:</span>
                <span>${totalBudget.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Total Allocated:</span>
                <span>${totalAllocated.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span>Total Remaining:</span>
                <span>${totalRemaining.toLocaleString()}</span>
              </div>
            </div>
            
            <h3 style={{ marginTop: '2rem', color: '#fff' }}>Budgets by Category</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Budget Name</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Allocated</th>
                  <th>Remaining</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>No budgets found</td>
                  </tr>
                ) : (
                  budgets.map((budget) => (
                    <tr key={budget.id}>
                      <td>
                        <Link
                          to={`/budgets/${budget.id}`}
                          style={{ color: '#4caf8a', textDecoration: 'none', fontWeight: 500 }}
                          title="View detailed budget & reconciliation"
                        >
                          {budget.name}
                        </Link>
                      </td>
                      <td>{budget.category}</td>
                      <td>${budget.amount.toLocaleString()}</td>
                      <td>${budget.allocated.toLocaleString()}</td>
                      <td>${budget.remaining.toLocaleString()}</td>
                      <td>{budget.year}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(budget)}
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
                            onClick={() => handleDelete(budget.id)}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && categories.map((cat: any) => {
          if (activeTab === cat.id) {
            const categoryBudgets = budgetsByCategory(cat.name);
            const categoryTotal = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
            const categoryAllocated = categoryBudgets.reduce((sum, b) => sum + b.allocated, 0);
            const categoryRemaining = categoryBudgets.reduce((sum, b) => sum + b.remaining, 0);

            return (
              <div key={cat.id} className="form-layout">
                <h2>{cat.name}</h2>
                <div className="budget-summary">
                  <div className="summary-item">
                    <span>Total Budget:</span>
                    <span>${categoryTotal.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>Allocated:</span>
                    <span>${categoryAllocated.toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span>Remaining:</span>
                    <span>${categoryRemaining.toLocaleString()}</span>
                  </div>
                </div>
                <table className="data-table" style={{ marginTop: '2rem' }}>
                  <thead>
                    <tr>
                      <th>Budget Name</th>
                      <th>Amount</th>
                      <th>Allocated</th>
                      <th>Remaining</th>
                      <th>Year</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryBudgets.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center' }}>No {cat.name.toLowerCase()} budgets found</td>
                      </tr>
                    ) : (
                      categoryBudgets.map((budget) => (
                        <tr key={budget.id}>
                          <td>
                            <Link
                              to={`/budgets/${budget.id}`}
                              style={{ color: '#4caf8a', textDecoration: 'none', fontWeight: 500 }}
                              title="View detailed budget & reconciliation"
                            >
                              {budget.name}
                            </Link>
                          </td>
                          <td>${budget.amount.toLocaleString()}</td>
                          <td>${budget.allocated.toLocaleString()}</td>
                          <td>${budget.remaining.toLocaleString()}</td>
                          <td>{budget.year}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                className="edit-btn"
                                onClick={() => handleEdit(budget)}
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
                                onClick={() => handleDelete(budget.id)}
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            );
          }
          return null;
        })}

        {activeTab === 'add' && (
          <div className="form-layout">
            <h2>{editingId ? 'Edit Budget' : 'Create New Budget'}</h2>
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
                <label>Budget Name:</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter budget name" 
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
                  <option value="">Select category...</option>
                  {categories.length > 0 ? (
                    categories.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
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
                <label>Year:</label>
                <input 
                  type="number" 
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
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
                <label>Description:</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Budget description..."
                  required
                />
              </div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Budget' : 'Create Budget'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
