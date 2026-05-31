'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';
import { Note } from '@/lib/api';

interface NoteCardProps {
  note: Note;
  onOpenDetail: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onOpenDetail }) => {
  const {
    togglePin,
    toggleArchive,
    deleteNote,
    restoreNote,
    forceDeleteNote,
    updateNote,
    addReminder,
    labels
  } = useNotes();

  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [reminderDate, setReminderDate] = useState('');

  const colorMenuRef = useRef<HTMLDivElement>(null);
  const reminderMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setShowColorPalette(false);
      }
      if (reminderMenuRef.current && !reminderMenuRef.current.contains(e.target as Node)) {
        setShowReminderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = async (colorKey: string) => {
    setShowColorPalette(false);
    await updateNote(note.uuid, { color_key: colorKey });
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reminderDate) {
      await addReminder(note.uuid, new Date(reminderDate).toISOString());
      setShowReminderMenu(false);
    }
  };

  const handleQuickTrash = async () => {
    if (note.status === 'trash') {
      await forceDeleteNote(note.uuid);
    } else {
      await deleteNote(note.uuid);
    }
  };

  const handleRestore = async () => {
    await restoreNote(note.uuid);
  };

  const noteColors = [
    { key: 'default', label: 'Biasa' },
    { key: 'red', label: 'Merah' },
    { key: 'orange', label: 'Oranye' },
    { key: 'yellow', label: 'Kuning' },
    { key: 'green', label: 'Hijau' },
    { key: 'teal', label: 'Teal' },
    { key: 'blue', label: 'Biru' },
    { key: 'darkblue', label: 'Navy' },
    { key: 'purple', label: 'Ungu' },
    { key: 'pink', label: 'Pink' },
    { key: 'brown', label: 'Cokelat' },
    { key: 'charcoal', label: 'Abu-abu' },
  ];

  const formatReminder = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isReminderOverdue = note.reminder && new Date(note.reminder.due_at) < new Date();

  return (
    <div
      onClick={onOpenDetail}
      className={`animate-fade-in bg-note-${note.color_key}`}
      style={styles.card}
    >
      {/* Absolute Pinned Action button */}
      {note.status === 'active' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePin(note.uuid);
          }}
          style={{
            ...styles.pinBtn,
            opacity: note.is_pinned ? 1 : undefined,
            color: note.is_pinned ? 'var(--accent)' : undefined,
          }}
          title={note.is_pinned ? 'Lepas Pin' : 'Sematkan Catatan'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>
      )}

      {/* Card Header */}
      <div style={styles.header}>
        <h4 style={styles.title}>{note.title || 'Tanpa Judul'}</h4>
      </div>

      {/* Card Content Snippet */}
      <div style={styles.content}>
        {note.note_type === 'text' ? (
          <p style={styles.textSnippet}>
            {note.content || <span style={styles.emptyText}>Catatan kosong</span>}
          </p>
        ) : (
          // Checklist preview (up to 4 items)
          <div style={styles.checklistPreview}>
            {note.checklist_items && note.checklist_items.slice(0, 4).map((item) => (
              <div key={item.id} style={styles.checkRow}>
                <span style={{
                  ...styles.checkCircle,
                  backgroundColor: item.is_completed ? 'var(--accent)' : 'transparent',
                  borderColor: item.is_completed ? 'var(--accent)' : 'var(--muted)',
                }}></span>
                <span style={{
                  ...styles.checkText,
                  textDecoration: item.is_completed ? 'line-through' : 'none',
                  color: item.is_completed ? 'var(--muted)' : 'var(--foreground)',
                }}>
                  {item.content}
                </span>
              </div>
            ))}
            {note.checklist_items && note.checklist_items.length > 4 && (
              <div style={styles.moreItems}>
                +{note.checklist_items.length - 4} item lainnya
              </div>
            )}
            {(!note.checklist_items || note.checklist_items.length === 0) && (
              <span style={styles.emptyText}>Checklist kosong</span>
            )}
          </div>
        )}
      </div>

      {/* Card Badges (Labels, Reminders) */}
      <div style={styles.badgeSection}>
        {note.reminder && (
          <span style={{
            ...styles.badge,
            ...(isReminderOverdue ? styles.badgeDanger : styles.badgeReminder),
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatReminder(note.reminder.due_at)}
          </span>
        )}

        {note.labels && note.labels.map((lbl) => (
          <span key={lbl.id} style={styles.badgeLabel}>
            {lbl.name}
          </span>
        ))}
      </div>

      {/* Card Footer Hover Toolbar */}
      <div style={styles.toolbar} className="card-toolbar">
        {note.status === 'trash' ? (
          // Trash Specific Options
          <div style={styles.toolbarRow}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRestore();
              }}
              style={styles.toolBtn}
              title="Pulihkan Catatan"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2.5 2v6h6M21.5 22v-6h-6" />
                <path d="M22 11.5A10 10 0 0 0 9.5 3.14L2.5 8M2 12.5a10 10 0 0 0 12.5 8.36l7-4.86" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickTrash();
              }}
              style={styles.toolBtnDanger}
              title="Hapus Permanen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ) : (
          // Active & Archive Options
          <div style={styles.toolbarRow}>
            {/* Color Palette Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPalette(!showColorPalette);
                  setShowReminderMenu(false);
                }}
                style={styles.toolBtn}
                title="Ubah Warna"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.35857 20 4.85857 20.5C4.35857 21 3.85857 21 3.35857 20.5C1.65685 18.7983 1 16.5 1 14C1 7.92487 5.92487 3 12 3C18.0751 3 23 7.92487 23 14C23 20.0751 18.0751 25 12 25" />
                </svg>
              </button>
              {showColorPalette && (
                <div ref={colorMenuRef} style={styles.colorDropdown} className="glass">
                  {noteColors.map((color) => (
                    <button
                      key={color.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange(color.key);
                      }}
                      style={{
                        ...styles.colorOption,
                        backgroundColor: `var(--note-${color.key})`,
                        border: note.color_key === color.key ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                      }}
                      title={color.label}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Set Reminder Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReminderMenu(!showReminderMenu);
                  setShowColorPalette(false);
                }}
                style={styles.toolBtn}
                title="Tambahkan Pengingat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </button>
              {showReminderMenu && (
                <div
                  ref={reminderMenuRef}
                  onClick={(e) => e.stopPropagation()}
                  style={styles.reminderDropdown}
                  className="glass"
                >
                  <form onSubmit={handleSaveReminder} style={styles.reminderForm}>
                    <div style={styles.dropdownTitle}>Setel Pengingat</div>
                    <input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      style={styles.reminderInput}
                      required
                    />
                    <button type="submit" style={styles.reminderSaveBtn}>Simpan</button>
                  </form>
                </div>
              )}
            </div>

            {/* Archive Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleArchive(note.uuid);
              }}
              style={styles.toolBtn}
              title={note.status === 'archived' ? 'Aktifkan Kembali' : 'Arsipkan'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" rx="1" />
              </svg>
            </button>

            {/* Move to Trash */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickTrash();
              }}
              style={styles.toolBtn}
              title="Buang ke Sampah"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: '16px',
    border: '1px solid var(--card-border)',
    boxShadow: 'var(--shadow)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    cursor: 'pointer',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
    minHeight: '140px',
    gap: '12px',
  },
  pinBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    opacity: 0, // revealed on hover via CSS
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  header: {
    paddingRight: '20px', // spacing for absolute pin button
  },
  title: {
    fontSize: '15px',
    fontWeight: '650',
    color: 'var(--foreground)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  content: {
    flex: 1,
  },
  textSnippet: {
    fontSize: '13px',
    color: 'var(--foreground)',
    lineHeight: '1.45',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
  emptyText: {
    fontStyle: 'italic',
    color: 'var(--muted)',
    fontSize: '12.5px',
  },
  checklistPreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkCircle: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    border: '1px solid',
  },
  checkText: {
    fontSize: '12.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  },
  moreItems: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--muted)',
    marginTop: '2px',
  },
  badgeSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px',
  },
  badge: {
    fontSize: '10.5px',
    fontWeight: '650',
    padding: '2px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  badgeReminder: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    color: 'var(--accent)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
  },
  badgeLabel: {
    fontSize: '10.5px',
    fontWeight: '650',
    backgroundColor: 'var(--card-border)',
    color: 'var(--foreground)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  toolbar: {
    opacity: 0, // revealed on hover
    transition: 'opacity 0.2s ease',
    marginTop: '6px',
    borderTop: '1px solid rgba(0,0,0,0.05)',
    paddingTop: '8px',
  },
  toolbarRow: {
    display: 'flex',
    gap: '14px',
  },
  toolBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  toolBtnDanger: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  colorDropdown: {
    position: 'absolute',
    bottom: '26px',
    left: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4px',
    padding: '6px',
    borderRadius: '10px',
    boxShadow: 'var(--shadow)',
    width: '120px',
    zIndex: 99,
  },
  colorOption: {
    height: '20px',
    width: '20px',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
  },
  reminderDropdown: {
    position: 'absolute',
    bottom: '26px',
    left: 0,
    width: '180px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    padding: '10px',
    zIndex: 99,
  },
  reminderForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropdownTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
  reminderInput: {
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid var(--card-border)',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  reminderSaveBtn: {
    padding: '4px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
