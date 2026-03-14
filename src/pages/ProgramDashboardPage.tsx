import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { donationAPI, expenseAPI, girlsAPI, participantAPI, programAPI, sponsorshipAPI } from '../services/api';
import type { Donation, Expense, Girl, Participant, Program, Sponsorship } from '../types';
import './TabbedPage.css';

const normalize = (value: string | undefined) => (value || '').trim().toLowerCase();
const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export const ProgramDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [girls, setGirls] = useState<Girl[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [apiAvailability, setApiAvailability] = useState({
    participants: true,
    girls: true,
    sponsorships: true,
    donations: true,
    expenses: true
  });

  useEffect(() => {
    const fetchProgramDashboard = async () => {
      if (!id) {
        setError('Missing program id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [programResult, participantsResult, girlsResult, sponsorshipsResult, donationsResult, expensesResult] = await Promise.allSettled([
          programAPI.getById(id),
          participantAPI.getAll(),
          girlsAPI.getAll(),
          sponsorshipAPI.getAll(),
          donationAPI.getAll(),
          expenseAPI.getAll()
        ]);

        if (programResult.status === 'fulfilled') {
          setProgram(programResult.value);
        } else {
          throw new Error('Failed to load program');
        }

        const newWarnings: string[] = [];

        let participantsAvailable = true;
        let girlsAvailable = true;
        let sponsorshipsAvailable = true;
        let donationsAvailable = true;
        let expensesAvailable = true;

        if (participantsResult.status === 'fulfilled') {
          const data = asArray<Participant>(participantsResult.value);
          setParticipants(data);
          if (!Array.isArray(participantsResult.value)) {
            newWarnings.push('Participants endpoint returned an unexpected format.');
            participantsAvailable = false;
          }
        } else {
          newWarnings.push('Participants data unavailable.');
          participantsAvailable = false;
        }

        if (girlsResult.status === 'fulfilled') {
          const data = asArray<Girl>(girlsResult.value);
          setGirls(data);
          if (!Array.isArray(girlsResult.value)) {
            newWarnings.push('Sponsorship candidates endpoint returned an unexpected format.');
            girlsAvailable = false;
          }
        } else {
          newWarnings.push('Sponsorship candidates data unavailable.');
          girlsAvailable = false;
        }

        if (sponsorshipsResult.status === 'fulfilled') {
          const data = asArray<Sponsorship>(sponsorshipsResult.value);
          setSponsorships(data);
          if (!Array.isArray(sponsorshipsResult.value)) {
            newWarnings.push('Sponsorship records endpoint returned an unexpected format.');
            sponsorshipsAvailable = false;
          }
        } else {
          newWarnings.push('Sponsorship records unavailable.');
          sponsorshipsAvailable = false;
        }

        if (donationsResult.status === 'fulfilled') {
          const data = asArray<Donation>(donationsResult.value);
          setDonations(data);
          if (!Array.isArray(donationsResult.value)) {
            newWarnings.push('Donations endpoint returned an unexpected format.');
            donationsAvailable = false;
          }
        } else {
          newWarnings.push('Donation records unavailable.');
          donationsAvailable = false;
        }

        if (expensesResult.status === 'fulfilled') {
          const data = asArray<Expense>(expensesResult.value);
          setExpenses(data);
          if (!Array.isArray(expensesResult.value)) {
            newWarnings.push('Expense records endpoint returned an unexpected format.');
            expensesAvailable = false;
          }
        } else {
          newWarnings.push('Expense records unavailable.');
          expensesAvailable = false;
        }

        setApiAvailability({
          participants: participantsAvailable,
          girls: girlsAvailable,
          sponsorships: sponsorshipsAvailable,
          donations: donationsAvailable,
          expenses: expensesAvailable
        });

        setWarnings(newWarnings);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load program dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDashboard();
  }, [id]);

  const matched = useMemo(() => {
    if (!program) {
      return {
        participants: [] as Participant[],
        girls: [] as Girl[],
        sponsorships: [] as Sponsorship[],
        expenses: [] as Expense[],
        donations: [] as Donation[]
      };
    }

    const programId = normalize(program.id);
    const programName = normalize(program.name);

    const matchedParticipants = participants.filter((item) =>
      normalize(item.programId) === programId || normalize(item.programName) === programName
    );

    const matchedGirls = girls.filter((item) => normalize(item.program) === programName);

    const matchedSponsorships = sponsorships.filter((item) => normalize(item.program) === programName);

    const matchedExpenses = expenses.filter((item) =>
      normalize(item.programId) === programId || normalize(item.programName) === programName
    );

    const sponsorshipIds = new Set(matchedSponsorships.map((item) => item.id));
    const matchedDonations = donations.filter((item) =>
      item.sponsorshipId ? sponsorshipIds.has(item.sponsorshipId) : false
    );

    return {
      participants: matchedParticipants,
      girls: matchedGirls,
      sponsorships: matchedSponsorships,
      expenses: matchedExpenses,
      donations: matchedDonations
    };
  }, [program, participants, girls, sponsorships, expenses, donations]);

  const supplyExpenses = useMemo(() => {
    return matched.expenses.filter((item) => {
      const text = `${item.category} ${item.description}`.toLowerCase();
      return text.includes('supply') || text.includes('pad') || text.includes('hygiene') || text.includes('kit') || text.includes('food');
    });
  }, [matched.expenses]);

  const totals = useMemo(() => {
    const expenseTotal = matched.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const supplyTotal = supplyExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const donationsTotal = matched.donations
      .filter((item) => item.status === 'received')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const sponsoredCandidates = matched.girls.filter((item) => item.sponsorshipStatus === 'sponsored').length;
    const unsponsoredCandidates = matched.girls.filter((item) => item.sponsorshipStatus === 'unsponsored').length;

    return {
      expenseTotal,
      supplyTotal,
      donationsTotal,
      sponsoredCandidates,
      unsponsoredCandidates
    };
  }, [matched.girls, matched.donations, matched.expenses, supplyExpenses]);

  if (loading) {
    return (
      <div className="tabbed-page">
        <div className="tab-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading program dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="tabbed-page">
        <div className="tab-content">
          <div style={{ color: '#f44336', textAlign: 'center', padding: '2rem' }}>{error || 'Program not found'}</div>
          <div style={{ textAlign: 'center' }}>
            <Link to="/programs" className="home-button" style={{ marginLeft: 0 }}>Back to Programs</Link>
          </div>
        </div>
      </div>
    );
  }

  const remaining = program.budget - program.spent;
  const utilization = program.budget > 0 ? (program.spent / program.budget) * 100 : 0;
  const displayedParticipants = matched.participants.length > 0
    ? matched.participants.length
    : program.beneficiaries;
  const participantsEstimated = matched.participants.length === 0 && !apiAvailability.participants;
  const displayedCandidates = matched.girls.length > 0
    ? matched.girls.length
    : matched.sponsorships.length;
  const candidatesEstimated = matched.girls.length === 0 && !apiAvailability.girls;

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <Link to="/programs" className="tab active" style={{ textDecoration: 'none' }}>Programs</Link>
        <button className="tab active">{program.name}</button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        <div className="form-layout" style={{ maxWidth: '100%' }}>
          <h2>{program.name} Dashboard</h2>
          <p style={{ color: '#bbb', marginTop: '-1rem', marginBottom: '1.2rem' }}>{program.description}</p>

          {warnings.length > 0 && (
            <div style={{ backgroundColor: '#2b1e10', border: '1px solid #9c6b22', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: '#f7d19a' }}>
              {warnings.join(' ')}
            </div>
          )}

          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: '#ddd' }}>
            <strong>Data Sources:</strong>{' '}
            Participants: {apiAvailability.participants ? 'OK' : 'Missing'} | Candidates: {apiAvailability.girls ? 'OK' : 'Missing'} | Sponsorships: {apiAvailability.sponsorships ? 'OK' : 'Missing'} | Donations: {apiAvailability.donations ? 'OK' : 'Missing'} | Expenses: {apiAvailability.expenses ? 'OK' : 'Missing'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.8rem' }}>
            <div className="summary-item"><span>Participants{participantsEstimated ? ' (estimated)' : ''}</span><span>{displayedParticipants}</span></div>
            <div className="summary-item"><span>Sponsorship Candidates{candidatesEstimated ? ' (estimated)' : ''}</span><span>{displayedCandidates}</span></div>
            <div className="summary-item"><span>Sponsored Candidates</span><span>{totals.sponsoredCandidates}</span></div>
            <div className="summary-item"><span>Unsponsored Candidates</span><span>{totals.unsponsoredCandidates}</span></div>
            <div className="summary-item"><span>Sponsorship Records</span><span>{matched.sponsorships.length}</span></div>
            <div className="summary-item"><span>Budget Utilization</span><span>{utilization.toFixed(1)}%</span></div>
            <div className="summary-item"><span>Budget</span><span>${program.budget.toLocaleString()}</span></div>
            <div className="summary-item"><span>Spent</span><span>${program.spent.toLocaleString()}</span></div>
            <div className="summary-item"><span>Remaining</span><span>${remaining.toLocaleString()}</span></div>
            <div className="summary-item"><span>Supply Costs</span><span>${totals.supplyTotal.toLocaleString()}</span></div>
            <div className="summary-item"><span>All Program Expenses</span><span>${totals.expenseTotal.toLocaleString()}</span></div>
            <div className="summary-item"><span>Received Donations</span><span>${totals.donationsTotal.toLocaleString()}</span></div>
          </div>

          <h3 style={{ color: '#fff', marginTop: '1.8rem' }}>Delivery & Supplies</h3>
          <table className="data-table" style={{ marginTop: '0.8rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item/Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {supplyExpenses.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No supply expenses logged for this program.</td></tr>
              ) : (
                supplyExpenses.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>${item.amount.toLocaleString()}</td>
                    <td>{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <h3 style={{ color: '#fff', marginTop: '1.8rem' }}>Donor Report Snapshot</h3>
          <div style={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', padding: '1rem', color: '#ddd' }}>
            <p><strong>Program:</strong> {program.name}</p>
            <p><strong>Location:</strong> {program.location}</p>
            <p><strong>Timeline:</strong> {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}</p>
            <p><strong>Participants reached:</strong> {displayedParticipants}{participantsEstimated ? ' (estimated from program beneficiaries)' : ''}</p>
            <p><strong>Sponsorship candidates:</strong> {displayedCandidates}{candidatesEstimated ? ' (estimated from sponsorship records)' : ''} ({totals.sponsoredCandidates} sponsored / {totals.unsponsoredCandidates} unsponsored)</p>
            <p><strong>Funds summary:</strong> Budget ${program.budget.toLocaleString()} | Spent ${program.spent.toLocaleString()} | Received donations ${totals.donationsTotal.toLocaleString()}</p>
            <p><strong>Supply support:</strong> {supplyExpenses.length} line items totaling ${totals.supplyTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
