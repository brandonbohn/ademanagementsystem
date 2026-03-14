import type { ViewType } from '../types';
import './Navigation.css';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2>ADE Donor Management System</h2>
      </div>
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${currentView === 'budgets' ? 'active' : ''}`}
          onClick={() => onViewChange('budgets')}
        >
          Budgets
        </button>
        <button 
          className={`nav-button ${currentView === 'programs' ? 'active' : ''}`}
          onClick={() => onViewChange('programs')}
        >
          Programs
        </button>
        <button 
          className={`nav-button ${currentView === 'expenses' ? 'active' : ''}`}
          onClick={() => onViewChange('expenses')}
        >
          Expenses
        </button>
        <button 
          className={`nav-button ${currentView === 'reports' ? 'active' : ''}`}
          onClick={() => onViewChange('reports')}
        >
          Reports
        </button>
      </div>
    </nav>
  );
};
