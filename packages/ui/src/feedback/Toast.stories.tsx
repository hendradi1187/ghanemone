/**
 * Toast.stories — Sonner wrapper.
 *
 * Toaster sudah di-mount global di .storybook/preview.ts; story di sini cukup
 * pasang button action yang trigger `toast.success()`, `toast.error()`, dll.
 *
 * a11y: Sonner sudah handle `role="status"`/`"alert"` + live region semantics.
 * Story validation: render button + click action; toast muncul di top-right
 * (sesuai default Toaster position).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../form/Button';
import { toast, Toaster } from './Toast';

const meta = {
  title: 'Feedback/Toast',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          '`toast` — Sonner wrapper dengan brand styling. 4 variants visual: ' +
          '`toast.success`, `toast.error`, `toast.warning`, `toast.info`. Untuk async, ' +
          '`toast.promise(promise, {loading, success, error})`. Toaster sudah di-mount ' +
          'di app root (lihat apps/web/src/main.tsx); di Storybook di-mount via preview.ts.',
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Success — hijau, dipakai untuk confirmation (save, submit). */
export const Success: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Dataset berhasil disimpan');
      }}
    >
      Trigger success toast
    </Button>
  ),
};

/** Error — merah, untuk failures (validation, API error). */
export const Error: Story = {
  render: () => (
    <Button
      variant="danger"
      onClick={() => {
        toast.error('Gagal mengunggah file — koneksi terputus');
      }}
    >
      Trigger error toast
    </Button>
  ),
};

/** Warning — amber, untuk caution non-blocking. */
export const Warning: Story = {
  render: () => (
    <Button
      variant="secondary"
      onClick={() => {
        toast.warning('Storage hampir penuh (87%) — pertimbangkan archive');
      }}
    >
      Trigger warning toast
    </Button>
  ),
};

/** Info — biru, untuk informasi neutral. */
export const Info: Story = {
  render: () => (
    <Button
      variant="secondary"
      onClick={() => {
        toast.info('Versi baru tersedia — refresh untuk update');
      }}
    >
      Trigger info toast
    </Button>
  ),
};

/** Dengan description (multi-line). */
export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Login berhasil (mock)', {
          description: 'Welcome, hendra@pm.ghanemtech.co.id',
        });
      }}
    >
      Trigger toast with description
    </Button>
  ),
};

/**
 * Dengan action button — Sonner expose `action` prop untuk call-to-action
 * inline (mis. "Undo" pattern).
 */
export const WithAction: Story = {
  render: () => (
    <Button
      variant="secondary"
      onClick={() => {
        toast('Dataset di-arsipkan', {
          description: 'Dapat dipulihkan dalam 30 hari',
          action: {
            label: 'Urungkan',
            // eslint-disable-next-line no-console
            onClick: () => console.info('[Toast] undo clicked'),
          },
        });
      }}
    >
      Trigger toast with action
    </Button>
  ),
};

/** Persistent — tidak auto-dismiss (duration Infinity). User harus close. */
export const Persistent: Story = {
  render: () => (
    <Button
      variant="secondary"
      onClick={() => {
        toast('Update tersedia', {
          description: 'Versi 2026.6 — klik X untuk dismiss',
          duration: Infinity,
        });
      }}
    >
      Trigger persistent toast
    </Button>
  ),
};
