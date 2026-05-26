/**
 * Popover.stories — non-modal overlay anchored ke trigger.
 *
 * Untuk modal dengan focus trap, pakai Dialog. Popover non-modal — user dapat
 * interact dengan konten di luar tanpa menutup.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';
import { Button } from '../form/Button';
import { Icon } from '../icon';

const meta = {
  title: 'Overlay/Popover',
  component: Popover.Content,
  parameters: {
    docs: {
      description: {
        component:
          'Popover — non-modal overlay (Radix). Anchor ke trigger. Pakai untuk date picker, ' +
          'filter dropdown, color picker, info popouts. Untuk modal-with-focus-trap, pakai Dialog.',
      },
    },
  },
} satisfies Meta<typeof Popover.Content>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — anchor ke button, posisi bottom. */
export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary" leftIcon="filter">
          Filter
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <p className="text-sm font-semibold text-ink mb-2">Filter</p>
        <p className="text-xs text-ink-4">
          Atur filter pencarian. Popover ini non-modal — Anda bisa scroll halaman
          tanpa menutup.
        </p>
      </Popover.Content>
    </Popover.Root>
  ),
};

/** 4 posisi side (top/right/bottom/left) — 4 button trigger side-by-side. */
export const Positioned: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-12">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover.Root key={side}>
          <Popover.Trigger asChild>
            <Button variant="secondary">Side: {side}</Button>
          </Popover.Trigger>
          <Popover.Content side={side}>
            <p className="text-sm">Anchored {side}</p>
          </Popover.Content>
        </Popover.Root>
      ))}
    </div>
  ),
};

/**
 * Dengan arrow — Radix Arrow primitive di-import directly (tidak di re-export
 * Popover wrapper untuk keep API minimal). Story sebagai contoh advanced
 * pattern.
 */
export const WithArrow: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Help"
          className="inline-flex h-8 w-8 items-center justify-center rounded-pill border border-line bg-surface hover:bg-surface-2 transition-colors duration-hf focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
        >
          <Icon name="help" size={14} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Content sideOffset={8}>
        <p className="text-sm font-semibold text-ink mb-1">Bantuan</p>
        <p className="text-xs text-ink-4">
          Tekan Ctrl+K untuk membuka command palette dari mana saja.
        </p>
      </Popover.Content>
    </Popover.Root>
  ),
};
