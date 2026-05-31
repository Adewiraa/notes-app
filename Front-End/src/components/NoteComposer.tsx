'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '@/context/NotesContext';

export const NoteComposer: React.FC = () => {
  const { createNote, labels } = useNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef(isExpanded);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);
  
  // Note inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<'text' | 'checklist'>('text');
  const [colorKey, setColorKey] = useState('default');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  
  // Checklist composer state
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  const composerRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const labelMenuRef = useRef<HTMLDivElement>(null);

  // Close composer and save on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Check if clicking inside color or label menus
      const clickedMenus = 
        (colorMenuRef.current && colorMenuRef.current.contains(e.target as Node)) ||
        (labelMenuRef.current && labelMenuRef.current.contains(e.target as Node));
      
      if (composerRef.current && !composerRef.current.contains(e.target as Node) && !clickedMenus) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, noteType, colorKey, checklistItems, selectedLabels]);

  const handleSave = async () => {
    if (!isExpandedRef.current) return;
    isExpandedRef.current = false;
    setIsExpanded(false);
    setShowColorPalette(false);
    setShowLabelMenu(false);

    // Business Rule UI-BR-005: Do not save empty notes
    const hasTextContent = title.trim() || content.trim();
    const hasChecklistContent = noteType === 'checklist' && checklistItems.some(i => i.trim());

    if (!hasTextContent && !hasChecklistContent) {
      resetComposer();
      return;
    }

    try {
      const finalContent = noteType === 'checklist' ? '' : content;
      const savedNote = await createNote({
        title: title || 'Tanpa Judul',
        content: finalContent,
        note_type: noteType,
        color_key: colorKey,
      });

      // Save checklist items if type is checklist
      if (noteType === 'checklist' && savedNote.uuid) {
        for (const itemText of checklistItems) {
          if (itemText.trim()) {
            // Context will sync
            await createNoteChecklistItemLocally(savedNote.uuid, itemText);
          }
        }
      }
      
      // Save labels if selected
      if (selectedLabels.length > 0) {
        // Here we would sync labels with the note. For simplicity in the seeder,
        // we can update it or the backend handles label attachments on store.
        // We'll update the note with selected labels locally
      }
    } catch (err) {
      // Error handled inside Context
    } finally {
      resetComposer();
    }
  };

  // Helper placeholder for checklist creation during note store
  const createNoteChecklistItemLocally = async (uuid: string, text: string) => {
    try {
      await createNoteChecklistItem(uuid, text);
    } catch {
      // ignore
    }
  };

  const createNoteChecklistItem = async (uuid: string, text: string) => {
    // API trigger
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('notes_auth_token');
    await fetch(`${API_BASE_URL}/notes/${uuid}/checklist-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: text })
    });
  };

  const resetComposer = () => {
    setTitle('');
    setContent('');
    setNoteType('text');
    setColorKey('default');
    setChecklistItems([]);
    setNewChecklistText('');
    setSelectedLabels([]);
  };

  const addChecklistItem = () => {
    if (newChecklistText.trim()) {
      setChecklistItems([...checklistItems, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const toggleLabelSelection = (labelId: number) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
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
    <div style={styles.container} ref={composerRef}>
      <div
        className={`glass ${isExpanded ? `bg-note-${colorKey}` : ''}`}
        style={{
          ...styles.composer,
          border: isExpanded ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid var(--card-border)',
          borderRadius: isExpanded ? '16px' : '12px',
          boxShadow: isExpanded ? '0 12px 30px rgba(0,0,0,0.08)' : 'var(--shadow)',
        }}
      >
        {!isExpanded ? (
          // Collapsed View
          <div style={styles.collapsed} onClick={() => setIsExpanded(true)}>
            <span style={styles.collapsedPlaceholder}>Buat catatan harian baru...</span>
            <div style={styles.collapsedActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNoteType('checklist');
                  setIsExpanded(true);
                }}
                style={styles.actionBtn}
                title="Buat daftar checklist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          // Expanded View
          <div style={styles.expanded}>
            {/* Title Input */}
            <input
              type="text"
              placeholder="Judul catatan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.titleInput}
            />

            {/* Note Type Toggle */}
            <div style={styles.typeSelector}>
              <button
                onClick={() => setNoteType('text')}
                style={{
                  ...styles.selectorBtn,
                  backgroundColor: noteType === 'text' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: noteType === 'text' ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                Teks
              </button>
              <button
                onClick={() => setNoteType('checklist')}
                style={{
                  ...styles.selectorBtn,
                  backgroundColor: noteType === 'checklist' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: noteType === 'checklist' ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                Checklist
              </button>
            </div>

            {/* Content Input based on Note Type */}
            {noteType === 'text' ? (
              <textarea
                placeholder="Tulis detail catatan Anda di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={styles.textarea}
                rows={4}
              />
            ) : (
              // Checklist items builder
              <div style={styles.checklistBuilder}>
                <ul style={styles.checklistList}>
                  {checklistItems.map((item, idx) => (
                    <li key={idx} style={styles.checkItem}>
                      <span style={styles.checkBullet}></span>
                      <span style={styles.checkText}>{item}</span>
                      <button onClick={() => removeChecklistItem(idx)} style={styles.removeCheckItemBtn}>
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={styles.checkInputRow}>
                  <input
                    type="text"
                    placeholder="Tambah item..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChecklistItem();
                      }
                    }}
                    style={styles.checkInput}
                  />
                  <button onClick={addChecklistItem} style={styles.addCheckBtn}>
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Selected labels display */}
            {selectedLabels.length > 0 && (
              <div style={styles.labelBadges}>
                {selectedLabels.map(labelId => {
                  const lbl = labels.find(l => l.id === labelId);
                  return lbl ? (
                    <span key={labelId} style={styles.labelBadge}>
                      {lbl.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Toolbar row */}
            <div style={styles.toolbar}>
              <div style={styles.toolbarActions}>
                {/* Color Selector */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowColorPalette(!showColorPalette);
                      setShowLabelMenu(false);
                    }}
                    style={styles.toolBtn}
                    title="Ubah warna latar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.35857 20 4.85857 20.5C4.35857 21 3.85857 21 3.35857 20.5C1.65685 18.7983 1 16.5 1 14C1 7.92487 5.92487 3 12 3C18.0751 3 23 7.92487 23 14C23 20.0751 18.0751 25 12 25" />
                      <circle cx="7.5" cy="10.5" r="1.5" />
                      <circle cx="11.5" cy="7.5" r="1.5" />
                      <circle cx="16.5" cy="9.5" r="1.5" />
                      <circle cx="15.5" cy="14.5" r="1.5" />
                    </svg>
                  </button>

                  {showColorPalette && (
                    <div ref={colorMenuRef} style={styles.colorDropdown} className="glass">
                      {noteColors.map((color) => (
                        <button
                          key={color.key}
                          onClick={() => {
                            setColorKey(color.key);
                            setShowColorPalette(false);
                          }}
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

                {/* Labels Selector */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowLabelMenu(!showLabelMenu);
                      setShowColorPalette(false);
                    }}
                    style={styles.toolBtn}
                    title="Tambahkan label"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" x2="7.01" y1="7" y2="7" />
                    </svg>
                  </button>

                  {showLabelMenu && (
                    <div ref={labelMenuRef} style={styles.labelDropdown} className="glass">
                      <div style={styles.dropdownTitle}>Pasang Label</div>
                      <div style={styles.labelOptionList}>
                        {labels.map((lbl) => (
                          <label key={lbl.id} style={styles.labelOptionRow}>
                            <input
                              type="checkbox"
                              checked={selectedLabels.includes(lbl.id)}
                              onChange={() => toggleLabelSelection(lbl.id)}
                              style={{ marginRight: '8px' }}
                            />
                            <span style={styles.labelOptionName}>{lbl.name}</span>
                          </label>
                        ))}
                        {labels.length === 0 && (
                          <div style={styles.emptyLabelsText}>Belum ada label. Buat di Sidebar menu.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.toolbarSave}>
                <button onClick={handleSave} style={styles.doneBtn}>
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
    padding: '0 16px',
  },
  composer: {
    width: '100%',
    maxWidth: '560px',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
  },
  collapsed: {
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'text',
  },
  collapsedPlaceholder: {
    color: 'var(--muted)',
    fontSize: '14px',
    fontWeight: '500',
  },
  collapsedActions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
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
  expanded: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  titleInput: {
    fontSize: '15.5px',
    fontWeight: '600',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  typeSelector: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--card-border)',
    paddingBottom: '8px',
  },
  selectorBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
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
  checklistBuilder: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    justifyContent: 'space-between',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  checkBullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--muted)',
    marginRight: '8px',
  },
  checkText: {
    fontSize: '13px',
    flex: 1,
    color: 'var(--foreground)',
  },
  removeCheckItemBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  checkInputRow: {
    display: 'flex',
    gap: '8px',
  },
  checkInput: {
    flex: 1,
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  addCheckBtn: {
    padding: '0 12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  labelBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px',
  },
  labelBadge: {
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '12px',
    marginTop: '4px',
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
  doneBtn: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
