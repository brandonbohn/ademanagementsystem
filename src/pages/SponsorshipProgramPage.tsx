import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI, girlsAPI, sponsorshipAPI } from '../services/api';
import type { Donation, Girl, Sponsorship } from '../types';
import './TabbedPage.css';

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

export const SponsorshipProgramPage = () => {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [girlsResult, sponsorshipResult, donationResult] = await Promise.allSettled([
          girlsAPI.getAll(),
          sponsorshipAPI.getAll(),
          donationAPI.getAll()
        ]);

        const nextWarnings: string[] = [];

        if (girlsResult.status === 'fulfilled') {
          const data = asArray<Girl>(girlsResult.value);
          setGirls(data);
          if (!Array.isArray(girlsResult.value)) {
            nextWarnings.push('Sponsorship candidates endpoint returned an unexpected format.');
          }
        } else {
          setGirls([]);
          nextWarnings.push('Sponsorship candidates endpoint is unavailable.');
        }

        if (sponsorshipResult.status === 'fulfilled') {
          const data = asArray<Sponsorship>(sponsorshipResult.value);
          setSponsorships(data);
          if (!Array.isArray(sponsorshipResult.value)) {
            nextWarnings.push('Sponsorship records endpoint returned an unexpected format.');
          }
        } else {
          setSponsorships([]);
          nextWarnings.push('Sponsorship records endpoint is unavailable.');
        }

        if (donationResult.status === 'fulfilled') {
          const data = asArray<Donation>(donationResult.value);
          setDonations(data);
          if (!Array.isArray(donationResult.value)) {
            nextWarnings.push('Donations endpoint returned an unexpected format.');
          }
        } else {
          setDonations([]);
          nextWarnings.push('Donations endpoint is unavailable.');
        }

        setWarnings(nextWarnings);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load sponsorship program data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sponsoredCount = girls.filter((girl) => girl.sponsorshipStatus === 'sponsored').length;
  const unsponsoredCount = girls.filter((girl) => girl.sponsorshipStatus === 'unsponsored').length;
  const activeSponsorships = sponsorships.filter((sponsorship) => sponsorship.status === 'active').length;
  const receivedDonations = donations
    .filter((donation) => donation.status === 'received')
    .reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <Link to="/programs" className="tab active" style={{ textDecoration: 'none' }}>
          Sponsorship Program Hub
        </Link>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading sponsorship program...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && !error && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Sponsorship Program</h2>
            <div style={{ color: '#bbb', marginBottom: '1rem' }}>
              Drill-down view for sponsorship operations and growth tracking.
            </div>

            {warnings.length > 0 && (
              <div style={{ backgroundColor: '#2b1e10', border: '1px solid #9c6b22', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: '#f7d19a' }}>
                {warnings.join(' ')}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}
            >
              <div className="summary-item"><span>Total Candidates</span><span>{girls.length}</span></div>
              <div className="summary-item"><span>Sponsored</span><span>{sponsoredCount}</span></div>
              <div className="summary-item"><span>Unsponsored</span><span>{unsponsoredCount}</span></div>
              <div className="summary-item"><span>Active Sponsorships</span><span>{activeSponsorships}</span></div>
              <div className="summary-item"><span>Received Donations</span><span>${receivedDonations.toLocaleString()}</span></div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Link to="/girls" className="home-button" style={{ margin: 0 }}>Sponsorship Candidates</Link>
              <Link to="/sponsorships" className="home-button" style={{ margin: 0 }}>Manage Sponsorships</Link>
              <Link to="/donations" className="home-button" style={{ margin: 0 }}>Donation Ledger</Link>
              <Link to="/participants" className="home-button" style={{ margin: 0 }}>Participant List</Link>
            </div>

            <h3 style={{ color: '#fff' }}>Recent Active Sponsorships</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Candidate</th>
                  <th>Program</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center' }}>No sponsorships found</td></tr>
                ) : (
                  sponsorships
                    .filter((sponsorship) => sponsorship.status === 'active')
                    .slice(0, 10)
                    .map((sponsorship) => (
                      <tr key={sponsorship.id}>
                        <td>{sponsorship.donorName}</td>
                        <td>{sponsorship.girlName}</td>
                        <td>{sponsorship.program}</td>
                        <td>${sponsorship.amount.toLocaleString()}</td>
                        <td>{sponsorship.frequency}</td>
                        <td>{sponsorship.status}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
