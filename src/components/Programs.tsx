import type { Program } from '../types';
import './Programs.css';

interface ProgramsProps {
  programs: Program[];
}

export const Programs = ({ programs }: ProgramsProps) => {
  const activePrograms = programs.filter(p => p.status === 'active').length;
  const totalBudget = programs.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = programs.reduce((sum, p) => sum + p.spent, 0);
  const totalBeneficiaries = programs.reduce((sum, p) => sum + p.beneficiaries, 0);

  return (
    <div className="programs">
      <h1>Programs Management</h1>
      
      <div className="programs-summary">
        <div className="summary-card">
          <h3>Active Programs</h3>
          <p className="summary-value">{activePrograms} / {programs.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="summary-value">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="summary-value">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Beneficiaries</h3>
          <p className="summary-value">{totalBeneficiaries.toLocaleString()}</p>
        </div>
      </div>

      <div className="programs-list">
        {programs.map(program => {
          const spentPercent = (program.spent / program.budget) * 100;
          const remaining = program.budget - program.spent;
          
          return (
            <div key={program.id} className="program-card">
              <div className="program-header">
                <div>
                  <h3>{program.name}</h3>
                  <span className="program-id">{program.id}</span>
                </div>
                <span className={`status-badge ${program.status}`}>{program.status}</span>
              </div>
              
              <p className="program-description">{program.description}</p>
              
              <div className="program-info">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{program.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Beneficiaries</span>
                    <span className="info-value">{program.beneficiaries.toLocaleString()}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">{program.startDate}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">End Date</span>
                    <span className="info-value">{program.endDate}</span>
                  </div>
                </div>
              </div>

              <div className="program-budget">
                <div className="budget-row">
                  <span className="budget-label">Budget</span>
                  <span className="budget-value">${program.budget.toLocaleString()}</span>
                </div>
                <div className="budget-row spent">
                  <span className="budget-label">Spent</span>
                  <span className="budget-value">${program.spent.toLocaleString()}</span>
                </div>
                <div className="budget-row remaining">
                  <span className="budget-label">Remaining</span>
                  <span className="budget-value">${remaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="program-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(spentPercent, 100)}%` }}
                  ></div>
                </div>
                <span className="progress-label">{spentPercent.toFixed(1)}% of Budget Used</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
