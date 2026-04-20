import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';

import API from '../../api';
const s = {
  body:             { background: '#f5f3ee', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' },
  wrap:             { maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  summaryGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '2rem' },
  statCard:         { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  statValue:        { fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.1 },
  statValueRed:     { fontSize: '26px', fontWeight: 700, color: '#993C1D', lineHeight: 1.1 },
  statLabel:        { fontSize: '12px', color: '#9ca3af', marginTop: '4px' },
  sectionLabel:     { fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' },
  /* invoice cards */
  invoiceCard:      { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px 20px', marginBottom: '10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: '4px solid #d1d5db' },
  invoiceCardOverdue:{ background: '#fff8f6', border: '1px solid #F5C4B3', borderRadius: '14px', padding: '18px 20px', marginBottom: '10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', boxShadow: '0 1px 3px rgba(153,60,29,0.06)', borderLeft: '4px solid #993C1D' },
  invoiceLeft:      { flex: 1 },
  invoiceTitle:     { fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 3px' },
  invoiceSub:       { fontSize: '12px', color: '#9ca3af', margin: 0 },
  lateFeeNote:      { fontSize: '11px', color: '#993C1D', marginTop: '4px' },
  invoiceRight:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 },
  invoiceAmount:    { fontSize: '20px', fontWeight: 700, color: '#111827' },
  invoiceAmountRed: { fontSize: '20px', fontWeight: 700, color: '#993C1D' },
  payBtn:           { fontSize: '13px', fontWeight: 600, padding: '8px 18px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' },
  overdueBadge:     { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: '#FAECE7', color: '#993C1D', border: '1px solid #F5C4B3' },
  dueSoonBadge:     { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#FEF9EC', color: '#92570A', border: '1px solid #FAD97C' },
  /* history */
  historyCard:      { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  historyRow:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' },
  historyRowLast:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' },
  historyLeft:      { flex: 1 },
  historyTitle:     { fontSize: '14px', fontWeight: 500, color: '#374151', margin: 0 },
  historySub:       { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  historyAmount:    { fontSize: '14px', fontWeight: 600, color: '#374151', marginRight: '12px' },
  paidBadge:        { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  emptyMsg:         { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1.5rem 20px' },
  /* overdue bar */
  overdueBar:       { background: '#FAECE7', border: '1px solid #F5C4B3', borderRadius: '12px', padding: '14px 18px', marginBottom: '1.5rem', fontSize: '13px', color: '#993C1D', display: 'flex', alignItems: 'center', gap: '10px' },
  /* modal */
  modal:            { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox:         { background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeading:     { fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem', color: '#111827' },
  modalSub:         { fontSize: '14px', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 },
  modalBtns:        { display: 'flex', gap: '10px' },
  confirmBtn:       { flex: 1, padding: '11px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn:        { flex: 1, padding: '11px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' },
  selectLabel:      { fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px', display: 'block' },
  select:           { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '1rem', fontFamily: 'inherit' },
  backLink:         { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' },
  lateFeeLine:      { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
  totalLine:        { display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, color: '#1e2b1b', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function totalAmount(inv) {
  return parseFloat(inv.Amount) + parseFloat(inv.LateFeeAmount || 0);
}

export default function BillingBalance() {
  const [invoices, setInvoices] = useState([]);
  const [history, setHistory] = useState([]);
  const [methods, setMethods] = useState([]);
  const [confirmInvoice, setConfirmInvoice] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = () => {
    fetch(`${API}/patient/api/payments`, { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => { if (data) setInvoices(data); });

    fetch(`${API}/patient/api/payment-history`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data) setHistory(data); });

    fetch(`${API}/patient/api/payment-methods`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data) { setMethods(data); if (data.length > 0) setSelectedMethod(data[0].PaymentMethodID); } });
  };

  useEffect(() => { loadData(); }, [navigate]);

  const handlePay = async () => {
    const res = await fetch(`${API}/patient/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: confirmInvoice.TransactionID }),
      credentials: 'include',
    });
    if (res.ok) {
      setConfirmInvoice(null);
      loadData();
    } else {
      setError('Payment failed.');
      setConfirmInvoice(null);
    }
  };

  const overdueInvoices = invoices.filter(inv => inv.DaysOverdue > 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + totalAmount(inv), 0);

  return (
    <div style={s.body}>
      <Navbar />

      <div className="pt-banner">
        <div className="pt-banner__inner">
          <div className="pt-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <h1 className="pt-banner__title">Balance Details</h1>
            <p className="pt-banner__sub">Outstanding invoices and payment history</p>
          </div>
        </div>
      </div>

      <div style={s.wrap}>

        {/* ── Summary stat cards ─────────────────────────────── */}
        <div style={{ ...s.summaryGrid, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div style={s.statCard}>
            <div style={totalOutstanding > 0 ? s.statValueRed : s.statValue}>${totalOutstanding.toFixed(2)}</div>
            <div style={s.statLabel}>Outstanding balance</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{invoices.length}</div>
            <div style={s.statLabel}>Open invoice{invoices.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* ── Overdue warning bar ────────────────────────────── */}
        {overdueInvoices.length > 0 && (
          <div style={s.overdueBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>
              You have <strong>{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}</strong>. Late fees are being applied weekly until payment is received.
            </span>
          </div>
        )}

        {/* ── Outstanding invoices ───────────────────────────── */}
        <p style={s.sectionLabel}>Outstanding invoices</p>
        {invoices.length === 0
          ? <div style={{ ...s.statCard, marginBottom: '1.5rem' }}><p style={s.emptyMsg}>No outstanding invoices.</p></div>
          : invoices.map(inv => {
            const isOverdue = inv.DaysOverdue > 0;
            const hasLateFee = parseFloat(inv.LateFeeAmount || 0) > 0;
            const dueDate = inv.DueDate ? formatDate(inv.DueDate) : null;
            const total = totalAmount(inv);
            return (
              <div key={inv.TransactionID} style={isOverdue ? s.invoiceCardOverdue : s.invoiceCard}>
                <div style={s.invoiceLeft}>
                  <p style={s.invoiceTitle}>
                    {inv.IsCancellationFee ? 'Late Cancellation Fee' : `Invoice #${inv.TransactionID}`}
                  </p>
                  <p style={s.invoiceSub}>
                    {inv.IsCancellationFee
                      ? `Charged on ${formatDate(inv.AppointmentDate)} · Appointment cancelled within 24 hrs`
                      : `Visit on ${formatDate(inv.AppointmentDate)} · Dr. ${inv.DoctorName}`}
                  </p>
                  {dueDate && !isOverdue && <p style={{ ...s.invoiceSub, marginTop: '4px' }}>Due {dueDate}</p>}
                  {isOverdue && (
                    <p style={s.lateFeeNote}>{inv.DaysOverdue} day{inv.DaysOverdue > 1 ? 's' : ''} overdue · was due {dueDate}</p>
                  )}
                  {hasLateFee && (
                    <p style={{ ...s.lateFeeNote, marginTop: '4px' }}>
                      Base ${parseFloat(inv.Amount).toFixed(2)} + ${parseFloat(inv.LateFeeAmount).toFixed(2)} late fee
                    </p>
                  )}
                </div>
                <div style={s.invoiceRight}>
                  {isOverdue
                    ? <span style={s.overdueBadge}>{inv.DaysOverdue}d overdue</span>
                    : dueDate ? <span style={s.dueSoonBadge}>Due {dueDate}</span> : null
                  }
                  <span style={isOverdue ? s.invoiceAmountRed : s.invoiceAmount}>${total.toFixed(2)}</span>
                  <button style={s.payBtn} onClick={() => setConfirmInvoice(inv)}>Pay now</button>
                </div>
              </div>
            );
          })
        }

        {/* ── Payment history ────────────────────────────────── */}
        <p style={{ ...s.sectionLabel, marginTop: '1.5rem' }}>Payment history</p>
        <div style={s.historyCard}>
          {history.length === 0
            ? <p style={s.emptyMsg}>No payment history.</p>
            : history.map((h, i) => (
              <div key={h.TransactionID} style={i === history.length - 1 ? s.historyRowLast : s.historyRow}>
                <div style={s.historyLeft}>
                  <p style={s.historyTitle}>Invoice #{h.TransactionID}</p>
                  <p style={s.historySub}>Dr. {h.DoctorName} · {formatDate(h.AppointmentDate)}</p>
                </div>
                <span style={s.historyAmount}>${parseFloat(h.Amount).toFixed(2)}</span>
                <span style={s.paidBadge}>Paid</span>
              </div>
            ))
          }
        </div>

        {error && <p style={{ color: '#993C1D', fontSize: '13px', marginTop: '0.5rem' }}>{error}</p>}
        <a href="/patient/billing" style={s.backLink}>← Back to billing</a>

        {/* ── Payment confirmation modal ─────────────────────── */}
        {confirmInvoice && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={s.modalHeading}>Confirm payment</h3>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', marginBottom: '1.25rem' }}>
                <div style={s.lateFeeLine}>
                  <span>Invoice amount</span>
                  <span>${parseFloat(confirmInvoice.Amount).toFixed(2)}</span>
                </div>
                {parseFloat(confirmInvoice.LateFeeAmount || 0) > 0 && (
                  <div style={{ ...s.lateFeeLine, color: '#993C1D' }}>
                    <span>Late fee ({confirmInvoice.DaysOverdue} days overdue)</span>
                    <span>+${parseFloat(confirmInvoice.LateFeeAmount).toFixed(2)}</span>
                  </div>
                )}
                <div style={s.totalLine}>
                  <span>Total due</span>
                  <span>${totalAmount(confirmInvoice).toFixed(2)}</span>
                </div>
              </div>
              <p style={s.modalSub}>
                Visit on <strong>{formatDate(confirmInvoice.AppointmentDate)}</strong> with Dr. {confirmInvoice.DoctorName}.
              </p>
              {methods.length > 0 ? (
                <>
                  <label style={s.selectLabel}>Pay with</label>
                  <select style={s.select} value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
                    {methods.map(m => (
                      <option key={m.PaymentMethodID} value={m.PaymentMethodID}>
                        {m.CardType} ending in {m.LastFour}
                      </option>
                    ))}
                  </select>
                  <div style={s.modalBtns}>
                    <button style={s.confirmBtn} onClick={handlePay}>Confirm payment</button>
                    <button style={s.cancelBtn} onClick={() => setConfirmInvoice(null)}>Cancel</button>
                  </div>
                  <button onClick={() => navigate('/patient/billing/methods')}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: 'none', border: 'none', color: '#185FA5', fontSize: '13px', cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
                    + Add a new payment method
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#993C1D', marginBottom: '1rem' }}>
                    No payment methods saved. Please add one first.
                  </p>
                  <div style={s.modalBtns}>
                    <button style={s.confirmBtn} onClick={() => navigate('/patient/billing/methods')}>Add payment method</button>
                    <button style={s.cancelBtn} onClick={() => setConfirmInvoice(null)}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
