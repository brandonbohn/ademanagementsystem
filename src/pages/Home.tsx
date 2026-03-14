import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import './Home.css';

export const Home = () => {
  const { content, loading } = useContent();

  const mergeMenuItems = (configured: any[] | undefined, defaults: any[]) => {
    const merged = [...(Array.isArray(configured) ? configured : [])];
    const existingRoutes = new Set(merged.map((item) => item.route));

    defaults.forEach((item) => {
      if (!existingRoutes.has(item.route)) {
        merged.push(item);
      }
    });

    return merged;
  };

  if (loading) {
    return (
      <div className="home-page">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const systemInfo = content?.systemInfo || {
    name: 'ADE Donor Management System',
    tagline: 'Welcome to your management dashboard'
  };

  const defaultMenuItems = [
    { id: 'dashboard', route: '/dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'budgets', route: '/budgets', icon: '💼', label: 'Budgets' },
    { id: 'programs', route: '/programs', icon: '📁', label: 'Programs' },
    { id: 'expenses', route: '/expenses', icon: '💸', label: 'Expenses' },
    { id: 'reports', route: '/reports', icon: '📑', label: 'Reports' },
    { id: 'donors', route: '/donors', icon: '🤝', label: 'Donor List' },
    { id: 'participants', route: '/participants', icon: '🧒', label: 'Participant List' },
    { id: 'girls', route: '/girls', icon: '👧', label: 'Sponsorship Candidates' },
    { id: 'sponsorships', route: '/sponsorships', icon: '💞', label: 'Sponsorships' },
    { id: 'donations', route: '/donations', icon: '💰', label: 'Donations' },
    { id: 'team', route: '/team', icon: '🧑‍🤝‍🧑', label: 'Employee / Volunteer List' }
  ];

  const configuredMenuItems = content?.navigation?.mainMenu;
  const menuItems = mergeMenuItems(configuredMenuItems, defaultMenuItems);

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>{systemInfo.name}</h1>
        <p>{systemInfo.tagline}</p>
      </header>
      
      <div className="home-buttons">
        {menuItems.map((item: any) => (
          <Link key={item.id} to={item.route} className="home-btn">
            <span className="btn-icon">{item.icon}</span>
            <span className="btn-text">{item.label}</span>
          </Link>
        ))}
        
        <Link to="/" className="home-btn">
          <span className="btn-icon">🏠</span>
          <span className="btn-text">Homepage</span>
        </Link>
      </div>
    </div>
  );
};
