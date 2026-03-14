import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donationAPI, donorAPI, sponsorshipAPI } from '../services/api';
import type { Donation, Donor, Sponsorship } from '../types';
import './TabbedPage.css';

type DonationForm = {
  donorId: string;
  sponsorshipId: string;
  amount: string;
  currency: string;
  date: string;
  method: Donation['method'];
  reference: string;
  status: Donation['status'];
  notes: string;
};

const initialForm: DonationForm = {
  donorId: '',
  sponsorshipId: '',
  amount: '',
  currency: 'USD',
  date: '',
  method: 'bank',
  reference: '',
  status: 'received',
  notes: ''
};

export const DonationsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DonationForm>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationData, donorData, sponsorshipData] = await Promise.all([
        donationAPI.getAll(),
        donorAPI.getAll(),
        sponsorshipAPI.getAll()
      ]);
      setDonations(donationData);
      setDonors(donorData);
      setSponsorships(sponsorshipData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donations');
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
      const payload = {
        ...formData,
        donorName: donor?.fullName || '',
        sponsorshipId: formData.sponsorshipId || undefined,
        amount: Number(formData.amount)
      };

      if (editingId) {
        await donationAPI.update(editingId, payload);
      } else {
        await donationAPI.create(payload);
      }

      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save donation');
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingId(donation.id);
    setFormData({
      donorId: donation.donorId,
      sponsorshipId: donation.sponsorshipId || '',
      amount: String(donation.amount),
      currency: donation.currency,
      date: donation.date,
      method: donation.method,
      reference: donation.reference,
      status: donation.status,
      notes: donation.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this donation record?')) return;
    try {
      await donationAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete donation');
    }
  };

  const totalReceived = donations
    .filter((d) => d.status === 'received')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Donations
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Donation' : '+ Add Donation'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading donations...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Donation Ledger</h2>
            <div className="summary-item" style={{ marginBottom: '1rem' }}>
              <span>Total Received</span>
              <span>${totalReceived.toLocaleString()}</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No donations found</td></tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id}>
                      <td>{new Date(donation.date).toLocaleDateString()}</td>
                      <td>{donation.donorName}</td>
                      <td>${donation.amount.toLocaleString()}</td>
                      <td>{donation.currency}</td>
                      <td>{donation.method}</td>
                      <td>{donation.reference}</td>
                      <td>{donation.status}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(donation)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(donation.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Donation' : 'Add Donation'}</h2>
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
                <label>Sponsorship (Optional):</label>
                <select value={formData.sponsorshipId} onChange={(e) => setFormData({ ...formData, sponsorshipId: e.target.value })}>
                  <option value="">None</option>
                  {sponsorships.map((s) => (
                    <option key={s.id} value={s.id}>{s.donorName} {'->'} {s.girlName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row"><label>Amount:</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
              <div className="form-row"><label>Currency:</label><input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} required /></div>
              <div className="form-row"><label>Date:</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
              <div className="form-row">
                <label>Method:</label>
                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value as Donation['method'] })} required>
                  <option value="bank">Bank</option>
                  <option value="mobile-money">Mobile Money</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div className="form-row"><label>Reference:</label><input value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} required /></div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Donation['status'] })} required>
                  <option value="received">Received</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Donation' : 'Create Donation'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
