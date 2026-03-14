import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { programAPI, teamAPI } from '../services/api';
import type { Program, TeamMember } from '../types';
import './TabbedPage.css';

type TeamForm = {
  fullName: string;
  roleType: TeamMember['roleType'];
  roleTitle: string;
  startDate: string;
  status: TeamMember['status'];
  phone: string;
  email: string;
  program: string;
  notes: string;
};

const initialForm: TeamForm = {
  fullName: '',
  roleType: 'employee',
  roleTitle: '',
  startDate: '',
  status: 'active',
  phone: '',
  email: '',
  program: '',
  notes: ''
};

export const TeamPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamForm>(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memberData, programData] = await Promise.all([teamAPI.getAll(), programAPI.getAll()]);
      setMembers(memberData);
      setPrograms(programData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch team members');
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
        program: formData.program || undefined
      };
      if (editingId) {
        await teamAPI.update(editingId, payload);
      } else {
        await teamAPI.create(payload);
      }
      setEditingId(null);
      setFormData(initialForm);
      setActiveTab('view');
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save team member');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      fullName: member.fullName,
      roleType: member.roleType,
      roleTitle: member.roleTitle,
      startDate: member.startDate,
      status: member.status,
      phone: member.phone,
      email: member.email,
      program: member.program || '',
      notes: member.notes || ''
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    try {
      await teamAPI.delete(id);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete team member');
    }
  };

  const employeeCount = members.filter((m) => m.roleType === 'employee').length;
  const volunteerCount = members.filter((m) => m.roleType === 'volunteer').length;

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Team
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Team Member' : '+ Add Team Member'}
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading team...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Employees and Volunteers</h2>
            <div className="budget-summary" style={{ marginBottom: '1rem' }}>
              <div className="summary-item"><span>Employees</span><span>{employeeCount}</span></div>
              <div className="summary-item"><span>Volunteers</span><span>{volunteerCount}</span></div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Program</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No team members found</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.fullName}</td>
                      <td>{member.roleType}</td>
                      <td>{member.roleTitle}</td>
                      <td>{member.status}</td>
                      <td>{member.program || '-'}</td>
                      <td>{member.phone}</td>
                      <td>{member.email}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(member)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(member.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row"><label>Full Name:</label><input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></div>
              <div className="form-row">
                <label>Role Type:</label>
                <select value={formData.roleType} onChange={(e) => setFormData({ ...formData, roleType: e.target.value as TeamMember['roleType'] })} required>
                  <option value="employee">Employee</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div className="form-row"><label>Role Title:</label><input value={formData.roleTitle} onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })} required /></div>
              <div className="form-row"><label>Start Date:</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TeamMember['status'] })} required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-row"><label>Phone:</label><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
              <div className="form-row"><label>Email:</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div className="form-row">
                <label>Program:</label>
                <select value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })}>
                  <option value="">None</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.name}>{program.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Team Member' : 'Create Team Member'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
