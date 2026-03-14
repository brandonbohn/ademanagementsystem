import type { Budget } from '../types';
import './Budgets.css';

interface BudgetsProps {
  budgets: Budget[];
}

export const Budgets = ({ budgets }: BudgetsProps) => {
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="budgets">
      <h1>Budget Management</h1>
      
      <div className="budget-summary">
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="summary-value">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Allocated</h3>
          <p className="summary-value">${totalAllocated.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining</h3>
          <p className="summary-value">${totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="budgets-list">
        {budgets.map(budget => {
          const utilizationPercent = (budget.allocated / budget.amount) * 100;
          
          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header">
                <h3>{budget.name}</h3>
                <span className="budget-id">{budget.id}</span>
              </div>
              
              <p className="budget-description">{budget.description}</p>
              
              <div className="budget-details">
                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value category-badge">{budget.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Year:</span>
                  <span className="value">{budget.year}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">{budget.createdDate}</span>
                </div>
              </div>

              <div className="budget-amounts">
                <div className="amount-item">
                  <span className="amount-label">Total Amount</span>
                  <span className="amount-value">${budget.amount.toLocaleString()}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Allocated</span>
                  <span className="amount-value allocated">${budget.allocated.toLocaleString()}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Remaining</span>
                  <span className="amount-value remaining">${budget.remaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="budget-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${utilizationPercent}%` }}
                  ></div>
                </div>
                <span className="progress-label">{utilizationPercent.toFixed(1)}% Utilized</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
