import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { donorAPI } from '../services/api';
import type { Donor } from '../types';
import './TabbedPage.css';

type DonorForm = {
  fullName: string;
  email: string;
  phone: string;
  type: Donor['type'];
  status: Donor['status'];
  country: string;
  notes: string;
};

const initialForm: DonorForm = {
  fullName: '',
  email: '',
  phone: '',
  type: 'individual',
  status: 'active',
  country: '',
  notes: ''
};

export const DonorsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DonorForm>(initialForm);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const data = await donorAPI.getAll();
      setDonors(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await donorAPI.update(editingId, formData);
      } else {
        await donorAPI.create(formData);
      }
      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchDonors();
    } catch (err: any) {
      setError(err.message || 'Failed to save donor');
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingId(donor.id);
    setFormData({
      fullName: donor.fullName,
      email: donor.email,
      phone: donor.phone,
      type: donor.type,
      status: donor.status,
      country: donor.country,
      notes: donor.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this donor?')) return;
    try {
      await donorAPI.delete(id);
      await fetchDonors();
    } catch (err: any) {
      setError(err.message || 'Failed to delete donor');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(initialForm);
    setActiveTab('view');
  };

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Donors
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Donor' : '+ Add Donor'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading donors...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Donor Registry</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center' }}>No donors found</td></tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.id}>
                      <td>{donor.fullName}</td>
                      <td>{donor.email}</td>
                      <td>{donor.phone}</td>
                      <td>{donor.type}</td>
                      <td>{donor.status}</td>
                      <td>{donor.country}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(donor)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(donor.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Donor' : 'Add New Donor'}</h2>
            {editingId && (
              <button type="button" onClick={handleCancel} style={{ marginBottom: '1rem' }} className="edit-btn">
                Cancel Edit
              </button>
            )}
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Full Name:</label>
                <input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Email:</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Phone:</label>
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Type:</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Donor['type'] })} required>
                  <option value="individual">Individual</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Donor['status'] })} required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-row">
                <label>Country:</label>
                <input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} required />
              </div>
              <div className="form-row">
                <label>Notes:</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Donor' : 'Create Donor'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
