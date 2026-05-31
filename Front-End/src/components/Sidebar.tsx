'use client';

import React from 'react';
import { useNotes } from '@/context/NotesContext';

interface SidebarProps {
  onOpenLabelsManager: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenLabelsManager }) => {
  const {
    activeView,
    setActiveView,
    selectedLabelId,
    setSelectedLabelId,
    labels,
    notes,
    user,
    logout
  } = useNotes();

  const getNotesCount = (view: 'home' | 'reminders' | 'archive' | 'trash') => {
    switch (view) {
      case 'home':
        return notes.filter(n => n.status === 'active').length;
      case 'reminders':
        return notes.filter(n => n.status === 'active' && n.reminder && n.reminder.status === 'pending').length;
      case 'archive':
        return notes.filter(n => n.status === 'archived').length;
      case 'trash':
        return notes.filter(n => n.status === 'trash').length;
      default:
        return 0;
    }
  };

  const getLabelNotesCount = (labelId: number) => {
    return notes.filter(n => n.status === 'active' && n.labels.some(l => l.id === labelId)).length;
  };

  const menuItems = [
    {
      id: 'home' as const,
      label: 'Catatan',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5" />
          <path d="M17.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      ),
      count: getNotesCount('home'),
    },
    {
      id: 'reminders' as const,
      label: 'Pengingat',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
      count: getNotesCount('reminders'),
    },
    {
      id: 'archive' as const,
      label: 'Arsip',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="21 8 21 21 3 21 3 8" />
          <rect width="22" height="5" x="1" y="3" rx="1" />
          <line x1="10" x2="14" y1="12" y2="12" />
        </svg>
      ),
      count: getNotesCount('archive'),
    },
    {
      id: 'trash' as const,
      label: 'Sampah',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          <line x1="10" x2="10" y1="11" y2="17" />
          <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
      ),
      count: getNotesCount('trash'),
    },
  ];

  return (
    <aside style={styles.sidebar} className="glass">
      <div style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.iconContainer}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={styles.brandName}>KeepClean</span>
        </div>
      </div>

      <nav style={styles.nav}>
        <div style={styles.sectionTitle}>MENU UTAMA</div>
        <ul style={styles.list}>
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveView(item.id);
                    setSelectedLabelId(null);
                  }}
                  style={{
                    ...styles.menuBtn,
                    ...(isActive ? styles.menuBtnActive : {}),
                  }}
                >
                  <div style={styles.btnContent}>
                    <span style={{
                      ...styles.btnIcon,
                      color: isActive ? 'var(--accent)' : 'var(--muted)',
                    }}>{item.icon}</span>
                    <span style={{ fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span style={{
                      ...styles.badge,
                      ...(isActive ? styles.badgeActive : {}),
                    }}>{item.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div style={{ ...styles.sectionTitle, marginTop: '24px' }}>
          <span>LABEL CATATAN</span>
          <button onClick={onOpenLabelsManager} style={styles.editLabelsBtn} title="Kelola Label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>

        <ul style={styles.list}>
          {labels.map((label) => {
            const isActive = activeView === 'label' && selectedLabelId === label.id;
            const count = getLabelNotesCount(label.id);
            return (
              <li key={label.id}>
                <button
                  onClick={() => {
                    setActiveView('label');
                    setSelectedLabelId(label.id);
                  }}
                  style={{
                    ...styles.menuBtn,
                    ...(isActive ? styles.menuBtnActive : {}),
                  }}
                >
                  <div style={styles.btnContent}>
                    <span style={{
                      ...styles.btnIcon,
                      color: isActive ? 'var(--accent)' : 'var(--muted)',
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" x2="7.01" y1="7" y2="7" />
                      </svg>
                    </span>
                    <span style={{
                      fontWeight: isActive ? '600' : '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px'
                    }}>
                      {label.name}
                    </span>
                  </div>
                  {count > 0 && (
                    <span style={{
                      ...styles.badge,
                      ...(isActive ? styles.badgeActive : {}),
                    }}>{count}</span>
                  )}
                </button>
              </li>
            );
          })}
          {labels.length === 0 && (
            <li style={styles.emptyLabels}>
              Belum ada label
            </li>
          )}
        </ul>
      </nav>

      {user && (
        <div style={styles.profileSection}>
          <div style={styles.profileInfo}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>
                {user.department || 'Internal User'}
              </div>
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Keluar Akun">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    borderRight: '1px solid var(--card-border)',
    padding: '24px 16px',
    zIndex: 10,
  },
  header: {
    marginBottom: '28px',
    paddingLeft: '8px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
  },
  brandName: {
    fontFamily: 'var(--font-title)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--foreground)',
    letterSpacing: '-0.01em',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--muted)',
    letterSpacing: '0.08em',
    padding: '0 12px',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  menuBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: '13.5px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
  menuBtnActive: {
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'var(--muted-light)',
    color: 'var(--muted)',
    padding: '2px 8px',
    borderRadius: '8px',
    minWidth: '22px',
    textAlign: 'center',
  },
  badgeActive: {
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
  },
  editLabelsBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  emptyLabels: {
    fontSize: '12.5px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    padding: '8px 12px',
  },
  profileSection: {
    borderTop: '1px solid var(--card-border)',
    paddingTop: '16px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--foreground)',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--muted)',
    maxWidth: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
};
