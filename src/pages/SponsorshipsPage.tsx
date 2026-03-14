import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donorAPI, girlsAPI, sponsorshipAPI } from '../services/api';
import type { Donor, Girl, Sponsorship } from '../types';
import './TabbedPage.css';

type SponsorshipForm = {
  donorId: string;
  girlId: string;
  program: string;
  amount: string;
  frequency: Sponsorship['frequency'];
  startDate: string;
  endDate: string;
  status: Sponsorship['status'];
  notes: string;
};

const initialForm: SponsorshipForm = {
  donorId: '',
  girlId: '',
  program: '',
  amount: '',
  frequency: 'monthly',
  startDate: '',
  endDate: '',
  status: 'active',
  notes: ''
};

export const SponsorshipsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SponsorshipForm>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sponsorshipData, donorData, girlsData] = await Promise.all([
        sponsorshipAPI.getAll(),
        donorAPI.getAll(),
        girlsAPI.getAll()
      ]);
      setSponsorships(sponsorshipData);
      setDonors(donorData);
      setGirls(girlsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sponsorships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const donor = donors.find((d) => d.id === formData.donorId);
      const girl = girls.find((g) => g.id === formData.girlId);
      const payload = {
        ...formData,
        donorName: donor?.fullName || '',
        girlName: girl ? `${girl.firstName} ${girl.lastName}` : '',
        amount: Number(formData.amount),
        endDate: formData.endDate || undefined
      };

      if (editingId) {
        await sponsorshipAPI.update(editingId, payload);
      } else {
        await sponsorshipAPI.create(payload);
      }
      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save sponsorship');
    }
  };

  const handleEdit = (sponsorship: Sponsorship) => {
    setEditingId(sponsorship.id);
    setFormData({
      donorId: sponsorship.donorId,
      girlId: sponsorship.girlId,
      program: sponsorship.program,
      amount: String(sponsorship.amount),
      frequency: sponsorship.frequency,
      startDate: sponsorship.startDate,
      endDate: sponsorship.endDate || '',
      status: sponsorship.status,
      notes: sponsorship.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sponsorship?')) return;
    try {
      await sponsorshipAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete sponsorship');
    }
  };

  const activeCount = sponsorships.filter((s) => s.status === 'active').length;

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Sponsorships
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Sponsorship' : '+ Add Sponsorship'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading sponsorships...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Sponsorship Program</h2>
            <div className="budget-summary" style={{ marginBottom: '1rem' }}>
              <div className="summary-item"><span>Total Sponsorships</span><span>{sponsorships.length}</span></div>
              <div className="summary-item"><span>Active</span><span>{activeCount}</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Girl</th>
                  <th>Program</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sponsorships.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No sponsorships found</td></tr>
                ) : (
                  sponsorships.map((s) => (
                    <tr key={s.id}>
                      <td>{s.donorName}</td>
                      <td>{s.girlName}</td>
                      <td>{s.program}</td>
                      <td>${s.amount.toLocaleString()}</td>
                      <td>{s.frequency}</td>
                      <td>{s.status}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(s)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="form-layout">
            <h2>{editingId ? 'Edit Sponsorship' : 'Add Sponsorship'}</h2>
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Donor:</label>
                <select value={formData.donorId} onChange={(e) => setFormData({ ...formData, donorId: e.target.value })} required>
                  <option value="">Select donor...</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.id}>{donor.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Girl:</label>
                <select value={formData.girlId} onChange={(e) => setFormData({ ...formData, girlId: e.target.value })} required>
                  <option value="">Select girl...</option>
                  {girls.map((girl) => (
                    <option key={girl.id} value={girl.id}>{girl.firstName} {girl.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row"><label>Program:</label><input value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} required /></div>
              <div className="form-row"><label>Amount:</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
              <div className="form-row">
                <label>Frequency:</label>
                <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Sponsorship['frequency'] })} required>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
              <div className="form-row"><label>Start Date:</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
              <div className="form-row"><label>End Date:</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Sponsorship['status'] })} required>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Sponsorship' : 'Create Sponsorship'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
