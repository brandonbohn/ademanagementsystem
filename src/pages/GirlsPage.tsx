import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donorAPI, girlsAPI } from '../services/api';
import type { Donor, Girl } from '../types';
import './TabbedPage.css';

type GirlForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: string;
  program: string;
  status: Girl['status'];
  sponsorshipStatus: Girl['sponsorshipStatus'];
  sponsorId: string;
  notes: string;
};

const initialForm: GirlForm = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  school: '',
  program: '',
  status: 'active',
  sponsorshipStatus: 'unsponsored',
  sponsorId: '',
  notes: ''
};

export const GirlsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GirlForm>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [girlsData, donorsData] = await Promise.all([girlsAPI.getAll(), donorAPI.getAll()]);
      setGirls(girlsData);
      setDonors(donorsData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch girls');
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
      const payload = {
        ...formData,
        sponsorId: formData.sponsorId || undefined
      };
      if (editingId) {
        await girlsAPI.update(editingId, payload);
      } else {
        await girlsAPI.create(payload);
      }
      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save girl');
    }
  };

  const handleEdit = (girl: Girl) => {
    setEditingId(girl.id);
    setFormData({
      firstName: girl.firstName,
      lastName: girl.lastName,
      dateOfBirth: girl.dateOfBirth,
      school: girl.school,
      program: girl.program,
      status: girl.status,
      sponsorshipStatus: girl.sponsorshipStatus,
      sponsorId: girl.sponsorId || '',
      notes: girl.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this girl record?')) return;
    try {
      await girlsAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete girl');
    }
  };

  const sponsoredCount = girls.filter((g) => g.sponsorshipStatus === 'sponsored').length;
  const unsponsoredCount = girls.filter((g) => g.sponsorshipStatus === 'unsponsored').length;

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Sponsorship Candidates
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Candidate' : '+ Add Candidate'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading sponsorship candidates...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Sponsorship Candidates Registry</h2>
            <div className="budget-summary" style={{ marginBottom: '1rem' }}>
              <div className="summary-item"><span>Total Candidates</span><span>{girls.length}</span></div>
              <div className="summary-item"><span>Sponsored</span><span>{sponsoredCount}</span></div>
              <div className="summary-item"><span>Unsponsored</span><span>{unsponsoredCount}</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>School</th>
                  <th>Program</th>
                  <th>Sponsorship</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {girls.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No sponsorship candidates found</td></tr>
                ) : (
                  girls.map((girl) => (
                    <tr key={girl.id}>
                      <td>{girl.firstName} {girl.lastName}</td>
                      <td>{new Date(girl.dateOfBirth).toLocaleDateString()}</td>
                      <td>{girl.school}</td>
                      <td>{girl.program}</td>
                      <td>{girl.sponsorshipStatus}</td>
                      <td>{girl.status}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(girl)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(girl.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Candidate Record' : 'Add Candidate Record'}</h2>
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row"><label>First Name:</label><input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></div>
              <div className="form-row"><label>Last Name:</label><input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required /></div>
              <div className="form-row"><label>Date of Birth:</label><input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
              <div className="form-row"><label>School:</label><input value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} required /></div>
              <div className="form-row"><label>Program:</label><input value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} required /></div>
              <div className="form-row">
                <label>Sponsorship Status:</label>
                <select value={formData.sponsorshipStatus} onChange={(e) => setFormData({ ...formData, sponsorshipStatus: e.target.value as Girl['sponsorshipStatus'] })} required>
                  <option value="unsponsored">Unsponsored</option>
                  <option value="partial">Partial</option>
                  <option value="sponsored">Sponsored</option>
                </select>
              </div>
              <div className="form-row">
                <label>Sponsor:</label>
                <select value={formData.sponsorId} onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}>
                  <option value="">None</option>
                  {donors.map((donor) => (
                    <option key={donor.id} value={donor.id}>{donor.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Girl['status'] })} required>
                  <option value="active">Active</option>
                  <option value="graduated">Graduated</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
