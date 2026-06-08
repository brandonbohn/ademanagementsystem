import { Link } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import './Home.css';

export const Home = () => {
  const { content, loading } = useContent();
  const isExternalUrl = (value: string) => /^https?:\/\//i.test(value);

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

  const menuItems = content?.navigation?.mainMenu || [];

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
