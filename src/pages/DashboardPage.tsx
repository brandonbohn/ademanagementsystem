import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dashboard as DashboardComponent } from '../components/Dashboard';
import { budgetAPI, programAPI, expenseAPI, reportAPI } from '../services/api';
import './DashboardPage.css';

export const DashboardPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [budgetsData, programsData, expensesData, reportsData] = await Promise.all([
          budgetAPI.getAll(),
          programAPI.getAll(),
          expenseAPI.getAll(),
          reportAPI.getAll()
        ]);
        
        setBudgets(budgetsData);
        setPrograms(programsData);
        setExpenses(expensesData);
        setReports(reportsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Link to="/home" className="home-link">🏠 Home</Link>
          <h1>Dashboard</h1>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
          <p>Loading data from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <Link to="/home" className="home-link">🏠 Home</Link>
          <h1>Dashboard</h1>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff0000' }}>
          <p>Error: {error}</p>
          <p style={{ color: '#999', marginTop: '1rem' }}>
            Make sure the backend is running and MongoDB is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/home" className="home-link">🏠 Home</Link>
        <h1>Dashboard</h1>
      </div>
      <DashboardComponent
        budgets={budgets}
        programs={programs}
        expenses={expenses}
        reports={reports}
      />
    </div>
  );
};
