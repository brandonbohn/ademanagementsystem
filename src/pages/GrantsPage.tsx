import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { grantAPI, resourceAPI } from '../services/api';
import type { Grant, GrantRequirement } from '../types';
import './TabbedPage.css';

interface GrantFile {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
  description: string;
  uploadedAt: string;
}

interface Resource {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  title: string;
  description: string;
  uploadedAt: string;
}

type GrantForm = {
  title: string;
  funder: string;
  company: string;
  sourceUrl: string;
  researchDate: string;
  deadline: string;
  nextActionDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  amountAwarded: string;
  amountReceived: string;
  startDate: string;
  endDate: string;
  status: Grant['status'];
  purpose: string;
  requirements: GrantRequirement[];
  notes: string;
};

const initialForm: GrantForm = {
  title: '',
  funder: '',
  company: '',
  sourceUrl: '',
  researchDate: '',
  deadline: '',
  nextActionDate: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  amountAwarded: '',
  amountReceived: '',
  startDate: '',
  endDate: '',
  status: 'pipeline',
  purpose: '',
  requirements: [],
  notes: ''
};

const getRequirementProgress = (grant: Grant) => {
  const items = Array.isArray(grant.requirements) ? grant.requirements : [];
  if (items.length === 0) return '0/0';
  const done = items.filter((item) => item.completed).length;
  return `${done}/${items.length}`;
};

const parseMeta = (html: string, names: string[]) => {
  const candidates = names
    .map((name) => {
      const regex = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
      const match = html.match(regex);
      return match?.[1];
    })
    .filter(Boolean) as string[];
  return candidates[0] || '';
};

