import { useState } from 'react';
import './GirlsRescueCenterBudgetPage.css';

const EXCHANGE_RATE = 129; // KES per USD

// ── Static spreadsheet data ───────────────────────────────────────────────────
const ONE_TIME_ITEMS = [
  { category: 'Furniture & Setup',  item: 'Bunk Beds (3-high, 4 sets)',             qty: 4,  unitKES: 3000,  totalKES: 12000 },
  { category: 'Furniture & Setup',  item: 'Lockers / Storage for 12 Girls',          qty: 1,  unitKES: 5000,  totalKES: 5000  },
  { category: 'Furniture & Setup',  item: 'Classroom Desks & Chairs (30 students)',  qty: 30, unitKES: 800,   totalKES: 24000 },
  { category: 'Tech Setup',         item: 'Donated Laptops (10 units)',              qty: 10, unitKES: 0,     totalKES: 0     },
  { category: 'Learning Materials', item: 'Digital Resources (free online textbooks)', qty: 0, unitKES: 0,   totalKES: 0     },
];

const MONTHLY_ITEMS = [
  { category: 'Facilities',            item: 'Rent – 3 Rooms (Dormitory + Classroom + Office)', unitKES: 5000,  qty: 4,  monthlyKES: 20000 },
  { category: 'Food & Boarding',       item: 'Meals for 12 Girls (Boarding)',                   unitKES: 15000, qty: 1,  monthlyKES: 15000 },
  { category: 'Food & Boarding',       item: 'Meals for Day School (30 Students)',               unitKES: 12000, qty: 1,  monthlyKES: 12000 },
  { category: 'Staff Salaries',        item: '2 Teachers @ KES 30,000 / Month Each',            unitKES: 30000, qty: 2,  monthlyKES: 60000 },
  { category: 'Hygiene & Health',      item: 'Sanitary Pads, Soap, First-Aid Kits',             unitKES: 10000, qty: 1,  monthlyKES: 10000 },
  { category: 'Counseling & Mentorship', item: 'Life Skills & Counseling Programs',             unitKES: 10000, qty: 1,  monthlyKES: 10000 },
  { category: 'Emergency Fund',        item: 'Transport & Emergency Pickup',                     unitKES: 10000, qty: 1,  monthlyKES: 10000 },
];

const PROGRAM_MONTHS = 6;

