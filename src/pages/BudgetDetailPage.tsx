import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { budgetAPI, expenseAPI } from '../services/api';
import './BudgetDetailPage.css';

const EXCHANGE_RATE = 129;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface LineItem {
  id: string;
  category: string;
  description: string;
  detail?: string;
  frequency: 'monthly' | 'one-time';
  unitCost: number;
  qty: number;
}

interface BudgetRecord {
  id: string;
  name: string;
  amount: number;
  allocated: number;
  remaining: number;
  year: number;
  category: string;
  description: string;
  createdDate: string;
}

interface ExpenseRecord {
  id: string;
  programName: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  vendor?: string;
}

const fmt = (n: number) => `KSh ${n.toLocaleString('en-KE')}`;
const fmtUSD = (n: number) =>
  `$${(n / EXCHANGE_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const uid = () => 'li-' + Math.random().toString(36).slice(2, 9);

const parseLineItems = (description: string): LineItem[] | null => {
  try {
    if (!description || !description.trim().startsWith('{')) return null;
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed.lineItems)) return parsed.lineItems;
  } catch {}
  return null;
};

const encodeDescription = (lineItems: LineItem[]): string =>
  JSON.stringify({ lineItems });

const EMPTY_FORM = {
  category: '', description: '', detail: '',
  frequency: 'monthly' as 'monthly' | 'one-time',
  unitCost: '', qty: '1',
};

export const BudgetDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [budget, setBudget]           = useState<BudgetRecord | null>(null);
  const [allExpenses, setAllExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);

  const [view, setView]               = useState<'monthly' | 'annual'>('monthly');
  const [programMonths, setProgramMonths] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [lineItems, setLineItems]     = useState<LineItem[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [lineForm, setLineForm]       = useState(EMPTY_FORM);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [budgets, expenses] = await Promise.all([
          budgetAPI.getAll(),
          expenseAPI.getAll(),
        ]);
        const found = (budgets as BudgetRecord[]).find(b => b.id === id);
        if (!found) { setError('Budget not found'); return; }
        setBudget(found);
        setLineItems(parseLineItems(found.description));
        setAllExpenses(expenses);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Computed totals ──────────────────────────────────────────────────────
  const monthlyItems  = (lineItems ?? []).filter(li => li.frequency === 'monthly');
  const oneTimeItems  = (lineItems ?? []).filter(li => li.frequency === 'one-time');
  const monthlyTotal  = monthlyItems.reduce((s, li)  => s + li.unitCost * li.qty, 0);
  const oneTimeTotal  = oneTimeItems.reduce((s, li)  => s + li.unitCost * li.qty, 0);
  const programTotal  = monthlyTotal * programMonths + oneTimeTotal;

  // ── Expense matching ─────────────────────────────────────────────────────
  const budgetName = budget?.name ?? '';
  const matchKey   = budgetName.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ')[0];
  const matchedExpenses = allExpenses.filter(e => {
    const pn = (e.programName ?? '').toLowerCase();
    const cat = (e.category ?? '').toLowerCase();
    return pn.includes('rescue center') || pn.includes('grc') ||
           pn.includes(matchKey) || cat.includes(matchKey);
  });
  const approvedExpenses = matchedExpenses.filter(e => e.status === 'approved');
  const pendingExpenses  = matchedExpenses.filter(e => e.status === 'pending');

  const monthlyActualExpenses = approvedExpenses.filter(e => e.date?.startsWith(selectedMonth));
  const monthlyActual = monthlyActualExpenses.reduce((s, e) => s + e.amount, 0);
  const totalActual   = approvedExpenses.reduce((s, e) => s + e.amount, 0);

  const activeExpenses  = view === 'monthly' ? monthlyActualExpenses : approvedExpenses;
  const activeActual    = view === 'monthly' ? monthlyActual : totalActual;
  const activeEstimated = view === 'monthly' ? monthlyTotal : programTotal;
  const activeVariance  = activeEstimated - activeActual;
  const utilization     = activeEstimated > 0 ? (activeActual / activeEstimated) * 100 : 0;

  // ── Save line items to backend ───────────────────────────────────────────
  const saveLineItems = async (items: LineItem[]) => {
    if (!budget) return;
    setSaving(true);
    try {
      const newMonthly  = items.filter(li => li.frequency === 'monthly').reduce((s, li) => s + li.unitCost * li.qty, 0);
      const newOneTime  = items.filter(li => li.frequency === 'one-time').reduce((s, li) => s + li.unitCost * li.qty, 0);
      const newTotal    = newMonthly * programMonths + newOneTime;
      const updated     = { ...budget, amount: newTotal, remaining: newTotal - (budget.allocated ?? 0), description: encodeDescription(items) };
      await budgetAPI.update(budget.id, updated);
      setBudget(updated as BudgetRecord);
      setLineItems(items);
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Add / edit line item ─────────────────────────────────────────────────
  const submitLineItem = async () => {
    if (!lineForm.description.trim() || lineForm.unitCost === '') return;
    const item: LineItem = {
      id: editingId ?? uid(),
      category: lineForm.category || 'General',
      description: lineForm.description.trim(),
      detail: lineForm.detail.trim() || undefined,
      frequency: lineForm.frequency,
      unitCost: Number(lineForm.unitCost),
      qty: Math.max(1, Number(lineForm.qty) || 1),
    };
    const current = lineItems ?? [];
    const updated = editingId
      ? current.map(li => li.id === editingId ? item : li)
      : [...current, item];
    await saveLineItems(updated);
    setShowAddForm(false);
    setEditingId(null);
    setLineForm(EMPTY_FORM);
  };

  const deleteLineItem = async (itemId: string) => {
    if (!confirm('Remove this line item?')) return;
    await saveLineItems((lineItems ?? []).filter(li => li.id !== itemId));
  };

  const startEdit = (li: LineItem) => {
    setEditingId(li.id);
    setLineForm({ category: li.category, description: li.description, detail: li.detail ?? '', frequency: li.frequency, unitCost: String(li.unitCost), qty: String(li.qty) });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => { setShowAddForm(false); setEditingId(null); setLineForm(EMPTY_FORM); };

  // ── Annual breakdown rows ────────────────────────────────────────────────
  const year = budget?.year ?? new Date().getFullYear();
  let cumEst = 0, cumAct = 0;
  const annualRows = MONTH_LABELS.map((label, i) => {
    const ms  = `${year}-${String(i + 1).padStart(2, '0')}`;
    const act = approvedExpenses.filter(e => e.date?.startsWith(ms)).reduce((s, e) => s + e.amount, 0);
    return { label, ms, act };
  });

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formPreviewMonthly = Number(lineForm.unitCost) * (Number(lineForm.qty) || 1);
  const formPreviewTotal   = formPreviewMonthly * (lineForm.frequency === 'monthly' ? programMonths : 1);

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) return (
    <div className="bdp-page">
      <div className="bdp-controls no-print"><Link to="/budgets" className="bdp-back">← All Budgets</Link></div>
      <p className="bdp-loading">Loading budget…</p>
    </div>
  );
  if (error || !budget) return (
    <div className="bdp-page">
      <div className="bdp-controls no-print"><Link to="/budgets" className="bdp-back">← All Budgets</Link></div>
      <p className="bdp-error">{error ?? 'Budget not found'}</p>
    </div>
  );

  return (
    <div className="bdp-page">

      {/* ── Screen controls ─────────────────────────────────────────────── */}
      <div className="bdp-controls no-print">
        <Link to="/budgets" className="bdp-back">← All Budgets</Link>

        <div className="bdp-view-toggle">
          <button className={view === 'monthly' ? 'active' : ''} onClick={() => setView('monthly')}>Monthly</button>
          <button className={view === 'annual'  ? 'active' : ''} onClick={() => setView('annual')}>Annual</button>
        </div>

        {view === 'monthly' && (
          <div className="bdp-field">
            <label htmlFor="bdp-month">Month:</label>
            <input id="bdp-month" type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
          </div>
        )}

        <div className="bdp-field">
          <label htmlFor="bdp-dur">Programme Duration:</label>
          <select id="bdp-dur" value={programMonths} onChange={e => setProgramMonths(Number(e.target.value))}>
            {[1,2,3,4,5,6,9,12].map(m => <option key={m} value={m}>{m} months</option>)}
          </select>
        </div>

        <button
          className={`bdp-add-btn ${showAddForm ? 'cancel' : ''}`}
          onClick={() => showAddForm ? cancelForm() : setShowAddForm(true)}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Line Item'}
        </button>

        <button className="bdp-print-btn" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
      </div>

      {/* ── Add / Edit line item form ──────────────────────────────────── */}
      {showAddForm && (
        <div className="bdp-add-form no-print">
          <h3>{editingId ? 'Edit Line Item' : 'Add Budget Line Item'}</h3>
          <div className="bdp-form-grid">
            <div className="bdp-form-field full-width">
              <label>Description *</label>
              <input
                type="text"
                placeholder="e.g. Rent – 3 Rooms, Teacher Salaries, Bunk Beds…"
                value={lineForm.description}
                onChange={e => setLineForm({ ...lineForm, description: e.target.value })}
              />
            </div>
            <div className="bdp-form-field">
              <label>Category</label>
              <input
                type="text"
                placeholder="Facilities, Personnel, Equipment…"
                value={lineForm.category}
                onChange={e => setLineForm({ ...lineForm, category: e.target.value })}
              />
            </div>
            <div className="bdp-form-field">
              <label>Frequency *</label>
              <select value={lineForm.frequency} onChange={e => setLineForm({ ...lineForm, frequency: e.target.value as 'monthly' | 'one-time' })}>
                <option value="monthly">Monthly Recurring</option>
                <option value="one-time">One-Time Cost</option>
              </select>
            </div>
            <div className="bdp-form-field">
              <label>Unit Cost (KES) *</label>
              <input
                type="number" min="0" placeholder="0"
                value={lineForm.unitCost}
                onChange={e => setLineForm({ ...lineForm, unitCost: e.target.value })}
              />
            </div>
            <div className="bdp-form-field">
              <label>Quantity</label>
              <input
                type="number" min="1"
                value={lineForm.qty}
                onChange={e => setLineForm({ ...lineForm, qty: e.target.value })}
              />
            </div>
            <div className="bdp-form-field full-width">
              <label>Detail / Note</label>
              <input
                type="text"
                placeholder="e.g. 4 units × KES 5,000 or One-time purchase"
                value={lineForm.detail}
                onChange={e => setLineForm({ ...lineForm, detail: e.target.value })}
              />
            </div>
          </div>

          {lineForm.unitCost !== '' && Number(lineForm.unitCost) > 0 && (
            <div className="bdp-form-preview">
              <span>
                {fmt(formPreviewMonthly)}
                {lineForm.frequency === 'monthly'
                  ? ` /month × ${programMonths} months = ${fmt(formPreviewTotal)}`
                  : ' (one-time)'}
              </span>
              <span className="usd">{fmtUSD(formPreviewTotal)}</span>
            </div>
          )}

          <div className="bdp-form-actions">
            <button className="bdp-save-btn" onClick={submitLineItem} disabled={saving || !lineForm.description.trim() || lineForm.unitCost === ''}>
              {saving ? 'Saving…' : editingId ? 'Update Line Item' : 'Add Line Item'}
            </button>
            <button className="bdp-cancel-btn" onClick={cancelForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ══ PRINTABLE REPORT ════════════════════════════════════════════ */}
      <div className="bdp-report">

        {/* Header */}
        <div className="bdp-header">
          <h1>ADE CBO Foundation</h1>
          <h2>{budget.name}</h2>
          <h3>
            {view === 'monthly'
              ? `Monthly Budget — ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : `Annual Budget — ${year}`}
          </h3>
          <p className="bdp-meta">
            Category: {budget.category}&nbsp;|&nbsp;Year: {year}&nbsp;|&nbsp;
            Programme Duration: {programMonths} months&nbsp;|&nbsp;
            Prepared: {today}&nbsp;|&nbsp;KES {EXCHANGE_RATE} = USD 1.00
          </p>
        </div>

        {/* ── Monthly Recurring Line Items ─────────────────────────────── */}
        {lineItems !== null ? (
          <>
            {monthlyItems.length > 0 && (
              <section className="bdp-section">
                <h4>Monthly Recurring Costs</h4>
                <table className="bdp-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Item / Description</th>
                      <th className="num">Unit Cost (KES)</th>
                      <th className="num">Qty</th>
                      <th className="num">Monthly (KES)</th>
                      <th className="num">{programMonths}-Month Total (KES)</th>
                      <th className="num">USD</th>
                      <th className="no-print actions-col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyItems.map(li => {
                      const monthly = li.unitCost * li.qty;
                      const total   = monthly * programMonths;
                      return (
                        <tr key={li.id}>
                          <td>{li.category}</td>
                          <td>
                            <strong className="bdp-item-name">{li.description}</strong>
                            {li.detail && <div className="bdp-item-desc">{li.detail}</div>}
                          </td>
                          <td className="num">{fmt(li.unitCost)}</td>
                          <td className="num">{li.qty}</td>
                          <td className="num">{fmt(monthly)}</td>
                          <td className="num">{fmt(total)}</td>
                          <td className="num">{fmtUSD(total)}</td>
                          <td className="no-print">
                            <div className="bdp-row-actions">
                              <button className="bdp-edit-btn" onClick={() => startEdit(li)} title="Edit">✏️</button>
                              <button className="bdp-del-btn"  onClick={() => deleteLineItem(li.id)} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bdp-subtotal">
                      <td colSpan={4}><strong>Monthly Recurring Subtotal</strong></td>
                      <td className="num"><strong>{fmt(monthlyTotal)}/mo</strong></td>
                      <td className="num"><strong>{fmt(monthlyTotal * programMonths)}</strong></td>
                      <td className="num"><strong>{fmtUSD(monthlyTotal * programMonths)}</strong></td>
                      <td className="no-print"></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* ── One-Time Setup Costs ──────────────────────────────────── */}
            {oneTimeItems.length > 0 && (
              <section className="bdp-section">
                <h4>One-Time Setup Costs (Month 1 Only)</h4>
                <table className="bdp-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Item / Description</th>
                      <th className="num">Unit Cost (KES)</th>
                      <th className="num">Qty</th>
                      <th className="num">Total (KES)</th>
                      <th className="num">USD</th>
                      <th className="no-print actions-col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {oneTimeItems.map(li => {
                      const total = li.unitCost * li.qty;
                      return (
                        <tr key={li.id}>
                          <td>{li.category}</td>
                          <td>
                            <strong className="bdp-item-name">{li.description}</strong>
                            {li.detail && <div className="bdp-item-desc">{li.detail}</div>}
                          </td>
                          <td className="num">{li.unitCost > 0 ? fmt(li.unitCost) : '—'}</td>
                          <td className="num">{li.qty}</td>
                          <td className="num">{total > 0 ? fmt(total) : '—'}</td>
                          <td className="num">{total > 0 ? fmtUSD(total) : '—'}</td>
                          <td className="no-print">
                            <div className="bdp-row-actions">
                              <button className="bdp-edit-btn" onClick={() => startEdit(li)} title="Edit">✏️</button>
                              <button className="bdp-del-btn"  onClick={() => deleteLineItem(li.id)} title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bdp-subtotal">
                      <td colSpan={4}><strong>One-Time Setup Subtotal</strong></td>
                      <td className="num"><strong>{fmt(oneTimeTotal)}</strong></td>
                      <td className="num"><strong>{fmtUSD(oneTimeTotal)}</strong></td>
                      <td className="no-print"></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {lineItems.length === 0 && (
              <section className="bdp-section">
                <p className="bdp-empty">No line items yet. Click "+ Add Line Item" to start building this budget.</p>
              </section>
            )}

            {/* ── Month-by-Month Cost Breakdown ─────────────────────────── */}
            {lineItems.length > 0 && (
              <section className="bdp-section">
                <h4>Month-by-Month Cost Breakdown — {programMonths}-Month Programme</h4>
                <table className="bdp-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="num">Recurring (KES)</th>
                      <th className="num">One-Time Setup (KES)</th>
                      <th className="num">Monthly Total (KES)</th>
                      <th className="num">USD</th>
                      <th className="num">Cumulative (KES)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: programMonths }, (_, i) => {
                      const setup      = i === 0 ? oneTimeTotal : 0;
                      const rowTotal   = monthlyTotal + setup;
                      const cumulative = monthlyTotal * (i + 1) + oneTimeTotal;
                      return (
                        <tr key={i}>
                          <td>Month {i + 1}</td>
                          <td className="num">{fmt(monthlyTotal)}</td>
                          <td className="num">{setup > 0 ? fmt(setup) : '—'}</td>
                          <td className="num">{fmt(rowTotal)}</td>
                          <td className="num">{fmtUSD(rowTotal)}</td>
                          <td className="num">{fmt(cumulative)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bdp-subtotal">
                      <td><strong>Programme Total</strong></td>
                      <td className="num"><strong>{fmt(monthlyTotal * programMonths)}</strong></td>
                      <td className="num"><strong>{fmt(oneTimeTotal)}</strong></td>
                      <td className="num bdp-grand-total"><strong>{fmt(programTotal)}</strong></td>
                      <td className="num bdp-grand-total"><strong>{fmtUSD(programTotal)}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}
          </>
        ) : (
          /* ── Fallback: plain budget (no line items) ──────────────────── */
          <section className="bdp-section">
            <h4>Budget Details</h4>
            <table className="bdp-table">
              <thead>
                <tr>
                  <th>Name</th><th>Category</th>
                  <th className="num">Total (KES)</th>
                  <th className="num">Allocated</th>
                  <th className="num">Remaining</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{budget.name}</td>
                  <td>{budget.category}</td>
                  <td className="num">{fmt(budget.amount)}</td>
                  <td className="num">{fmt(budget.allocated)}</td>
                  <td className="num">{fmt(budget.remaining)}</td>
                </tr>
              </tbody>
            </table>
            {budget.description && <p className="bdp-plain-desc">{budget.description}</p>}
          </section>
        )}

        {/* ── Actual Expenses ─────────────────────────────────────────── */}
        <section className="bdp-section">
          <h4>
            Actual Expenses
            {view === 'monthly'
              ? ` — ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              : ` — All Recorded (${year})`}
          </h4>
          {activeExpenses.length === 0 ? (
            <p className="bdp-empty">
              No approved expenses recorded{view === 'monthly' ? ' for this month.' : '.'}
              {pendingExpenses.length > 0 && ` (${pendingExpenses.length} pending approval)`}
            </p>
          ) : (
            <table className="bdp-table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category</th>
                  <th>Vendor</th>
                  <th className="num">Amount (KES)</th>
                  <th className="num">USD</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeExpenses.map((e, i) => (
                  <tr key={i}>
                    <td>{e.date}</td>
                    <td>{e.description}</td>
                    <td>{e.category}</td>
                    <td>{e.vendor ?? '—'}</td>
                    <td className="num">{fmt(e.amount)}</td>
                    <td className="num">{fmtUSD(e.amount)}</td>
                    <td><span className={`bdp-badge ${e.status}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bdp-subtotal">
                  <td colSpan={4}><strong>Total Actual Spend</strong></td>
                  <td className="num"><strong>{fmt(activeActual)}</strong></td>
                  <td className="num"><strong>{fmtUSD(activeActual)}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* ── Reconciliation Summary ───────────────────────────────────── */}
        <section className="bdp-section">
          <h4>Reconciliation Summary</h4>
          <div className="bdp-recon-grid">
            <div className="bdp-recon-card">
              <span className="rc-label">{view === 'monthly' ? 'Monthly Estimate' : `Programme Total (${programMonths} mo)`}</span>
              <span className="rc-value">{fmt(activeEstimated)}</span>
              <span className="rc-usd">{fmtUSD(activeEstimated)}</span>
            </div>
            <div className="bdp-recon-card">
              <span className="rc-label">Actual Spend (Approved)</span>
              <span className="rc-value">{fmt(activeActual)}</span>
              <span className="rc-usd">{fmtUSD(activeActual)}</span>
            </div>
            <div className={`bdp-recon-card ${activeVariance >= 0 ? 'under' : 'over'}`}>
              <span className="rc-label">{activeVariance >= 0 ? 'Under Budget ✓' : 'Over Budget ⚠'}</span>
              <span className="rc-value">{fmt(Math.abs(activeVariance))}</span>
              <span className="rc-usd">{fmtUSD(Math.abs(activeVariance))}</span>
            </div>
            <div className="bdp-recon-card highlight">
              <span className="rc-label">Budget Utilization</span>
              <span className="rc-value">{utilization.toFixed(1)}%</span>
              <span className="rc-usd">
                {pendingExpenses.length > 0 ? `${pendingExpenses.length} expense(s) pending` : 'All expenses reconciled'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Annual Month-by-Month Actual vs Estimated ────────────────── */}
        {view === 'annual' && (
          <section className="bdp-section">
            <h4>Month-by-Month Actual vs Estimated — {year}</h4>
            <table className="bdp-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="num">Estimated (KES)</th>
                  <th className="num">Actual Spend (KES)</th>
                  <th className="num">Variance</th>
                  <th className="num">Cumul. Estimated</th>
                  <th className="num">Cumul. Actual</th>
                </tr>
              </thead>
              <tbody>
                {annualRows.map((row, i) => {
                  cumEst += monthlyTotal;
                  cumAct += row.act;
                  const isCurrent = row.ms === selectedMonth;
                  return (
                    <tr key={i} className={isCurrent ? 'bdp-current-month' : ''}>
                      <td>{row.label} {year}{isCurrent ? ' ◀' : ''}</td>
                      <td className="num">{fmt(monthlyTotal)}</td>
                      <td className="num">{row.act > 0 ? fmt(row.act) : '—'}</td>
                      <td className={`num ${row.act > 0 ? (monthlyTotal - row.act >= 0 ? 'positive' : 'negative') : ''}`}>
                        {row.act > 0 ? fmt(monthlyTotal - row.act) : '—'}
                      </td>
                      <td className="num">{fmt(cumEst)}</td>
                      <td className="num">{cumAct > 0 ? fmt(cumAct) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bdp-subtotal">
                  <td><strong>Annual Total</strong></td>
                  <td className="num"><strong>{fmt(monthlyTotal * 12)}</strong></td>
                  <td className="num"><strong>{totalActual > 0 ? fmt(totalActual) : '—'}</strong></td>
                  <td className={`num ${totalActual > 0 ? (monthlyTotal * 12 - totalActual >= 0 ? 'positive' : 'negative') : ''}`}>
                    <strong>{totalActual > 0 ? fmt(monthlyTotal * 12 - totalActual) : '—'}</strong>
                  </td>
                  <td></td><td></td>
                </tr>
              </tfoot>
            </table>
          </section>
        )}

        {/* Footer */}
        <div className="bdp-footer">
          <p>ADE CBO Foundation &nbsp;|&nbsp; {budget.name} &nbsp;|&nbsp; {year}</p>
          <p>Prepared for programme planning and financial oversight. All figures in KES unless marked USD.</p>
        </div>

      </div>
    </div>
  );
};
