
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ContentProvider } from './contexts/ContentContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { DashboardPage } from './pages/DashboardPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DonorsPage } from './pages/DonorsPage';
import { GirlsPage } from './pages/GirlsPage';
import { SponsorshipsPage } from './pages/SponsorshipsPage';
import { DonationsPage } from './pages/DonationsPage';
import { TeamPage } from './pages/TeamPage';
import { ParticipantsPage } from './pages/ParticipantsPage';
import { SponsorshipProgramPage } from './pages/SponsorshipProgramPage';
import { ProgramDashboardPage } from './pages/ProgramDashboardPage';
import { GrantsPage } from './pages/GrantsPage';

function App() {
  return (
    <ContentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/programs/sponsorship" element={<SponsorshipProgramPage />} />
          <Route path="/programs/:id/dashboard" element={<ProgramDashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/donors" element={<DonorsPage />} />
          <Route path="/girls" element={<GirlsPage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/sponsorships" element={<SponsorshipsPage />} />
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/grants" element={<GrantsPage />} />
        </Routes>
      </Router>
    </ContentProvider>
  );
}

export default App

