import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { participantAPI, programAPI } from '../services/api';
import type { Participant, Program } from '../types';
import './TabbedPage.css';

type ParticipantForm = {
  fullName: string;
  programId: string;
  category: Participant['category'];
  gender: Participant['gender'];
  age: string;
  status: Participant['status'];
  guardianName: string;
  phone: string;
  location: string;
  notes: string;
};

const initialForm: ParticipantForm = {
  fullName: '',
  programId: '',
  category: 'other',
  gender: 'female',
  age: '',
  status: 'active',
  guardianName: '',
  phone: '',
  location: '',
  notes: ''
};

export const ParticipantsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ParticipantForm>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [participantData, programData] = await Promise.all([
        participantAPI.getAll(),
        programAPI.getAll()
      ]);
      setParticipants(participantData);
      setPrograms(programData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch participants');
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
      const selectedProgram = programs.find((program) => program.id === formData.programId);
      const payload = {
        ...formData,
        programName: selectedProgram?.name || '',
        age: formData.age ? Number(formData.age) : undefined,
        guardianName: formData.guardianName || undefined,
        phone: formData.phone || undefined,
        location: formData.location || undefined
      };

      if (editingId) {
        await participantAPI.update(editingId, payload);
      } else {
        await participantAPI.create(payload);
      }

      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save participant');
    }
  };

  const handleEdit = (participant: Participant) => {
    setEditingId(participant.id);
    setFormData({
      fullName: participant.fullName,
      programId: participant.programId,
      category: participant.category,
      gender: participant.gender,
      age: participant.age ? String(participant.age) : '',
      status: participant.status,
      guardianName: participant.guardianName || '',
      phone: participant.phone || '',
      location: participant.location || '',
      notes: participant.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this participant?')) return;
    try {
      await participantAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete participant');
    }
  };

  const activeCount = participants.filter((participant) => participant.status === 'active').length;

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Participants
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Participant' : '+ Add Participant'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading participants...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Participant Registry</h2>
            <div className="budget-summary" style={{ marginBottom: '1rem' }}>
              <div className="summary-item"><span>Total Participants</span><span>{participants.length}</span></div>
              <div className="summary-item"><span>Active Participants</span><span>{activeCount}</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Program</th>
                  <th>Category</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No participants found</td></tr>
                ) : (
                  participants.map((participant) => (
                    <tr key={participant.id}>
                      <td>{participant.fullName}</td>
                      <td>{participant.programName}</td>
                      <td>{participant.category}</td>
                      <td>{participant.gender}</td>
                      <td>{participant.age ?? '-'}</td>
                      <td>{participant.status}</td>
                      <td>{participant.location || '-'}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(participant)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(participant.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Participant' : 'Add Participant'}</h2>
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row"><label>Full Name:</label><input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></div>
              <div className="form-row">
                <label>Program:</label>
                <select value={formData.programId} onChange={(e) => setFormData({ ...formData, programId: e.target.value })} required>
                  <option value="">Select program...</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Category:</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Participant['category'] })} required>
                  <option value="girl">Girl</option>
                  <option value="boy">Boy</option>
                  <option value="youth">Youth</option>
                  <option value="adult">Adult</option>
                  <option value="household">Household</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <label>Gender:</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as Participant['gender'] })} required>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-row"><label>Age:</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} /></div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Participant['status'] })} required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-row"><label>Guardian Name:</label><input value={formData.guardianName} onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })} /></div>
              <div className="form-row"><label>Phone:</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              <div className="form-row"><label>Location:</label><input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Participant' : 'Create Participant'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};