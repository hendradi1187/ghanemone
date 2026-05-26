/**
 * EmptyState.stories — placeholder no-data / no-results / error.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Data Display/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'EmptyState — placeholder UI saat list kosong, filter tanpa hasil, atau terjadi error. ' +
          'Role `status` (default) atau `alert` (variant `error`).',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['no-data', 'no-results', 'error'] },
  },
  args: {
    title: 'Belum ada dataset',
    description: 'Mulai dengan mengunggah file pertama atau jelajahi katalog publik.',
    variant: 'no-data',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoData: Story = {
  args: {
    variant: 'no-data',
    action: { label: 'Unggah dataset', onClick: fn(), icon: 'upload' },
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
};

export const NoResults: Story = {
  args: {
    variant: 'no-results',
    title: 'Tidak ada hasil cocok',
    description: 'Coba kurangi filter atau ubah kata kunci pencarian.',
    secondaryAction: { label: 'Reset filter', onClick: fn(), icon: 'refresh' },
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  args: {
    variant: 'error',
    title: 'Gagal memuat data',
    description: 'Terjadi kesalahan saat mengambil dataset. Coba lagi atau hubungi admin.',
    action: { label: 'Coba lagi', onClick: fn(), icon: 'refresh' },
    secondaryAction: { label: 'Laporkan masalah', onClick: fn(), icon: 'warn' },
  },
  render: (args) => (
    <div className="max-w-md">
      <EmptyState {...args} />
    </div>
  ),
};
