'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';

export const Navbar: React.FC = () => {
  const {
    activeView,
    selectedLabelId,
    labels,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setFilters,
    resetFilters
  } = useNotes();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on pressing '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        // Prevent default browser "/" search trigger or character typing
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close filter dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Catatan Saya';
      case 'reminders':
        return 'Pengingat';
      case 'archive':
        return 'Arsip';
      case 'trash':
        return 'Sampah';
      case 'label':
        const label = labels.find(l => l.id === selectedLabelId);
        return label ? `Label: ${label.name}` : 'Label';
      default:
        return 'KeepClean';
    }
  };

  const hasActiveFilters = activeFilters.color !== null || activeFilters.hasReminder !== null || activeFilters.type !== null;

  // The 12 custom Keep-style colors list for advanced filter selectors
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
    <header style={styles.header} className="glass">
      <div style={styles.titleContainer}>
        <h2 style={styles.title}>{getViewTitle()}</h2>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder='Cari catatan... (Tekan "/" untuk fokus)'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn} title="Hapus Pencarian">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Advanced Filters Button and Dropdown */}
        <div style={{ position: 'relative' }} ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            style={{
              ...styles.filterTrigger,
              ...(hasActiveFilters ? styles.filterTriggerActive : {}),
            }}
            title="Filter Catatan Lanjutan"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {hasActiveFilters && <span style={styles.filterDot}></span>}
          </button>

          {showFilterMenu && (
            <div style={styles.filterDropdown} className="glass animate-scale-in">
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Filter Lanjutan</span>
                {hasActiveFilters && (
                  <button onClick={resetFilters} style={styles.resetBtn}>Reset</button>
                )}
              </div>

              {/* Note Type Filter */}
              <div style={styles.filterSection}>
                <div style={styles.sectionLabel}>JENIS CATATAN</div>
                <div style={styles.buttonGrid}>
                  <button
                    onClick={() => setFilters({ type: activeFilters.type === 'text' ? null : 'text' })}
                    style={{
                      ...styles.typeBtn,
                      ...(activeFilters.type === 'text' ? styles.typeBtnActive : {}),
                    }}
                  >
                    Teks
                  </button>
                  <button
                    onClick={() => setFilters({ type: activeFilters.type === 'checklist' ? null : 'checklist' })}
                    style={{
                      ...styles.typeBtn,
                      ...(activeFilters.type === 'checklist' ? styles.typeBtnActive : {}),
                    }}
                  >
                    Checklist
                  </button>
                </div>
              </div>

              {/* Reminder Filter */}
              <div style={styles.filterSection}>
                <div style={styles.sectionLabel}>PENGINGAT</div>
                <button
                  onClick={() => setFilters({ hasReminder: activeFilters.hasReminder === true ? null : true })}
                  style={{
                    ...styles.typeBtn,
                    width: '100%',
                    ...(activeFilters.hasReminder === true ? styles.typeBtnActive : {}),
                  }}
                >
                  Hanya Catatan dengan Pengingat
                </button>
              </div>

              {/* Color Filter */}
              <div style={styles.filterSection}>
                <div style={styles.sectionLabel}>WARNA CATATAN</div>
                <div style={styles.colorGrid}>
                  {noteColors.map((color) => {
                    const isSelected = activeFilters.color === color.key;
                    return (
                      <button
                        key={color.key}
                        onClick={() => setFilters({ color: isSelected ? null : color.key })}
                        style={{
                          ...styles.colorCircle,
                          backgroundColor: `var(--note-${color.key})`,
                          border: isSelected ? '2px solid var(--accent)' : '1px solid var(--card-border)',
                          transform: isSelected ? 'scale(1.15)' : 'none',
                        }}
                        title={color.label}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    borderBottom: '1px solid var(--card-border)',
    zIndex: 9,
    width: '100%',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-title)',
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--foreground)',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '480px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    height: '38px',
    backgroundColor: 'var(--background)',
    borderRadius: '10px',
    padding: '0 12px',
    border: '1px solid var(--card-border)',
    position: 'relative',
  },
  searchIcon: {
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    marginRight: '8px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
    fontSize: '13.5px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    borderRadius: '50%',
    backgroundColor: 'var(--muted-light)',
  },
  filterTrigger: {
    height: '38px',
    width: '38px',
    borderRadius: '10px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--background)',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  filterTriggerActive: {
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--accent-light)',
  },
  filterDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '7px',
    height: '7px',
    backgroundColor: 'var(--accent)',
    borderRadius: '50%',
    border: '1.5px solid var(--background)',
  },
  filterDropdown: {
    position: 'absolute',
    top: '46px',
    right: 0,
    width: '280px',
    borderRadius: '16px',
    boxShadow: 'var(--shadow)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 99,
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--card-border)',
    paddingBottom: '8px',
  },
  dropdownTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  },
  buttonGrid: {
    display: 'flex',
    gap: '8px',
  },
  typeBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid var(--card-border)',
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'center',
  },
  typeBtnActive: {
    backgroundColor: 'var(--accent-light)',
    color: 'var(--accent)',
    borderColor: 'var(--accent)',
    fontWeight: '600',
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  colorCircle: {
    height: '24px',
    width: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.15s',
    outline: 'none',
  },
};
