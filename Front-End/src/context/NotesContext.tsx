'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, Note, Label, User, ChecklistItem } from '@/lib/api';

interface Filters {
  color: string | null;
  hasReminder: boolean | null;
  type: 'text' | 'checklist' | null;
}

interface NotesContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  notes: Note[];
  labels: Label[];
  isLoadingNotes: boolean;
  activeView: 'home' | 'reminders' | 'archive' | 'trash' | 'label';
  selectedLabelId: number | null;
  searchQuery: string;
  activeFilters: Filters;
  
  // Auth actions
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Note actions
  fetchNotes: () => Promise<void>;
  createNote: (data: { title: string; content: string; note_type: 'text' | 'checklist'; color_key?: string }) => Promise<Note>;
  updateNote: (uuid: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (uuid: string) => Promise<void>;
  restoreNote: (uuid: string) => Promise<void>;
  forceDeleteNote: (uuid: string) => Promise<void>;
  togglePin: (uuid: string) => Promise<void>;
  toggleArchive: (uuid: string) => Promise<void>;
  
  // Checklist actions
  addChecklistItem: (noteUuid: string, content: string) => Promise<void>;
  updateChecklistItem: (noteUuid: string, id: number, data: { content?: string; is_completed?: boolean }) => Promise<void>;
  deleteChecklistItem: (noteUuid: string, id: number) => Promise<void>;

  // Label actions
  fetchLabels: () => Promise<void>;
  createLabel: (name: string, colorKey?: string) => Promise<void>;
  updateLabel: (id: number, name: string, colorKey?: string) => Promise<void>;
  deleteLabel: (id: number) => Promise<void>;
  
  // Reminder actions
  addReminder: (noteUuid: string, dueAt: string) => Promise<void>;
  completeReminder: (noteUuid: string, reminderId: number) => Promise<void>;

  // Attachment actions
  uploadAttachment: (noteUuid: string, file: File) => Promise<void>;

  // Navigation / Filter UI controls
  setActiveView: (view: 'home' | 'reminders' | 'archive' | 'trash' | 'label') => void;
  setSelectedLabelId: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  
  // Feedback alerts
  toast: { message: string; type: 'success' | 'error' | null };
  showToast: (message: string, type: 'success' | 'error') => void;
  clearToast: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState<boolean>(false);
  
  const [activeView, setActiveView] = useState<'home' | 'reminders' | 'archive' | 'trash' | 'label'>('home');
  const [selectedLabelId, setSelectedLabelId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Filters>({
    color: null,
    hasReminder: null,
    type: null,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { message: '', type: null } : prev));
    }, 4000);
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: '', type: null });
  }, []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingUser(false);
      }
    };
    initAuth();
  }, []);

  // Load Notes & Labels when Authenticated
  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingNotes(true);
    try {
      const data = await api.notes.list();
      // Ensure all notes have standard properties initialized
      const normalized = data.map(n => ({
        ...n,
        checklist_items: n.checklist_items || [],
        labels: n.labels || [],
        attachments: n.attachments || [],
        collaborators: n.collaborators || [],
      }));
      setNotes(normalized);
    } catch (err) {
      showToast('Gagal memuat catatan', 'error');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [isAuthenticated, showToast]);

  const fetchLabels = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.labels.list();
      setLabels(data);
    } catch (err) {
      showToast('Gagal memuat label', 'error');
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
      fetchLabels();
    } else {
      setNotes([]);
      setLabels([]);
    }
  }, [isAuthenticated, fetchNotes, fetchLabels]);

  // Auth Operations
  const login = async (email: string, password?: string) => {
    try {
      const currentUser = await api.auth.login({ email, password });
      setUser(currentUser);
      setIsAuthenticated(true);
      showToast('Berhasil masuk!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal masuk. Silakan periksa kembali email Anda.', 'error');
      throw err;
    }
  };

  const register = async (name: string, email: string, password?: string) => {
    try {
      const currentUser = await api.auth.register({ name, email, password });
      setUser(currentUser);
      setIsAuthenticated(true);
      showToast('Pendaftaran berhasil!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Pendaftaran gagal.', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      setActiveView('home');
      showToast('Berhasil keluar', 'success');
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Note Operations with OPTIMISTIC UPDATES
  const createNote = async (data: { title: string; content: string; note_type: 'text' | 'checklist'; color_key?: string }) => {
    const tempUuid = `temp-${Date.now()}`;
    const newLocalNote: Note = {
      uuid: tempUuid,
      title: data.title,
      content: data.content,
      note_type: data.note_type,
      color_key: data.color_key || 'default',
      is_pinned: false,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      labels: [],
      checklist_items: [],
      attachments: [],
      collaborators: [],
    };

    // Optimistic insert
    setNotes(prev => [newLocalNote, ...prev]);

    try {
      const savedNote = await api.notes.create({
        ...data,
        color_key: data.color_key || 'default',
      });
      // Replace optimistic note with database note
      setNotes(prev => prev.map(n => n.uuid === tempUuid ? savedNote : n));
      showToast('Catatan disimpan', 'success');
      return savedNote;
    } catch (err) {
      // Rollback
      setNotes(prev => prev.filter(n => n.uuid !== tempUuid));
      showToast('Gagal menyimpan catatan', 'error');
      throw err;
    }
  };

  const updateNote = async (uuid: string, data: Partial<Note>) => {
    // Keep reference for fallback
    const originalNotes = [...notes];

    // Optimistic update
    setNotes(prev => prev.map(n => {
      if (n.uuid === uuid) {
        return { ...n, ...data, updated_at: new Date().toISOString() };
      }
      return n;
    }));

    try {
      await api.notes.update(uuid, data);
    } catch (err) {
      // Rollback
      setNotes(originalNotes);
      showToast('Gagal memperbarui catatan', 'error');
    }
  };

  const deleteNote = async (uuid: string) => {
    const originalNotes = [...notes];

    // Optimistic update (move to trash locally)
    setNotes(prev => prev.map(n => {
      if (n.uuid === uuid) {
        return { ...n, status: 'trash' as const };
      }
      return n;
    }));

    try {
      await api.notes.delete(uuid);
      showToast('Catatan dipindahkan ke sampah', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal membuang catatan', 'error');
    }
  };

  const restoreNote = async (uuid: string) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.map(n => {
      if (n.uuid === uuid) {
        return { ...n, status: 'active' as const };
      }
      return n;
    }));

    try {
      await api.notes.restore(uuid);
      showToast('Catatan berhasil dipulihkan', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal memulihkan catatan', 'error');
    }
  };

  const forceDeleteNote = async (uuid: string) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.filter(n => n.uuid !== uuid));

    try {
      await api.notes.forceDelete(uuid);
      showToast('Catatan dihapus permanen', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal menghapus catatan', 'error');
    }
  };

  const togglePin = async (uuid: string) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.map(n => {
      if (n.uuid === uuid) {
        return { ...n, is_pinned: !n.is_pinned };
      }
      return n;
    }));

    try {
      await api.notes.pin(uuid);
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal memperbarui status pin', 'error');
    }
  };

  const toggleArchive = async (uuid: string) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.map(n => {
      if (n.uuid === uuid) {
        const isArchived = n.status === 'archived';
        return { 
          ...n, 
          status: isArchived ? 'active' as const : 'archived' as const,
          is_pinned: isArchived ? n.is_pinned : false // Google Keep unpins when archiving
        };
      }
      return n;
    }));

    try {
      await api.notes.archive(uuid);
      const note = notes.find(n => n.uuid === uuid);
      showToast(note?.status === 'archived' ? 'Catatan diaktifkan kembali' : 'Catatan diarsipkan', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal mengarsipkan catatan', 'error');
    }
  };

  // Checklist Item Actions
  const addChecklistItem = async (noteUuid: string, content: string) => {
    const originalNotes = [...notes];
    const tempId = Date.now();

    const newItem: ChecklistItem = {
      id: tempId,
      note_uuid: noteUuid,
      content,
      is_completed: false,
      order: 100,
    };

    setNotes(prev => prev.map(n => {
      if (n.uuid === noteUuid) {
        return { ...n, checklist_items: [...n.checklist_items, newItem] };
      }
      return n;
    }));

    try {
      const savedItem = await api.checklist.create(noteUuid, { content });
      setNotes(prev => prev.map(n => {
        if (n.uuid === noteUuid) {
          return {
            ...n,
            checklist_items: n.checklist_items.map(item => item.id === tempId ? savedItem : item)
          };
        }
        return n;
      }));
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal menambahkan item checklist', 'error');
    }
  };

  const updateChecklistItem = async (noteUuid: string, id: number, data: { content?: string; is_completed?: boolean }) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.map(n => {
      if (n.uuid === noteUuid) {
        return {
          ...n,
          checklist_items: n.checklist_items.map(item => item.id === id ? { ...item, ...data } : item)
        };
      }
      return n;
    }));

    try {
      await api.checklist.update(id, data);
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal memperbarui item checklist', 'error');
    }
  };

  const deleteChecklistItem = async (noteUuid: string, id: number) => {
    const originalNotes = [...notes];

    setNotes(prev => prev.map(n => {
      if (n.uuid === noteUuid) {
        return {
          ...n,
          checklist_items: n.checklist_items.filter(item => item.id !== id)
        };
      }
      return n;
    }));

    try {
      await api.checklist.delete(id);
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal menghapus item checklist', 'error');
    }
  };

  // Label Actions
  const createLabel = async (name: string, colorKey?: string) => {
    try {
      await api.labels.create(name, colorKey);
      fetchLabels();
      fetchNotes(); // reload note list counts
      showToast(`Label "${name}" dibuat`, 'success');
    } catch (err) {
      showToast('Gagal membuat label', 'error');
    }
  };

  const updateLabel = async (id: number, name: string, colorKey?: string) => {
    try {
      await api.labels.update(id, { name, color_key: colorKey });
      fetchLabels();
      fetchNotes();
      showToast('Label diperbarui', 'success');
    } catch (err) {
      showToast('Gagal memperbarui label', 'error');
    }
  };

  const deleteLabel = async (id: number) => {
    try {
      await api.labels.delete(id);
      fetchLabels();
      fetchNotes();
      showToast('Label dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus label', 'error');
    }
  };

  // Reminders
  const addReminder = async (noteUuid: string, dueAt: string) => {
    const originalNotes = [...notes];

    try {
      const savedReminder = await api.reminders.create(noteUuid, dueAt);
      setNotes(prev => prev.map(n => {
        if (n.uuid === noteUuid) {
          return { ...n, reminder: savedReminder };
        }
        return n;
      }));
      showToast('Pengingat ditambahkan', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal menambahkan pengingat', 'error');
    }
  };

  const completeReminder = async (noteUuid: string, reminderId: number) => {
    const originalNotes = [...notes];

    try {
      await api.reminders.complete(reminderId);
      setNotes(prev => prev.map(n => {
        if (n.uuid === noteUuid) {
          return {
            ...n,
            reminder: n.reminder ? { ...n.reminder, status: 'completed' as const } : undefined
          };
        }
        return n;
      }));
      showToast('Pengingat ditandai selesai', 'success');
    } catch (err) {
      setNotes(originalNotes);
      showToast('Gagal menyelesaikan pengingat', 'error');
    }
  };

  // Attachments
  const uploadAttachment = async (noteUuid: string, file: File) => {
    try {
      const attachment = await api.attachments.upload(noteUuid, file);
      setNotes(prev => prev.map(n => {
        if (n.uuid === noteUuid) {
          return {
            ...n,
            attachments: [...(n.attachments || []), attachment]
          };
        }
        return n;
      }));
      showToast('File berhasil diunggah', 'success');
    } catch (err) {
      showToast('Gagal mengunggah file', 'error');
    }
  };

  // Advanced filters operations
  const setFilters = useCallback((filters: Partial<Filters>) => {
    setActiveFilters((prev) => ({ ...prev, ...filters }));
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters({
      color: null,
      hasReminder: null,
      type: null,
    });
  }, []);

  return (
    <NotesContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingUser,
        notes,
        labels,
        isLoadingNotes,
        activeView,
        selectedLabelId,
        searchQuery,
        activeFilters,
        login,
        register,
        logout,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        forceDeleteNote,
        togglePin,
        toggleArchive,
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        fetchLabels,
        createLabel,
        updateLabel,
        deleteLabel,
        addReminder,
        completeReminder,
        uploadAttachment,
        setActiveView,
        setSelectedLabelId,
        setSearchQuery,
        setFilters,
        resetFilters,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
