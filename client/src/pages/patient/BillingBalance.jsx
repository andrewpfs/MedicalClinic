import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';

import API from '../../api';
const styles = {
  wrap: { padding: '1.5rem', maxWidth: '660px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  sectionLabel: { fontSize: '12px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' },
  invoiceRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', gap: '12px' },
  invoiceRowLast: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', gap: '12px' },
  invoiceLeft: { flex: 1 },
  invoiceTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', margin: 0 },
  invoiceSub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  invoiceRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 },
  invoiceAmount: { fontSize: '15px', fontWeight: 600, color: '#1e2b1b' },
  invoiceAmountOverdue: { fontSize: '15px', fontWeight: 600, color: '#993C1D' },
  payBtn: { fontSize: '12px', padding: '6px 14px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: 'auto' },
  historyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' },
  historyRowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' },
  historyLeft: { flex: 1 },
  historyTitle: { fontSize: '14px', color: '#374151', margin: 0 },
  historySub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  paidBadge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#E6F1FB', color: '#185FA5', border: '1px solid #B5D4F4' },
  overdueBadge: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', background: '#FAECE7', color: '#993C1D', border: '1px solid #F5C4B3' },
  lateFeeNote: { fontSize: '11px', color: '#993C1D', margin: '3px 0 0' },
  dueSoonBadge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#FEF9EC', color: '#92570A', border: '1px solid #FAD97C' },
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1.5rem 20px' },
  overdueBar: { background: '#FAECE7', border: '1px solid #F5C4B3', borderRadius: '10px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '13px', color: '#993C1D', display: 'flex', alignItems: 'center', gap: '10px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%' },
  modalHeading: { fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem', color: '#1e2b1b' },
  modalSub: { fontSize: '14px', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 },
  modalBtns: { display: 'flex', gap: '10px' },
  confirmBtn: { flex: 1, padding: '10px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
  cancelBtn: { flex: 1, padding: '10px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
  selectLabel: { fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' },
  select: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginBottom: '1rem' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' },
  lateFeeLine: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '4px' },
  totalLine: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600, color: '#1e2b1b', borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' },
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

  return (
    <div className="pt-page">
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

      <div style={styles.wrap}>

        {/* ── Overdue warning bar ────────────────────────────── */}
        {overdueInvoices.length > 0 && (
          <div style={styles.overdueBar}>
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
        <p style={styles.sectionLabel}>Outstanding invoices</p>
        <div style={styles.card}>
          {invoices.length === 0
            ? <p style={styles.emptyMsg}>No outstanding invoices.</p>
            : invoices.map((inv, i) => {
              const isOverdue = inv.DaysOverdue > 0;
              const hasLateFee = parseFloat(inv.LateFeeAmount || 0) > 0;
              const dueDate = inv.DueDate ? formatDate(inv.DueDate) : null;
              const total = totalAmount(inv);

              return (
                <div
                  key={inv.TransactionID}
                  style={i === invoices.length - 1 ? styles.invoiceRowLast : styles.invoiceRow}
                >
                  <div style={styles.invoiceLeft}>
                    <p style={styles.invoiceTitle}>Invoice #{inv.TransactionID}</p>
                    <p style={styles.invoiceSub}>
                      Visit on {formatDate(inv.AppointmentDate)} · Dr. {inv.DoctorName}
                    </p>
                    {dueDate && !isOverdue && (
                      <p style={{ ...styles.invoiceSub, marginTop: '4px' }}>Due {dueDate}</p>
                    )}
                    {isOverdue && (
                      <p style={styles.lateFeeNote}>
                        {inv.DaysOverdue} day{inv.DaysOverdue > 1 ? 's' : ''} overdue · was due {dueDate}
                      </p>
                    )}
                  </div>

                  <div style={styles.invoiceRight}>
                    {isOverdue
                      ? <span style={styles.overdueBadge}>{inv.DaysOverdue}d overdue</span>
                      : dueDate
                        ? <span style={styles.dueSoonBadge}>Due {dueDate}</span>
                        : null
                    }
                    <span style={isOverdue ? styles.invoiceAmountOverdue : styles.invoiceAmount}>
                      ${total.toFixed(2)}
                    </span>
                    {hasLateFee && (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        ${parseFloat(inv.Amount).toFixed(2)} + ${parseFloat(inv.LateFeeAmount).toFixed(2)} fee
                      </span>
                    )}
                    <button style={styles.payBtn} onClick={() => setConfirmInvoice(inv)}>
                      Pay now
                    </button>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* ── Payment history ────────────────────────────────── */}
        <p style={styles.sectionLabel}>Payment history</p>
        <div style={styles.card}>
          {history.length === 0
            ? <p style={styles.emptyMsg}>No payment history.</p>
            : history.map((h, i) => (
              <div key={h.TransactionID} style={i === history.length - 1 ? styles.historyRowLast : styles.historyRow}>
                <div style={styles.historyLeft}>
                  <p style={styles.historyTitle}>Invoice #{h.TransactionID} · ${parseFloat(h.Amount).toFixed(2)}</p>
                  <p style={styles.historySub}>Dr. {h.DoctorName} · {formatDate(h.AppointmentDate)}</p>
                </div>
                <span style={styles.paidBadge}>Paid</span>
              </div>
            ))
          }
        </div>

        {error && <p style={{ color: '#993C1D', fontSize: '13px' }}>{error}</p>}
        <a href="/patient/billing" style={styles.backLink}>← Back to billing</a>

        {/* ── Payment confirmation modal ─────────────────────── */}
        {confirmInvoice && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3 style={styles.modalHeading}>Confirm payment</h3>

              {/* Amount breakdown */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px 16px', marginBottom: '1.25rem' }}>
                <div style={styles.lateFeeLine}>
                  <span>Invoice amount</span>
                  <span>${parseFloat(confirmInvoice.Amount).toFixed(2)}</span>
                </div>
                {parseFloat(confirmInvoice.LateFeeAmount || 0) > 0 && (
                  <div style={{ ...styles.lateFeeLine, color: '#993C1D' }}>
                    <span>Late fee ({confirmInvoice.DaysOverdue} days overdue)</span>
                    <span>+${parseFloat(confirmInvoice.LateFeeAmount).toFixed(2)}</span>
                  </div>
                )}
                <div style={styles.totalLine}>
                  <span>Total due</span>
                  <span>${totalAmount(confirmInvoice).toFixed(2)}</span>
                </div>
              </div>

              <p style={styles.modalSub}>
                Visit on <strong>{formatDate(confirmInvoice.AppointmentDate)}</strong> with Dr. {confirmInvoice.DoctorName}.
              </p>

              {methods.length > 0 ? (
                <>
                  <label style={styles.selectLabel}>Pay with</label>
                  <select style={styles.select} value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
                    {methods.map(m => (
                      <option key={m.PaymentMethodID} value={m.PaymentMethodID}>
                        {m.CardType} ending in {m.LastFour}
                      </option>
                    ))}
                  </select>
                  <div style={styles.modalBtns}>
                    <button style={styles.confirmBtn} onClick={handlePay}>Confirm payment</button>
                    <button style={styles.cancelBtn} onClick={() => setConfirmInvoice(null)}>Cancel</button>
                  </div>
                  <button
                    onClick={() => navigate('/patient/billing/methods')}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: 'none', border: 'none', color: '#185FA5', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    + Add a new payment method
                  </button>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#993C1D', marginBottom: '1rem' }}>
                    No payment methods saved. Please add one first.
                  </p>
                  <div style={styles.modalBtns}>
                    <button style={styles.confirmBtn} onClick={() => navigate('/patient/billing/methods')}>
                      Add payment method
                    </button>
                    <button style={styles.cancelBtn} onClick={() => setConfirmInvoice(null)}>Cancel</button>
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
