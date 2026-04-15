import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell({ iconColor = '#374151', hoverBg = '#f3f4f6' }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  const loadNotifications = () => {
    fetch('/patient/api/notifications', { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id) => {
    await fetch(`/patient/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
    setNotifications(prev => prev.map(n => n.NotificationID === id ? { ...n, IsRead: 1 } : n));
  };

  const markAllRead = async () => {
    await fetch('/patient/api/notifications/read-all', { method: 'PATCH', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, IsRead: 1 })));
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const typeIcon = (type) => {
    if (type === 'payment') return '💳';
    if (type === 'appointment') return '📅';
    return '🔔';
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '8px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s', width: 'auto',
        }}
        onMouseEnter={e => e.currentTarget.style.background = hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '4px', right: '4px',
            background: '#D85A30', color: 'white', borderRadius: '50%',
            width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Poppins, sans-serif',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '44px', right: 0,
          width: '320px', background: 'white',
          border: '1px solid #e5e7eb', borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          zIndex: 999, overflow: 'hidden',
          fontFamily: 'Poppins, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e2b1b' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: '12px', color: '#185FA5', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'auto' }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.NotificationID}
                  onClick={() => {
                    markRead(n.NotificationID);
                    if (n.Link) navigate(n.Link);
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex', gap: '12px', padding: '12px 16px',
                    borderBottom: i < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: n.IsRead ? '#fafafa' : '#EAF3DE',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = n.IsRead ? '#f3f4f6' : '#d8eccc'}
                  onMouseLeave={e => e.currentTarget.style.background = n.IsRead ? '#fafafa' : '#EAF3DE'}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: n.IsRead ? '#f3f4f6' : '#C0DD97',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px',
                  }}>
                    {typeIcon(n.Type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px', margin: '0 0 2px',
                      fontWeight: n.IsRead ? 400 : 600,
                      color: n.IsRead ? '#6b7280' : '#1e2b1b',
                      lineHeight: 1.4,
                    }}>
                      {n.Message}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                      {formatTime(n.CreatedAt)}
                    </p>
                  </div>
                  {!n.IsRead && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#639922', flexShrink: 0, marginTop: '4px',
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
