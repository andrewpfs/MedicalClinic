import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '660px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  sectionLabel: { fontSize: '12px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' },
  invoiceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' },
  invoiceRowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' },
  invoiceLeft: { flex: 1 },
  invoiceTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', margin: 0 },
  invoiceSub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  invoiceAmount: { fontSize: '15px', fontWeight: 500, color: '#1e2b1b', marginRight: '12px' },
  payBtn: { fontSize: '12px', padding: '6px 14px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: 'auto' },
  historyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' },
  historyRowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' },
  historyLeft: { flex: 1 },
  historyTitle: { fontSize: '14px', color: '#374151', margin: 0 },
  historySub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  paidBadge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#E6F1FB', color: '#185FA5', border: '1px solid #B5D4F4' },
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1.5rem 20px' },
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
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    fetch('/patient/api/payments', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => { if (data) setInvoices(data); });

    fetch('/patient/api/payment-history', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data) setHistory(data); });

    fetch('/patient/api/payment-methods', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (data) { setMethods(data); if (data.length > 0) setSelectedMethod(data[0].PaymentMethodID); } });
  };

  useEffect(() => { loadData(); }, [navigate]);

  const handlePay = async () => {
    const res = await fetch('/patient/pay', {
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

  return (
    <>
      <Navbar />
      <div style={styles.wrap}>
      <h1 style={styles.heading}>Balance details</h1>

      <p style={styles.sectionLabel}>Outstanding invoices</p>
      <div style={styles.card}>
        {invoices.length === 0
          ? <p style={styles.emptyMsg}>No outstanding invoices.</p>
          : invoices.map((inv, i) => (
            <div key={inv.TransactionID} style={i === invoices.length - 1 ? styles.invoiceRowLast : styles.invoiceRow}>
              <div style={styles.invoiceLeft}>
                <p style={styles.invoiceTitle}>Invoice #{inv.TransactionID}</p>
                <p style={styles.invoiceSub}>Visit on {formatDate(inv.AppointmentDate)} · Dr. {inv.DoctorName}</p>
              </div>
              <span style={styles.invoiceAmount}>${parseFloat(inv.Amount).toFixed(2)}</span>
              <button style={styles.payBtn} onClick={() => setConfirmInvoice(inv)}>Pay now</button>
            </div>
          ))
        }
      </div>

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

      {confirmInvoice && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalHeading}>Confirm payment</h3>
            <p style={styles.modalSub}>
              You are about to pay <strong>${parseFloat(confirmInvoice.Amount).toFixed(2)}</strong> for your visit on <strong>{formatDate(confirmInvoice.AppointmentDate)}</strong> with Dr. {confirmInvoice.DoctorName}.
            </p>

            {methods.length > 0 ? (
              <>
                <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                  Use this payment method or would you like to add a new one?
                </p>
                <label style={styles.selectLabel}>Pay with</label>
                <select style={styles.select} value={selectedMethod} onChange={e => setSelectedMethod(e.target.value)}>
                  {methods.map(m => (
                    <option key={m.PaymentMethodID} value={m.PaymentMethodID}>
                      {m.CardType} ending in {m.LastFour}
                    </option>
                  ))}
                </select>
                <div style={styles.modalBtns}>
                  <button style={styles.confirmBtn} onClick={handlePay}>
                    Confirm payment
                  </button>
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
                  <button
                    style={styles.confirmBtn}
                    onClick={() => navigate('/patient/billing/methods')}
                  >
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
    </>
  );
}
