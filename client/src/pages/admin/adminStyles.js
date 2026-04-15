export const topbar = {
  bar: { background: '#1e2b1b', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', fontFamily: 'Poppins, sans-serif' },
  title: { color: '#d4e6b5', fontSize: '15px', fontWeight: 500 },
  btn: { fontSize: '13px', padding: '6px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#d4e6b5', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' },
}

export const page = {
  background: '#f5f3ee', minHeight: '100vh', fontFamily: 'Poppins, sans-serif',
}

export const content = {
  maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem',
}

export const heading = {
  fontSize: '22px', fontWeight: 500, color: '#1e2b1b', marginBottom: '0.25rem',
}

export const subheading = {
  fontSize: '13px', color: '#6b7280', marginBottom: '2rem',
}

export const sectionLabel = {
  fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
}

export const filterCard = {
  background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '1.5rem',
}

export const filterRow = {
  display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end',
}

export const filterGroup = {
  display: 'flex', flexDirection: 'column', gap: '4px',
}

export const filterLabel = {
  fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em',
}

export const filterInput = {
  fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontFamily: 'Poppins, sans-serif', color: '#111', background: 'white',
}

export const primaryBtn = {
  padding: '9px 20px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
}

// Custom styles for react-data-table-component
export const tableCustomStyles = {
  table: { style: { fontFamily: 'Poppins, sans-serif', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' } },
  headRow: { style: { backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', minHeight: '44px' } },
  headCells: { style: { fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '20px', paddingRight: '20px' } },
  rows: { style: { fontSize: '13px', color: '#1e2b1b', minHeight: '48px', borderBottom: '1px solid #f3f4f6', fontFamily: 'Poppins, sans-serif' }, highlightOnHoverStyle: { backgroundColor: '#f9fafb', borderBottomColor: '#f3f4f6', outline: 'none' } },
  cells: { style: { paddingLeft: '20px', paddingRight: '20px' } },
  pagination: { style: { fontSize: '13px', color: '#6b7280', fontFamily: 'Poppins, sans-serif', borderTop: '1px solid #e5e7eb', backgroundColor: 'white' } },
}