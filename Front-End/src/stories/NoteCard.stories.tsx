import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NoteCard } from '@/components/NoteCard';
import { NotesProvider } from '@/context/NotesContext';
import { Note } from '@/lib/api';

const meta = {
  title: 'DIPA/NoteCard',
  component: NoteCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NotesProvider>
        <div style={{ padding: '24px', width: '320px', background: 'var(--background)' }}>
          <Story />
        </div>
      </NotesProvider>
    ),
  ],
} satisfies Meta<typeof NoteCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBaseNote: Note = {
  uuid: 'story-note-uuid-1',
  title: 'Rapat Kerja Logistik',
  content: 'Agenda rapat mencakup alokasi anggaran triwulan kedua, audit ketersediaan reagen di lab pusat, dan percepatan distribusi barang.',
  note_type: 'text',
  color_key: 'default',
  is_pinned: false,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  labels: [
    { id: 1, name: 'Pekerjaan' },
    { id: 2, name: 'Logistik' },
  ],
  attachments: [],
  checklist_items: [],
  collaborators: [],
};

export const StandardNote: Story = {
  args: {
    note: mockBaseNote,
    onOpenDetail: () => alert('Clicked Note Card!'),
  },
};

export const PinnedTealNote: Story = {
  args: {
    note: {
      ...mockBaseNote,
      uuid: 'story-note-uuid-2',
      title: 'Daftar Kebutuhan Reagen Lab',
      color_key: 'teal',
      is_pinned: true,
      labels: [{ id: 3, name: 'Laboratorium' }],
    },
    onOpenDetail: () => {},
  },
};

export const ChecklistNote: Story = {
  args: {
    note: {
      ...mockBaseNote,
      uuid: 'story-note-uuid-3',
      title: 'Checklist Pagi Logistik',
      note_type: 'checklist',
      color_key: 'yellow',
      checklist_items: [
        { id: 101, note_uuid: 'story-note-uuid-3', content: 'Periksa suhu kulkas penyimpanan reagen', is_completed: true, order: 1 },
        { id: 102, note_uuid: 'story-note-uuid-3', content: 'Audit stok retainer sample keluar', is_completed: false, order: 2 },
        { id: 103, note_uuid: 'story-note-uuid-3', content: 'Kirim laporan rekap ke direktur utama', is_completed: false, order: 3 },
      ],
    },
    onOpenDetail: () => {},
  },
};

export const OverdueReminderNote: Story = {
  args: {
    note: {
      ...mockBaseNote,
      uuid: 'story-note-uuid-4',
      title: 'Tinjauan Penting Dokumen DIPA',
      color_key: 'red',
      reminder: {
        id: 50,
        due_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (overdue)
        status: 'pending',
      },
    },
    onOpenDetail: () => {},
  },
};
