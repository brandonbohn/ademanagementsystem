import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { programAPI } from '../services/api';
import { useContent } from '../contexts/ContentContext';
import './TabbedPage.css';

interface Program {
  id: string;
  name: string;
  description: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned' | 'on-hold';
  beneficiaries: number;
  location: string;
}

export const ProgramsPage = () => {
  const [activeTab, setActiveTab] = useState('hubs');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    beneficiaries: '',
    status: 'planned'
  });
  const { content } = useContent();

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programAPI.getAll();
      setPrograms(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch programs');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing program
        const program = programs.find(p => p.id === editingId);
        const updatedProgram = {
          ...formData,
          budget: Number(formData.budget),
          beneficiaries: Number(formData.beneficiaries),
          spent: program?.spent || 0
        };
        await programAPI.update(editingId, updatedProgram);
        setEditingId(null);
      } else {
        // Create new program
        const newProgram = {
          id: `P${String(programs.length + 1).padStart(3, '0')}`,
          ...formData,
          budget: Number(formData.budget),
          beneficiaries: Number(formData.beneficiaries),
          spent: 0
        };
        await programAPI.create(newProgram);
      }
      await fetchPrograms();
      setFormData({
        name: '',
        description: '',
        budget: '',
        startDate: '',
        endDate: '',
        location: '',
        beneficiaries: '',
        status: 'planned'
      });
      setActiveTab('view');
    } catch (err: any) {
      console.error('Error saving program:', err);
      setError(err.message || `Failed to ${editingId ? 'update' : 'create'} program`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setFormData({
      name: program.name,
      description: program.description,
      budget: String(program.budget),
      startDate: program.startDate,
      endDate: program.endDate,
      location: program.location,
      beneficiaries: String(program.beneficiaries),
      status: program.status
    });
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      await programAPI.delete(id);
      await fetchPrograms();
    } catch (err: any) {
      console.error('Error deleting program:', err);
      setError(err.message || 'Failed to delete program');
      alert(`Error deleting program: ${err.message || 'Failed to delete program'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      budget: '',
      startDate: '',
      endDate: '',
      location: '',
      beneficiaries: '',
      status: 'planned'
    });
  };

  const activePrograms = programs.filter(p => p.status === 'active');
  const completedPrograms = programs.filter(p => p.status === 'completed');
  const statuses = content?.programs?.statuses || [];

  const sponsorshipProgram = programs.find((program) =>
    program.name.toLowerCase().includes('sponsor') ||
    program.name.toLowerCase().includes('sponsorship')
  );

  const soccerProgram = programs.find((program) =>
    program.name.toLowerCase().includes('soccer')
  );

  const rescueProgram = programs.find((program) =>
    program.name.toLowerCase().includes('rescue')
  );

  const feedingProgram = programs.find((program) =>
    program.name.toLowerCase().includes('feeding') ||
    program.name.toLowerCase().includes('food')
  );

  const renderHubCard = (
    title: string,
    description: string,
    program?: Program,
    actions?: { label: string; to: string }[]
  ) => (
    <div
      style={{
        backgroundColor: '#111',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {program ? (
        <Link
          to={`/programs/${program.id}/dashboard`}
          style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
        >
          <h3 style={{ margin: 0, color: '#fff' }}>{title}</h3>
          <p style={{ margin: '0.5rem 0 0', color: '#bbb' }}>{description}</p>
          <div style={{ color: '#ddd', fontSize: '0.95rem', marginTop: '0.75rem' }}>
            <strong>Budget:</strong> ${program.budget.toLocaleString()} | <strong>Spent:</strong> ${program.spent.toLocaleString()}
          </div>
          <div style={{ color: '#ddd', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            <strong>Beneficiaries:</strong> {program.beneficiaries.toLocaleString()} | <strong>Status:</strong> {program.status}
          </div>
          <div style={{ color: '#9bd0ff', fontSize: '0.9rem', marginTop: '0.6rem', fontWeight: 600 }}>
            Click card to open dashboard
          </div>
        </Link>
      ) : (
        <>
          <h3 style={{ margin: 0, color: '#fff' }}>{title}</h3>
          <p style={{ margin: 0, color: '#bbb' }}>{description}</p>
          <div style={{ color: '#f44336', fontSize: '0.95rem' }}>
            Program not yet created in backend. Add it in the + Add Program tab.
          </div>
        </>
      )}
      {actions && actions.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {actions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              style={{
                backgroundColor: '#ff0000',
                color: '#fff',
                textDecoration: 'none',
                padding: '0.5rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'hubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('hubs')}
        >
          Program Hubs
        </button>
        <button 
          className={`tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Programs
        </button>
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          + Add Program
        </button>
        <button 
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Programs
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Programs
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>Loading programs...</div>}
        {error && <div style={{ padding: '2rem', color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'hubs' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Program Hubs</h2>
            <p style={{ color: '#bbb', marginBottom: '1.25rem' }}>
              Select a program hub to go deeper into operations. Sponsorship includes direct access to candidates and sponsorship records.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}
            >
              {renderHubCard(
                'Sponsorship Program',
                'Manage sponsor-to-candidate matching, sponsorship records, and payment tracking.',
                sponsorshipProgram,
                [
                  { label: 'Open Program Dashboard', to: sponsorshipProgram ? `/programs/${sponsorshipProgram.id}/dashboard` : '/programs' },
                  { label: 'Sponsorship Candidates', to: '/girls' },
                  { label: 'Sponsorships', to: '/sponsorships' }
                ]
              )}
              {renderHubCard(
                'Soccer Program',
                'Track soccer participants, schedules, kit support, and attendance.',
                soccerProgram,
                [
                  { label: 'Open Program Dashboard', to: soccerProgram ? `/programs/${soccerProgram.id}/dashboard` : '/programs' },
                  { label: 'Participants', to: '/participants' }
                ]
              )}
              {renderHubCard(
                'Girls Rescue Center Program',
                'Manage rescue center enrollment, wellbeing support, and related case tracking.',
                rescueProgram,
                [
                  { label: 'Open Program Dashboard', to: rescueProgram ? `/programs/${rescueProgram.id}/dashboard` : '/programs' },
                  { label: 'Participants', to: '/participants' }
                ]
              )}
              {renderHubCard(
                'Feeding Program',
                'Track food support beneficiaries, distribution cycles, and associated costs.',
                feedingProgram,
                [
                  { label: 'Open Program Dashboard', to: feedingProgram ? `/programs/${feedingProgram.id}/dashboard` : '/programs' },
                  { label: 'Participants', to: '/participants' },
                  { label: 'Donations', to: '/donations' }
                ]
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'view' && (
          <div className="form-layout">
            <h2>All Programs</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Status</th>
                  <th>Beneficiaries</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>No programs found</td>
                  </tr>
                ) : (
                  programs.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <Link to={`/programs/${program.id}/dashboard`} style={{ color: '#9bd0ff' }}>
                          {program.name}
                        </Link>
                      </td>
                      <td>${program.budget.toLocaleString()}</td>
                      <td>${program.spent.toLocaleString()}</td>
                      <td>{program.status}</td>
                      <td>{program.beneficiaries}</td>
                      <td>{program.location}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(program)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: '#2196F3',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <Link
                            to={`/programs/${program.id}/dashboard`}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}
                          >
                            Dashboard
                          </Link>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(program.id)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
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
            <h2>{editingId ? 'Edit Program' : 'Add New Program'}</h2>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit}
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel Edit
              </button>
            )}
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Program Name:</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter program name" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Description:</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Program description..."
                  required
                />
              </div>
              <div className="form-row">
                <label>Budget:</label>
                <input 
                  type="number" 
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="0.00" 
                  step="0.01" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Start Date:</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>End Date:</label>
                <input 
                  type="date" 
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Location:</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Program location" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Target Beneficiaries:</label>
                <input 
                  type="number" 
                  name="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={handleInputChange}
                  placeholder="Number of beneficiaries" 
                  required
                />
              </div>
              <div className="form-row">
                <label>Status:</label>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {statuses.length > 0 ? (
                    statuses.map((status: any) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </>
                  )}
                </select>
              </div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Program' : 'Create Program'}</button>
            </form>
          </div>
        )}

        {!loading && activeTab === 'active' && (
          <div className="form-layout">
            <h2>Active Programs</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Progress</th>
                  <th>Beneficiaries</th>
                  <th>Dashboard</th>
                </tr>
              </thead>
              <tbody>
                {activePrograms.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center' }}>No active programs</td>
                  </tr>
                ) : (
                  activePrograms.map((program) => {
                    const remaining = program.budget - program.spent;
                    const progress = Math.round((program.spent / program.budget) * 100);
                    return (
                      <tr key={program.id}>
                        <td>
                          <Link to={`/programs/${program.id}/dashboard`} style={{ color: '#9bd0ff' }}>
                            {program.name}
                          </Link>
                        </td>
                        <td>${program.budget.toLocaleString()}</td>
                        <td>${program.spent.toLocaleString()}</td>
                        <td>${remaining.toLocaleString()}</td>
                        <td>{progress}%</td>
                        <td>{program.beneficiaries}</td>
                        <td>
                          <Link
                            to={`/programs/${program.id}/dashboard`}
                            style={{
                              backgroundColor: '#4CAF50',
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'completed' && (
          <div className="form-layout">
            <h2>Completed Programs</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program Name</th>
                  <th>Budget</th>
                  <th>Total Spent</th>
                  <th>Beneficiaries</th>
                  <th>End Date</th>
                  <th>Dashboard</th>
                </tr>
              </thead>
              <tbody>
                {completedPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>No completed programs</td>
                  </tr>
                ) : (
                  completedPrograms.map((program) => (
                    <tr key={program.id}>
                        <td>
                          <Link to={`/programs/${program.id}/dashboard`} style={{ color: '#9bd0ff' }}>
                            {program.name}
                          </Link>
                        </td>
                      <td>${program.budget.toLocaleString()}</td>
                      <td>${program.spent.toLocaleString()}</td>
                      <td>{program.beneficiaries}</td>
                      <td>{new Date(program.endDate).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/programs/${program.id}/dashboard`}
                          style={{
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}
                        >
                          Open
                        </Link>
                      </td>
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
