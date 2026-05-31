'use client';

import React, { useState } from 'react';
import { useNotes } from '@/context/NotesContext';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { NoteComposer } from '@/components/NoteComposer';
import { NoteCard } from '@/components/NoteCard';
import { NoteDetailModal } from '@/components/NoteDetailModal';
import { LabelManagerModal } from '@/components/LabelManagerModal';
import { LoginScreen } from '@/components/LoginScreen';

export default function Home() {
  const {
    isAuthenticated,
    notes,
    activeView,
    selectedLabelId,
    searchQuery,
    activeFilters,
    toast,
    clearToast
  } = useNotes();

  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [selectedNoteUuid, setSelectedNoteUuid] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // 1. Process Filtering dynamically on notes
  const filteredNotes = notes.filter((note) => {
    // A. View Filter
    if (activeView === 'home') {
      if (note.status !== 'active') return false;
    } else if (activeView === 'archive') {
      if (note.status !== 'archived') return false;
    } else if (activeView === 'trash') {
      if (note.status !== 'trash') return false;
    } else if (activeView === 'reminders') {
      if (note.status !== 'active' || !note.reminder) return false;
    } else if (activeView === 'label') {
      if (note.status !== 'active') return false;
      const hasLabel = note.labels && note.labels.some((l) => l.id === selectedLabelId);
      if (!hasLabel) return false;
    }

    // B. Search Bar Text Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title && note.title.toLowerCase().includes(q);
      const matchContent = note.content && note.content.toLowerCase().includes(q);
      const matchChecklist = note.checklist_items && note.checklist_items.some(
        (item) => item.content && item.content.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchContent && !matchChecklist) return false;
    }

    // C. Advanced Attributes Filters
    if (activeFilters.color && note.color_key !== activeFilters.color) {
      return false;
    }
    if (activeFilters.type && note.note_type !== activeFilters.type) {
      return false;
    }
    if (activeFilters.hasReminder === true && !note.reminder) {
      return false;
    }

    return true;
  });

  // 2. Partition notes for Pinned vs Other sections (Home / Label specific Keep rule)
  const showPinnedSplit = (activeView === 'home' || activeView === 'label') && !searchQuery;
  const pinnedNotes = showPinnedSplit ? filteredNotes.filter((n) => n.is_pinned) : [];
  const otherNotes = showPinnedSplit ? filteredNotes.filter((n) => !n.is_pinned) : filteredNotes;

  const hasNotes = filteredNotes.length > 0;

  return (
    <div style={styles.appShell}>
      {/* Sidebar Navigation */}
      <Sidebar onOpenLabelsManager={() => setIsLabelManagerOpen(true)} />

      {/* Main Content Pane */}
      <main style={styles.mainContent}>
        {/* Top Navbar Search and Filters */}
        <Navbar />

        {/* Scrollable Workspace */}
        <div style={styles.workspace}>
          {/* Quick Note Composer (Only active on Home/Label views) */}
          {(activeView === 'home' || activeView === 'label') && <NoteComposer />}

          <div style={styles.notesContainer}>
            {hasNotes ? (
              <>
                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && (
                  <div style={styles.sectionBlock}>
                    <div style={styles.sectionHeader}>SEMATKAN</div>
                    <div style={styles.notesGrid}>
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.uuid}
                          note={note}
                          onOpenDetail={() => setSelectedNoteUuid(note.uuid)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Notes Section */}
                {otherNotes.length > 0 && (
                  <div style={styles.sectionBlock}>
                    {pinnedNotes.length > 0 && <div style={styles.sectionHeader}>LAINNYA</div>}
                    <div style={styles.notesGrid}>
                      {otherNotes.map((note) => (
                        <NoteCard
                          key={note.uuid}
                          note={note}
                          onOpenDetail={() => setSelectedNoteUuid(note.uuid)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* High-Aesthetics Empty State Panel */
              <div style={styles.emptyStateContainer} className="animate-fade-in">
                <div style={styles.emptyIconContainer}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="13" y2="17" />
                  </svg>
                </div>
                <h3 style={styles.emptyTitle}>
                  {searchQuery ? 'Hasil pencarian nihil' : 'Belum ada catatan'}
                </h3>
                <p style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Cobalah kata kunci lain atau bersihkan filter lanjutan di atas.'
                    : 'Tulis ide, tugas, atau checklist pekerjaan Anda menggunakan composer di atas.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Label Manager Overlay Dialog */}
      {isLabelManagerOpen && (
        <LabelManagerModal onClose={() => setIsLabelManagerOpen(false)} />
      )}

      {/* Note Details Overlay Dialog */}
      {selectedNoteUuid && (
        <NoteDetailModal
          noteUuid={selectedNoteUuid}
          onClose={() => setSelectedNoteUuid(null)}
        />
      )}

      {/* Real-time Toast Notifications */}
      {toast.message && (
        <div
          style={{
            ...styles.toast,
            backgroundColor: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          }}
          className="animate-scale-in"
          onClick={clearToast}
        >
          <span>{toast.message}</span>
          <button style={styles.toastCloseBtn}>&times;</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
  },
  workspace: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px 64px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  notesContainer: {
    width: '100%',
    maxWidth: '960px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    fontSize: '10.5px',
    fontWeight: '800',
    color: 'var(--muted)',
    letterSpacing: '0.08em',
    paddingLeft: '4px',
  },
  notesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '40px auto 0 auto',
  },
  emptyIconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    backgroundColor: 'var(--card-border)',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--foreground)',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '13.5px',
    color: 'var(--muted)',
    lineHeight: '1.5',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '12px 20px',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    zIndex: 9999,
  },
  toastCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  },
};