export const GrantsPage = () => {
  const [activeTab, setActiveTab] = useState<'view' | 'add' | 'files' | 'resources'>('view');
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GrantForm>(initialForm);
  const [newRequirementLabel, setNewRequirementLabel] = useState('');
  const [newRequirementDueDate, setNewRequirementDueDate] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [selectedGrantForFiles, setSelectedGrantForFiles] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<GrantFile[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileType, setUploadFileType] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceCategory, setResourceCategory] = useState('starter-kit');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceUploadLoading, setResourceUploadLoading] = useState(false);

  const fetchGrants = async () => {
    try {
      setLoading(true);
      const data = await grantAPI.getAll();
      setGrants(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch grants');
      setGrants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, []);

  const addRequirement = () => {
    const label = newRequirementLabel.trim();
    if (!label) return;

    const requirement: GrantRequirement = {
      id: `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      completed: false,
      dueDate: newRequirementDueDate || undefined
    };

    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, requirement]
    }));
    setNewRequirementLabel('');
    setNewRequirementDueDate('');
  };

  const toggleRequirement = (requirementId: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((item) =>
        item.id === requirementId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const removeRequirement = (requirementId: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((item) => item.id !== requirementId)
    }));
  };

  const handleImportFromUrl = async () => {
    const rawUrl = formData.sourceUrl.trim();
    if (!rawUrl) {
      setImportStatus('Add a source URL first.');
      return;
    }

    try {
      setImportStatus('Trying to import data from website...');
      const html = await grantAPI.fetchUrl(rawUrl);

      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const ogTitle = parseMeta(html, ['og:title', 'twitter:title']);
      const ogDescription = parseMeta(html, ['description', 'og:description']);

      const extractedTitle = (ogTitle || titleMatch?.[1] || '').trim();
      const extractedPurpose = ogDescription.trim();

      setFormData((prev) => ({
        ...prev,
        title: prev.title || extractedTitle,
        purpose: prev.purpose || extractedPurpose,
        funder: prev.funder || prev.company
      }));

      setImportStatus('Import complete. Review and fill missing fields manually.');
    } catch (_err) {
      setImportStatus('Auto-import blocked (CORS or site policy). Add details manually from your research notes.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amountAwarded: Number(formData.amountAwarded || 0),
        amountReceived: Number(formData.amountReceived || 0),
        company: formData.company || undefined,
        sourceUrl: formData.sourceUrl || undefined,
        researchDate: formData.researchDate || undefined,
        deadline: formData.deadline || undefined,
        nextActionDate: formData.nextActionDate || undefined,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        requirements: formData.requirements
      };

      if (editingId) {
        await grantAPI.update(editingId, payload);
      } else {
        await grantAPI.create(payload);
      }

      setEditingId(null);
      setFormData(initialForm);
      setNewRequirementLabel('');
      setNewRequirementDueDate('');
      setImportStatus(null);
      setActiveTab('view');
      await fetchGrants();
    } catch (err: any) {
      setError(err.message || 'Failed to save grant');
    }
  };

  const handleEdit = (grant: Grant) => {
    setEditingId(grant.id);
    setFormData({
      title: grant.title,
      funder: grant.funder,
      company: grant.company || '',
      sourceUrl: grant.sourceUrl || '',
      researchDate: grant.researchDate || '',
      deadline: grant.deadline || '',
      nextActionDate: grant.nextActionDate || '',
      contactName: grant.contactName || '',
      contactEmail: grant.contactEmail || '',
      contactPhone: grant.contactPhone || '',
      amountAwarded: String(grant.amountAwarded),
      amountReceived: String(grant.amountReceived),
      startDate: grant.startDate,
      endDate: grant.endDate,
      status: grant.status,
      purpose: grant.purpose,
      requirements: Array.isArray(grant.requirements) ? grant.requirements : [],
      notes: grant.notes || ''
    });
    setImportStatus(null);
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this grant?')) return;
    try {
      await grantAPI.delete(id);
      await fetchGrants();
    } catch (err: any) {
      setError(err.message || 'Failed to delete grant');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrantForFiles || !uploadFile) {
      setError('Please select a grant and a file to upload');
      return;
    }

    try {
      setUploadLoading(true);
      await grantAPI.uploadFile(selectedGrantForFiles, uploadFile, uploadFileType, uploadDescription);
      setUploadFile(null);
      setUploadFileType('');
      setUploadDescription('');
      await fetchGrantFiles(selectedGrantForFiles);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploadLoading(false);
    }
  };

  const fetchGrantFiles = async (grantId: string) => {
    try {
      const files = await grantAPI.getFiles(grantId);
      setUploadedFiles(files);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch files');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await grantAPI.deleteFile(fileId);
      if (selectedGrantForFiles) {
        await fetchGrantFiles(selectedGrantForFiles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
    }
  };

  const handleGrantSelectForFiles = (grantId: string) => {
    setSelectedGrantForFiles(grantId);
    fetchGrantFiles(grantId);
  };

  const fetchResources = async () => {
    try {
      const data = await resourceAPI.getAll();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch resources');
    }
  };

  const handleResourceUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceFile || !resourceTitle) {
      setError('Please select a file and enter a title');
      return;
    }

    try {
      setResourceUploadLoading(true);
      await resourceAPI.upload(resourceFile, resourceCategory, resourceTitle, resourceDescription);
      setResourceFile(null);
      setResourceTitle('');
      setResourceDescription('');
      await fetchResources();
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resource');
    } finally {
      setResourceUploadLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await resourceAPI.delete(resourceId);
      await fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource');
    }
  };

  const totals = useMemo(() => {
    const totalAwarded = grants.reduce((sum, grant) => sum + (grant.amountAwarded || 0), 0);
    const totalReceived = grants.reduce((sum, grant) => sum + (grant.amountReceived || 0), 0);
    const dueSoon = grants.filter((grant) => {
      if (!grant.deadline) return false;
      const deadline = new Date(grant.deadline).getTime();
      const now = Date.now();
      const diffDays = (deadline - now) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
    return { totalAwarded, totalReceived, dueSoon };
  }, [grants]);

  return (
    <div className="tabbed-page">
      <div className="tab-navigation">
        <button className={`tab ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Grant Tracking
        </button>
        <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
          {editingId ? 'Edit Grant' : '+ Add Grant'}
        </button>
        <button className={`tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>
          📁 Grant Materials
        </button>
        <button className={`tab ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
          📚 Resources
        </button>
        <Link to="/home" className="home-button">Home</Link>
      </div>

      <div className="tab-content">
        {loading && <div style={{ textAlign: 'center' }}>Loading grants...</div>}
        {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

        {!loading && activeTab === 'view' && (
          <div className="form-layout" style={{ maxWidth: '100%' }}>
            <h2>Grant Research and Pipeline Table</h2>
            <div className="budget-summary" style={{ marginBottom: '1rem' }}>
              <div className="summary-item"><span>Total Awarded</span><span>${totals.totalAwarded.toLocaleString()}</span></div>
              <div className="summary-item"><span>Total Received</span><span>${totals.totalReceived.toLocaleString()}</span></div>
              <div className="summary-item"><span>Deadlines in 30 Days</span><span>{totals.dueSoon}</span></div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Grant</th>
                  <th>Company/Funder</th>
                  <th>Deadline</th>
                  <th>Timeline</th>
                  <th>Contact</th>
                  <th>Requirements</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {grants.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center' }}>No grants found</td></tr>
                ) : (
                  grants.map((grant) => (
                    <tr key={grant.id}>
                      <td>
                        <div>{grant.title}</div>
                        {grant.sourceUrl && (
                          <a href={grant.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#9bd0ff', fontSize: '0.85rem' }}>
                            Source
                          </a>
                        )}
                      </td>
                      <td>{grant.company || grant.funder}</td>
                      <td>{grant.deadline ? new Date(grant.deadline).toLocaleDateString() : '-'}</td>
                      <td>{new Date(grant.startDate).toLocaleDateString()} - {new Date(grant.endDate).toLocaleDateString()}</td>
                      <td>
                        {grant.contactName || '-'}
                        <br />
                        <span style={{ color: '#aaa', fontSize: '0.85rem' }}>{grant.contactEmail || grant.contactPhone || ''}</span>
                      </td>
                      <td>{getRequirementProgress(grant)}</td>
                      <td>{grant.status}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(grant)}>Edit</button>
                        {' '}
                        <button className="delete-btn" onClick={() => handleDelete(grant.id)}>Delete</button>
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
            <h2>{editingId ? 'Edit Grant Record' : 'Add Grant Opportunity'}</h2>
            <form className="excel-form" onSubmit={handleSubmit}>
              <div className="form-row"><label>Grant Title:</label><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
              <div className="form-row"><label>Company/Organization:</label><input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Funding organization" /></div>
              <div className="form-row"><label>Funder Name:</label><input value={formData.funder} onChange={(e) => setFormData({ ...formData, funder: e.target.value })} required /></div>
              <div className="form-row"><label>Source Website URL:</label><input value={formData.sourceUrl} onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })} placeholder="https://..." /></div>
              <div style={{ marginLeft: '210px', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                <button type="button" className="edit-btn" onClick={handleImportFromUrl}>Try Import from Website</button>
                {importStatus && <div style={{ color: '#bbb', marginTop: '0.5rem' }}>{importStatus}</div>}
              </div>

              <div className="form-row"><label>Research Date:</label><input type="date" value={formData.researchDate} onChange={(e) => setFormData({ ...formData, researchDate: e.target.value })} /></div>
              <div className="form-row"><label>Application Deadline:</label><input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} /></div>
              <div className="form-row"><label>Next Action Date:</label><input type="date" value={formData.nextActionDate} onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })} /></div>

              <div className="form-row"><label>Contact Name:</label><input value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} /></div>
              <div className="form-row"><label>Contact Email:</label><input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} /></div>
              <div className="form-row"><label>Contact Phone:</label><input value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} /></div>

              <div className="form-row"><label>Amount Awarded:</label><input type="number" step="0.01" value={formData.amountAwarded} onChange={(e) => setFormData({ ...formData, amountAwarded: e.target.value })} required /></div>
              <div className="form-row"><label>Amount Received:</label><input type="number" step="0.01" value={formData.amountReceived} onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })} required /></div>
              <div className="form-row"><label>Start Date:</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
              <div className="form-row"><label>End Date:</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required /></div>

              <div className="form-row">
                <label>Status:</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Grant['status'] })} required>
                  <option value="pipeline">Pipeline</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-row"><label>Purpose:</label><textarea value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} required /></div>

              <div style={{ border: '1px solid #333', borderRadius: '8px', padding: '1rem', backgroundColor: '#111' }}>
                <h3 style={{ color: '#fff', marginBottom: '0.75rem' }}>Grant Requirements Checklist</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px auto', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    value={newRequirementLabel}
                    onChange={(e) => setNewRequirementLabel(e.target.value)}
                    placeholder="Requirement (e.g. financial statements)"
                  />
                  <input
                    type="date"
                    value={newRequirementDueDate}
                    onChange={(e) => setNewRequirementDueDate(e.target.value)}
                  />
                  <button type="button" className="edit-btn" onClick={addRequirement}>Add</button>
                </div>

                {formData.requirements.length === 0 ? (
                  <div style={{ color: '#bbb' }}>No requirements added yet.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {formData.requirements.map((item) => (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '0.6rem', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '0.5rem', borderRadius: '6px' }}>
                        <input type="checkbox" checked={item.completed} onChange={() => toggleRequirement(item.id)} />
                        <span style={{ color: '#fff' }}>{item.label}</span>
                        <span style={{ color: '#999' }}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}</span>
                        <button type="button" className="delete-btn" onClick={() => removeRequirement(item.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row"><label>Notes:</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
              <button type="submit" className="submit-btn">{editingId ? 'Update Grant' : 'Create Grant'}</button>
            </form>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="form-layout">
            <h2>Grant Materials Repository</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Select Grant:</label>
              <select
                value={selectedGrantForFiles || ''}
                onChange={(e) => handleGrantSelectForFiles(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              >
                <option value="">-- Select a grant --</option>
                {grants.map((grant) => (
                  <option key={grant.id} value={grant.id}>{grant.title}</option>
                ))}
              </select>
            </div>

            {selectedGrantForFiles && (
              <>
                <div style={{ 
                  border: '1px solid #333', 
                  borderRadius: '8px', 
                  padding: '1.5rem', 
                  backgroundColor: '#111',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Upload File</h3>
                  <form onSubmit={handleFileUpload}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>File:</label>
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>File Type:</label>
                      <select
                        value={uploadFileType}
                        onChange={(e) => setUploadFileType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                      >
                        <option value="">-- Select type --</option>
                        <option value="application">Application</option>
                        <option value="proposal">Proposal</option>
                        <option value="budget">Budget</option>
                        <option value="report">Report</option>
                        <option value="contract">Contract</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Description:</label>
                      <input
                        type="text"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Optional description"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          color: '#fff'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploadLoading}
                      className="submit-btn"
                      style={{ opacity: uploadLoading ? 0.6 : 1 }}
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Uploaded Files</h3>
                  {uploadedFiles.length === 0 ? (
                    <div style={{ color: '#999' }}>No files uploaded yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '6px'
                          }}
                        >
                          <div>
                            <div style={{ color: '#fff', fontWeight: '600' }}>{file.originalName}</div>
                            <div style={{ color: '#999', fontSize: '0.85rem' }}>
                              {file.fileType} • {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                            </div>
                            {file.description && (
                              <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.25rem' }}>{file.description}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <a
                              href={`${import.meta.env.VITE_API_URL}/files/${file.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="edit-btn"
                              style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
                            >
                              Download
                            </a>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="form-layout">
            <h2>Grant Resources</h2>
            
            <div style={{ 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '1.5rem', 
              backgroundColor: '#111',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Upload Resource</h3>
              <form onSubmit={handleResourceUpload}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>File:</label>
                  <input
                    type="file"
                    onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Title:</label>
                  <input
                    type="text"
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g., Grant Starter Kit"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Category:</label>
                  <select
                    value={resourceCategory}
                    onChange={(e) => setResourceCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  >
                    <option value="starter-kit">Starter Kit</option>
                    <option value="template">Template</option>
                    <option value="guide">Guide</option>
                    <option value="policy">Policy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff' }}>Description:</label>
                  <input
                    type="text"
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                    placeholder="Optional description"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={resourceUploadLoading}
                  className="submit-btn"
                  style={{ opacity: resourceUploadLoading ? 0.6 : 1 }}
                >
                  {resourceUploadLoading ? 'Uploading...' : 'Upload Resource'}
                </button>
              </form>
            </div>

            <div>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Available Resources</h3>
              {resources.length === 0 ? (
                <div style={{ color: '#999' }}>No resources uploaded yet.</div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px'
                      }}
                    >
                      <div>
                        <div style={{ color: '#fff', fontWeight: '600' }}>{resource.title}</div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>
                          {resource.category} • {resource.originalName} • {(resource.fileSize / 1024).toFixed(1)} KB
                        </div>
                        {resource.description && (
                          <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.25rem' }}>{resource.description}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/resources/${resource.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="edit-btn"
                          style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
                        >
                          Download
                        </a>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
