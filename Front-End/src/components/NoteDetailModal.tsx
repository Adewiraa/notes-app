'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';
import { Note, Label } from '@/lib/api';

interface NoteDetailModalProps {
  noteUuid: string;
  onClose: () => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ noteUuid, onClose }) => {
  const {
    notes,
    labels,
    updateNote,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    addReminder,
    uploadAttachment,
    user
  } = useNotes();

  const note = notes.find(n => n.uuid === noteUuid);

  // Note fields state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorKey, setColorKey] = useState('default');
  const [isPinned, setIsPinned] = useState(false);
  
  // Checklist builder state
  const [newChecklistText, setNewChecklistText] = useState('');

  // Dropdown states
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [reminderDate, setReminderDate] = useState('');

  const colorMenuRef = useRef<HTMLDivElement>(null);
  const labelMenuRef = useRef<HTMLDivElement>(null);
  const reminderMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with note on open/updates
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setColorKey(note.color_key);
      setIsPinned(note.is_pinned);
      if (note.reminder) {
        // Format to YYYY-MM-DDThh:mm
        const d = new Date(note.reminder.due_at);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setReminderDate(formatted);
      } else {
        setReminderDate('');
      }
    }
  }, [note]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setShowColorPalette(false);
      }
      if (labelMenuRef.current && !labelMenuRef.current.contains(e.target as Node)) {
        setShowLabelMenu(false);
      }
      if (reminderMenuRef.current && !reminderMenuRef.current.contains(e.target as Node)) {
        setShowReminderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!note) return null;

  // UI-BR-004: Determine if user has permission to edit
  // If note has collaborators and the current user is a "view" collaborator, we disable editing
  const isReadOnly = note.collaborators?.some(
    c => c.email === user?.email && c.permission === 'view'
  ) || note.status === 'trash';

  const handleCloseAndSave = async () => {
    if (!isReadOnly) {
      const hasChanges = 
        title !== note.title || 
        content !== note.content || 
        colorKey !== note.color_key || 
        isPinned !== note.is_pinned;

      if (hasChanges) {
        await updateNote(note.uuid, {
          title,
          content,
          color_key: colorKey,
          is_pinned: isPinned,
        });
      }
    }
    onClose();
  };

  const handleTogglePin = async () => {
    if (isReadOnly) return;
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    await updateNote(note.uuid, { is_pinned: nextPin });
  };

  const handleColorChange = async (selectedColor: string) => {
    if (isReadOnly) return;
    setColorKey(selectedColor);
    setShowColorPalette(false);
    await updateNote(note.uuid, { color_key: selectedColor });
  };

  const handleAddCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistText.trim() && !isReadOnly) {
      await addChecklistItem(note.uuid, newChecklistText.trim());
      setNewChecklistText('');
    }
  };

  const handleToggleCheckItem = async (itemId: number, completed: boolean) => {
    if (isReadOnly) return;
    await updateChecklistItem(note.uuid, itemId, { is_completed: !completed });
  };

  const handleDeleteCheckItem = async (itemId: number) => {
    if (isReadOnly) return;
    await deleteChecklistItem(note.uuid, itemId);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reminderDate && !isReadOnly) {
      await addReminder(note.uuid, new Date(reminderDate).toISOString());
      setShowReminderMenu(false);
    }
  };

  const handleRemoveReminder = async () => {
    if (isReadOnly) return;
    await updateNote(note.uuid, { reminder: undefined });
    setReminderDate('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && !isReadOnly) {
      await uploadAttachment(note.uuid, files[0]);
    }
  };

  const toggleNoteLabel = async (lbl: Label) => {
    if (isReadOnly) return;
    const hasLabel = note.labels.some(l => l.id === lbl.id);
    let nextLabels;
    if (hasLabel) {
      nextLabels = note.labels.filter(l => l.id !== lbl.id);
    } else {
      nextLabels = [...note.labels, lbl];
    }
    await updateNote(note.uuid, { labels: nextLabels });
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

  return (
    <div style={styles.overlay} onClick={handleCloseAndSave}>
      <div
        className={`glass bg-note-${colorKey} animate-scale-in`}
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Detail Header */}
        <div style={styles.header}>
          {isReadOnly && (
            <span style={styles.readOnlyBadge}>
              {note.status === 'trash' ? 'Di Kotak Sampah (Tinjauan)' : 'Hanya Lihat'}
            </span>
          )}
          <div style={styles.headerActions}>
            {!isReadOnly && (
              <button
                onClick={handleTogglePin}
                style={{
                  ...styles.headerBtn,
                  color: isPinned ? 'var(--accent)' : 'var(--muted)',
                }}
                title={isPinned ? 'Lepas Pin' : 'Sematkan Catatan'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>
            )}
            <button onClick={handleCloseAndSave} style={styles.closeBtn} title="Tutup & Simpan">
              &times;
            </button>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Judul catatan"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isReadOnly}
          style={styles.titleInput}
        />

        {/* Scrollable details area */}
        <div style={styles.scrollArea}>
          {/* Note content body based on type */}
          {note.note_type === 'text' ? (
            <textarea
              placeholder="Tulis detail catatan Anda..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isReadOnly}
              style={styles.textarea}
              rows={8}
            />
          ) : (
            // Checklist Item Builder
            <div style={styles.checklistSection}>
              <div style={styles.sectionTitle}>DAFTAR CHECKLIST</div>
              <ul style={styles.checklistList}>
                {note.checklist_items && note.checklist_items.map((item) => (
                  <li key={item.id} style={styles.checkItem}>
                    <button
                      onClick={() => handleToggleCheckItem(item.id, item.is_completed)}
                      disabled={isReadOnly}
                      style={{
                        ...styles.checkBtn,
                        backgroundColor: item.is_completed ? 'var(--accent)' : 'transparent',
                        borderColor: item.is_completed ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {item.is_completed && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <span style={{
                      ...styles.checkText,
                      textDecoration: item.is_completed ? 'line-through' : 'none',
                      color: item.is_completed ? 'var(--muted)' : 'var(--foreground)',
                    }}>
                      {item.content}
                    </span>
                    {!isReadOnly && (
                      <button onClick={() => handleDeleteCheckItem(item.id)} style={styles.removeCheckBtn} title="Hapus">
                        &times;
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {!isReadOnly && (
                <form onSubmit={handleAddCheckItem} style={styles.checkForm}>
                  <input
                    type="text"
                    placeholder="Tambah item checklist..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    style={styles.checkInput}
                  />
                  <button type="submit" style={styles.checkAddBtn}>+</button>
                </form>
              )}
            </div>
          )}

          {/* Attachments Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionTitle}>LAMPIRAN FILE</span>
              {!isReadOnly && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={styles.addAttachmentBtn}
                >
                  Unggah File
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div style={styles.attachmentsGrid}>
              {note.attachments && note.attachments.map((att) => (
                <div key={att.id} style={styles.attachmentCard} className="glass">
                  <div style={styles.attIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </div>
                  <div style={styles.attDetails}>
                    <div style={styles.attName} title={att.file_name}>{att.file_name}</div>
                    <div style={styles.attSize}>{(att.size_bytes / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ))}
              {(!note.attachments || note.attachments.length === 0) && (
                <div style={styles.emptySectionText}>Belum ada lampiran.</div>
              )}
            </div>
          </div>

          {/* Labels & Reminder badges area */}
          <div style={styles.metaRow}>
            {/* Reminder Badge */}
            {note.reminder && (
              <div style={styles.metaBadge}>
                <span style={styles.metaLabel}>Pengingat:</span>
                <span style={styles.metaValBadge}>
                  {new Date(note.reminder.due_at).toLocaleString('id-ID')}
                  {!isReadOnly && (
                    <button onClick={handleRemoveReminder} style={styles.clearBadgeBtn}>&times;</button>
                  )}
                </span>
              </div>
            )}

            {/* Attached Labels List */}
            {note.labels && note.labels.length > 0 && (
              <div style={styles.metaBadge}>
                <span style={styles.metaLabel}>Label:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {note.labels.map(lbl => (
                    <span key={lbl.id} style={styles.metaValBadge}>
                      {lbl.name}
                      {!isReadOnly && (
                        <button onClick={() => toggleNoteLabel(lbl)} style={styles.clearBadgeBtn}>&times;</button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar Footer Actions */}
        {!isReadOnly && (
          <div style={styles.toolbar}>
            <div style={styles.toolbarActions}>
              {/* Note color picker */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowColorPalette(!showColorPalette);
                    setShowLabelMenu(false);
                    setShowReminderMenu(false);
                  }}
                  style={styles.toolBtn}
                  title="Ubah warna latar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.35857 20 4.85857 20.5C4.35857 21 3.85857 21 3.35857 20.5C1.65685 18.7983 1 16.5 1 14C1 7.92487 5.92487 3 12 3C18.0751 3 23 7.92487 23 14C23 20.0751 18.0751 25 12 25" />
                  </svg>
                </button>
                {showColorPalette && (
                  <div ref={colorMenuRef} style={styles.colorDropdown} className="glass">
                    {noteColors.map((color) => (
                      <button
                        key={color.key}
                        onClick={() => handleColorChange(color.key)}
                        style={{
                          ...styles.colorOption,
                          backgroundColor: `var(--note-${color.key})`,
                          border: colorKey === color.key ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Note labels editor */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowLabelMenu(!showLabelMenu);
                    setShowColorPalette(false);
                    setShowReminderMenu(false);
                  }}
                  style={styles.toolBtn}
                  title="Pasang label"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  </svg>
                </button>
                {showLabelMenu && (
                  <div ref={labelMenuRef} style={styles.labelDropdown} className="glass">
                    <div style={styles.dropdownTitle}>Pasang Label</div>
                    <div style={styles.labelOptionList}>
                      {labels.map((lbl) => {
                        const isChecked = note.labels.some(l => l.id === lbl.id);
                        return (
                          <label key={lbl.id} style={styles.labelOptionRow}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleNoteLabel(lbl)}
                              style={{ marginRight: '8px' }}
                            />
                            <span style={styles.labelOptionName}>{lbl.name}</span>
                          </label>
                        );
                      })}
                      {labels.length === 0 && (
                        <div style={styles.emptyLabelsText}>Belum ada label. Buat di sidebar.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Note reminders editor */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowReminderMenu(!showReminderMenu);
                    setShowColorPalette(false);
                    setShowLabelMenu(false);
                  }}
                  style={styles.toolBtn}
                  title="Setel pengingat"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                  </svg>
                </button>
                {showReminderMenu && (
                  <div ref={reminderMenuRef} style={styles.reminderDropdown} className="glass">
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
            </div>

            <div style={styles.saveSection}>
              <button onClick={handleCloseAndSave} style={styles.saveBtn}>
                Simpan & Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(11, 15, 25, 0.4)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    padding: '16px',
  },
  modal: {
    width: '100%',
    maxWidth: '560px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  readOnlyBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '28px',
    cursor: 'pointer',
    lineHeight: '0.8',
  },
  titleInput: {
    fontSize: '18px',
    fontWeight: '700',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    marginBottom: '16px',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingRight: '4px',
  },
  textarea: {
    fontSize: '14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    outline: 'none',
    width: '100%',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  checklistSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  checklistList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  checkBtn: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1.5px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: '13px',
    flex: 1,
  },
  removeCheckBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '18px',
    cursor: 'pointer',
  },
  checkForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  checkInput: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  checkAddBtn: {
    padding: '0 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addAttachmentBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  attachmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '8px',
  },
  attachmentCard: {
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  attIcon: {
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
  },
  attDetails: {
    overflow: 'hidden',
  },
  attName: {
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--foreground)',
  },
  attSize: {
    fontSize: '9.5px',
    color: 'var(--muted)',
  },
  emptySectionText: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontStyle: 'italic',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '16px',
    marginTop: '8px',
  },
  metaBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  metaLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    width: '74px',
  },
  metaValBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'var(--card-border)',
    color: 'var(--foreground)',
    padding: '2px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  clearBadgeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '14px',
    marginTop: '16px',
  },
  toolbarActions: {
    display: 'flex',
    gap: '12px',
  },
  toolBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  colorDropdown: {
    position: 'absolute',
    bottom: '36px',
    left: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px',
    padding: '8px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    width: '140px',
    zIndex: 99,
  },
  colorOption: {
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
  },
  labelDropdown: {
    position: 'absolute',
    bottom: '36px',
    left: 0,
    width: '180px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    padding: '12px',
    zIndex: 99,
  },
  dropdownTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    borderBottom: '1px solid var(--card-border)',
    paddingBottom: '4px',
  },
  labelOptionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  labelOptionRow: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  labelOptionName: {
    fontSize: '12.5px',
    color: 'var(--foreground)',
  },
  emptyLabelsText: {
    fontSize: '11px',
    color: 'var(--muted)',
    fontStyle: 'italic',
  },
  reminderDropdown: {
    position: 'absolute',
    bottom: '36px',
    left: 0,
    width: '180px',
    borderRadius: '12px',
    boxShadow: 'var(--shadow)',
    padding: '12px',
    zIndex: 99,
  },
  reminderForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveSection: {
    display: 'flex',
    alignItems: 'center',
  },
  saveBtn: {
    padding: '8px 18px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