const fmt = (kes: number) =>
  `KSh ${kes.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;

const fmtUSD = (kes: number) =>
  `$${(kes / EXCHANGE_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GirlsRescueCenterBudgetPage = () => {
  const [month, setMonth] = useState(PROGRAM_MONTHS);

  const monthlyTotal = MONTHLY_ITEMS.reduce((s, i) => s + i.monthlyKES, 0);
  const oneTimeTotal = ONE_TIME_ITEMS.reduce((s, i) => s + i.totalKES, 0);
  const programTotal = monthlyTotal * month + oneTimeTotal;

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="grc-budget-page">
      {/* ── Print controls (hidden in print) ── */}
      <div className="grc-controls no-print">
        <button className="back-btn" onClick={() => history.back()}>← Back</button>
        <div className="month-picker">
          <label htmlFor="months">Program Duration (months):</label>
          <select id="months" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {[1,2,3,4,5,6,9,12].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button className="print-btn" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
      </div>

      {/* ── Printable report body ── */}
      <div className="grc-report">
        {/* Header */}
        <div className="grc-header">
          <h1>ADE CBO Foundation</h1>
          <h2>Girls Rescue Center</h2>
          <h3>Projected Budget — {month}-Month Programme</h3>
          <p className="meta">Prepared: {today} &nbsp;|&nbsp; Exchange Rate: KES {EXCHANGE_RATE} = USD 1.00</p>
        </div>

        {/* ── Monthly Recurring Costs ── */}
        <section className="grc-section">
          <h4>Monthly Recurring Expenses</h4>
          <table className="grc-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Description</th>
                <th className="num">Unit Cost (KES)</th>
                <th className="num">Qty</th>
                <th className="num">Monthly (KES)</th>
                <th className="num">{month}-Month Total (KES)</th>
                <th className="num">USD</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_ITEMS.map((row, i) => (
                <tr key={i}>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td className="num">{fmt(row.unitKES)}</td>
                  <td className="num">{row.qty}</td>
                  <td className="num">{fmt(row.monthlyKES)}</td>
                  <td className="num">{fmt(row.monthlyKES * month)}</td>
                  <td className="num">{fmtUSD(row.monthlyKES * month)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal">
                <td colSpan={4}><strong>Monthly Recurring Subtotal</strong></td>
                <td className="num"><strong>{fmt(monthlyTotal)}</strong></td>
                <td className="num"><strong>{fmt(monthlyTotal * month)}</strong></td>
                <td className="num"><strong>{fmtUSD(monthlyTotal * month)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* ── One-Time Setup Costs ── */}
        <section className="grc-section">
          <h4>One-Time Setup Costs (Month 1)</h4>
          <table className="grc-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Description</th>
                <th className="num">Unit Cost (KES)</th>
                <th className="num">Qty</th>
                <th className="num">Total (KES)</th>
                <th className="num">USD</th>
              </tr>
            </thead>
            <tbody>
              {ONE_TIME_ITEMS.map((row, i) => (
                <tr key={i}>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td className="num">{row.unitKES > 0 ? fmt(row.unitKES) : '—'}</td>
                  <td className="num">{row.qty}</td>
                  <td className="num">{row.totalKES > 0 ? fmt(row.totalKES) : '—'}</td>
                  <td className="num">{row.totalKES > 0 ? fmtUSD(row.totalKES) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="subtotal">
                <td colSpan={4}><strong>One-Time Setup Subtotal</strong></td>
                <td className="num"><strong>{fmt(oneTimeTotal)}</strong></td>
                <td className="num"><strong>{fmtUSD(oneTimeTotal)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* ── Monthly Breakdown Summary ── */}
        <section className="grc-section">
          <h4>Month-by-Month Breakdown</h4>
          <table className="grc-table">
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
              {Array.from({ length: month }, (_, i) => {
                const setup = i === 0 ? oneTimeTotal : 0;
                const rowTotal = monthlyTotal + setup;
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
              <tr className="subtotal">
                <td><strong>PROGRAMME TOTAL</strong></td>
                <td className="num"><strong>{fmt(monthlyTotal * month)}</strong></td>
                <td className="num"><strong>{fmt(oneTimeTotal)}</strong></td>
                <td className="num total-cell"><strong>{fmt(programTotal)}</strong></td>
                <td className="num total-cell"><strong>{fmtUSD(programTotal)}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </section>

        {/* ── Summary Box ── */}
        <section className="grc-summary-box">
          <h4>Budget Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Monthly Recurring Cost</span>
              <span className="value">{fmt(monthlyTotal)}</span>
              <span className="usd">{fmtUSD(monthlyTotal)}</span>
            </div>
            <div className="summary-item">
              <span className="label">One-Time Setup Cost</span>
              <span className="value">{fmt(oneTimeTotal)}</span>
              <span className="usd">{fmtUSD(oneTimeTotal)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Programme Duration</span>
              <span className="value">{month} months</span>
            </div>
            <div className="summary-item highlight">
              <span className="label">Total Budget ({month} Months)</span>
              <span className="value">{fmt(programTotal)}</span>
              <span className="usd">{fmtUSD(programTotal)}</span>
            </div>
          </div>
          <p className="note">
            Budget covers: 12 boarding girls + 30 day-school students &nbsp;|&nbsp;
            Beneficiaries: up to 42 girls &nbsp;|&nbsp;
            Staff: 2 teachers + support
          </p>
        </section>

        {/* ── Footer ── */}
        <div className="grc-footer">
          <p>ADE CBO Foundation – Girls Rescue Center &nbsp;|&nbsp; Kibera, Nairobi &nbsp;|&nbsp; adekiberafoundation.org</p>
          <p>This budget projection is prepared for programme planning and donor reporting purposes.</p>
        </div>
      </div>
    </div>
  );
};
