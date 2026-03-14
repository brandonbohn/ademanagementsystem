import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import './Home.css';

export const Home = () => {
  const { content, loading } = useContent();
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
    { id: 'donations', route: '/donations', icon: '💰', label: 'Donations' },
    { id: 'grants', route: '/grants', icon: '📜', label: 'Grant Tracking' },
    { id: 'team', route: '/team', icon: '🧑‍🤝‍🧑', label: 'Team' },
    { id: 'website', route: 'https://adekiberafoundation.org', icon: '🌐', label: 'Website' },
    { id: 'website-editor', route: 'https://adekiberafoundation.org/wp-admin', icon: '🛠️', label: 'Website Editor' }
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
          isExternalUrl(item.route) ? (
            <a key={item.id} href={item.route} className="home-btn" target="_blank" rel="noreferrer">
              <span className="btn-icon">{item.icon}</span>
              <span className="btn-text">{item.label}</span>
            </a>
          ) : (
            <Link key={item.id} to={item.route} className="home-btn">
              <span className="btn-icon">{item.icon}</span>
              <span className="btn-text">{item.label}</span>
            </Link>
          )
        ))}
        
        <Link to="/" className="home-btn">
          <span className="btn-icon">🏠</span>
          <span className="btn-text">Homepage</span>
        </Link>
      </div>
    </div>
  );
};
