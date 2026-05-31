const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token Helper functions
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('notes_auth_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('notes_auth_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('notes_auth_token');
  }
};

// Generic fetch wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const responseJson = await response.json();

  // Automatically unwrap Laravel's default Eloquent resource wrappers
  if (responseJson && typeof responseJson === 'object' && 'data' in responseJson) {
    return responseJson.data as T;
  }

  return responseJson as T;
}

// Interfaces based on API requirements
export interface User {
  id: number;
  name: string;
  email: string;
  department?: string;
  roles?: string[];
  permissions?: string[];
}

export interface Label {
  id: number;
  name: string;
  color_key?: string;
  scope?: string;
  count_notes?: number;
}

export interface ChecklistItem {
  id: number;
  note_uuid: string;
  content: string;
  is_completed: boolean;
  order: number;
}

export interface Reminder {
  id: number;
  due_at: string;
  timezone?: string;
  status: 'pending' | 'completed';
}

export interface Attachment {
  id: number;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  preview_url: string;
  download_url: string;
}

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  permission: 'view' | 'edit';
}

export interface Note {
  uuid: string;
  title: string;
  content: string;
  note_type: 'text' | 'checklist';
  color_key: string;
  is_pinned: boolean;
  status: 'active' | 'archived' | 'trash';
  created_at: string;
  updated_at: string;
  labels: Label[];
  checklist_items: ChecklistItem[];
  reminder?: Reminder;
  attachments?: Attachment[];
  collaborators?: Collaborator[];
}

export interface NotesSummary {
  active_count: number;
  archived_count: number;
  trash_count: number;
  pinned_count: number;
}

export const api = {
  // Auth API
  auth: {
    login: async (credentials: { email: string; password?: string }) => {
      // Defaulting password to 'password' if omitted to make testing seamless
      const password = credentials.password || 'password';
      const res = await request<{ access_token: string; user: User }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: credentials.email, password }),
      });
      setAuthToken(res.access_token);
      return res.user;
    },
    register: async (data: { name: string; email: string; password?: string }) => {
      const password = data.password || 'password';
      const res = await request<{ access_token: string; user: User }>('auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name: data.name, 
          email: data.email, 
          password,
          password_confirmation: password // satisfy Laravel password confirmed validation rule
        }),
      });
      setAuthToken(res.access_token);
      return res.user;
    },
    logout: async () => {
      try {
        await request('auth/logout', { method: 'POST' });
      } finally {
        removeAuthToken();
      }
    },
    me: async () => {
      return request<User>('auth/me');
    },
  },

  // Notes API
  notes: {
    summary: async () => {
      return request<NotesSummary>('notes-summary');
    },
    list: async () => {
      return request<Note[]>('notes');
    },
    get: async (uuid: string) => {
      return request<Note>(`notes/${uuid}`);
    },
    create: async (data: Partial<Note> & { note_type: 'text' | 'checklist' }) => {
      return request<Note>('notes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (uuid: string, data: Partial<Note>) => {
      return request<Note>(`notes/${uuid}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (uuid: string) => {
      return request<{ message: string }>(`notes/${uuid}`, {
        method: 'DELETE',
      });
    },
    restore: async (uuid: string) => {
      return request<Note>(`notes/${uuid}/restore`, {
        method: 'POST',
      });
    },
    forceDelete: async (uuid: string) => {
      return request<{ message: string }>(`notes/${uuid}/force`, {
        method: 'DELETE',
      });
    },
    pin: async (uuid: string) => {
      return request<Note>(`notes/${uuid}/pin`, {
        method: 'POST',
      });
    },
    archive: async (uuid: string) => {
      return request<Note>(`notes/${uuid}/archive`, {
        method: 'POST',
      });
    },
  },

  // Checklist Items API
  checklist: {
    create: async (noteUuid: string, data: { content: string; order?: number }) => {
      return request<ChecklistItem>(`notes/${noteUuid}/checklist-items`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: number, data: { content?: string; is_completed?: boolean; order?: number }) => {
      return request<ChecklistItem>(`checklist-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: number) => {
      return request<{ message: string }>(`checklist-items/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Labels API
  labels: {
    list: async () => {
      return request<Label[]>('labels');
    },
    create: async (name: string, colorKey?: string) => {
      return request<Label>('labels', {
        method: 'POST',
        body: JSON.stringify({ name, color_key: colorKey }),
      });
    },
    update: async (id: number, data: { name?: string; color_key?: string }) => {
      return request<Label>(`labels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: number) => {
      return request<{ message: string }>(`labels/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Reminders API
  reminders: {
    create: async (noteUuid: string, dueAt: string) => {
      return request<Reminder>(`notes/${noteUuid}/reminders`, {
        method: 'POST',
        body: JSON.stringify({ due_at: dueAt }),
      });
    },
    update: async (id: number, dueAt: string) => {
      return request<Reminder>(`reminders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ due_at: dueAt }),
      });
    },
    complete: async (id: number) => {
      return request<Reminder>(`reminders/${id}/complete`, {
        method: 'POST',
      });
    },
  },

  // Attachments API
  attachments: {
    upload: async (noteUuid: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<Attachment>(`notes/${noteUuid}/attachments`, {
        method: 'POST',
        body: formData,
      });
    },
  },
};
