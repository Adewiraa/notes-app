'use client';

import React, { useState } from 'react';
import { useNotes } from '@/context/NotesContext';

interface LabelManagerModalProps {
  onClose: () => void;
}

export const LabelManagerModal: React.FC<LabelManagerModalProps> = ({ onClose }) => {
  const { labels, createLabel, updateLabel, deleteLabel } = useNotes();
  const [newLabelName, setNewLabelName] = useState('');
  
  // State to track inline editing of label names
  const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabelName.trim()) {
      await createLabel(newLabelName.trim());
      setNewLabelName('');
    }
  };

  const handleUpdate = async (id: number) => {
    if (editingLabelName.trim()) {
      await updateLabel(id, editingLabelName.trim());
      setEditingLabelId(null);
      setEditingLabelName('');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus label ini? Catatan Anda tidak akan terhapus.')) {
      await deleteLabel(id);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={styles.modal}
        className="glass animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>Edit Label Catatan</h3>
          <button onClick={onClose} style={styles.closeBtn} title="Tutup">
            &times;
          </button>
        </div>

        {/* Create new label input row */}
        <form onSubmit={handleCreate} style={styles.createRow}>
          <input
            type="text"
            placeholder="Buat label baru..."
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            style={styles.input}
            maxLength={25}
          />
          <button type="submit" style={styles.addBtn} title="Tambahkan Label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>

        {/* Existing labels list */}
        <div style={styles.labelList}>
          {labels.map((lbl) => (
            <div key={lbl.id} style={styles.labelRow}>
              {editingLabelId === lbl.id ? (
                // Editing state
                <div style={styles.editRow}>
                  <input
                    type="text"
                    value={editingLabelName}
                    onChange={(e) => setEditingLabelName(e.target.value)}
                    style={styles.inlineInput}
                    autoFocus
                  />
                  <div style={styles.rowActions}>
                    <button onClick={() => handleUpdate(lbl.id)} style={styles.saveRowBtn} title="Simpan Perubahan">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button onClick={() => setEditingLabelId(null)} style={styles.cancelRowBtn} title="Batal">
                      &times;
                    </button>
                  </div>
                </div>
              ) : (
                // Standard state
                <div style={styles.standardRow}>
                  <span style={styles.labelIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    </svg>
                  </span>
                  <span style={styles.labelName}>{lbl.name}</span>
                  <div style={styles.rowActions}>
                    <button
                      onClick={() => {
                        setEditingLabelId(lbl.id);
                        setEditingLabelName(lbl.name);
                      }}
                      style={styles.rowBtn}
                      title="Ubah Nama"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(lbl.id)} style={styles.rowBtnDanger} title="Hapus Label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {labels.length === 0 && (
            <div style={styles.emptyText}>Belum ada label. Tambahkan di atas.</div>
          )}
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.doneBtn}>
            Selesai
          </button>
        </div>
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
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modal: {
    width: '100%',
    maxWidth: '340px',
    borderRadius: '20px',
    boxShadow: 'var(--shadow)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--foreground)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: '1',
  },
  createRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--card-border)',
    paddingBottom: '14px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  addBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '220px',
    overflowY: 'auto',
    paddingRight: '2px',
  },
  labelRow: {
    padding: '4px 0',
  },
  standardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  labelIcon: {
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px',
  },
  labelName: {
    flex: 1,
    fontSize: '13px',
    color: 'var(--foreground)',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  editRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px',
    borderRadius: '8px',
    border: '1.5px solid var(--accent)',
    backgroundColor: 'var(--background)',
  },
  inlineInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
    padding: '2px 4px',
  },
  rowActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  rowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  rowBtnDanger: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  saveRowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--success)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  },
  cancelRowBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
  },
  emptyText: {
    fontSize: '12px',
    color: 'var(--muted)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '16px 0',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--card-border)',
    paddingTop: '12px',
  },
  doneBtn: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--foreground)',
    color: 'var(--background)',
    fontSize: '12.5px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
