/**
 * Tooltip.stories — Radix Tooltip wrapper.
 *
 * Provider sudah di-mount global (lihat .storybook/preview.ts). Setiap story
 * langsung pakai `<Tooltip>` convenience component.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Icon } from '../icon';
import { Button } from '../form/Button';

const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Tooltip — convenience wrapper Radix Tooltip. Pass `content` + child trigger. ' +
          'Radix auto-wire `aria-describedby` ke trigger; namun untuk icon-only trigger, ' +
          'tetap pass `aria-label` di button (accessible name fallback bila tooltip belum visible).',
      },
    },
  },
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
    delayDuration: { control: { type: 'number', min: 0, max: 2000, step: 100 } },
    disabled: { control: 'boolean' },
  },
  args: {
    side: 'top',
    delayDuration: 500,
    // reason: meta.args butuh semua required props supaya StoryObj<typeof meta> tidak error.
    // Individual stories override via `args` + `render` — placeholder content/children ini
    // hanya untuk satisfy TypeScript strict di Storybook 8.
    content: 'Tooltip content placeholder',
    children: null,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — hover trigger 500ms delay. */
export const Default: Story = {
  args: { content: 'Tooltip default — hover untuk muncul' },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};

/** Long delay — pakai untuk tooltip yang hanya muncul pada deliberate hover. */
export const LongDelay: Story = {
  args: { content: 'Muncul setelah 1500ms hover', delayDuration: 1500 },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Slow tooltip</Button>
    </Tooltip>
  ),
};

/** Multi-line content — Radix expand height otomatis. */
export const MultiLine: Story = {
  args: {
    content: (
      <div className="space-y-1">
        <p className="font-semibold">Tip: Keyboard shortcut</p>
        <p>Tekan Ctrl+K untuk search dari mana saja.</p>
        <p className="text-ink-6 text-[10px]">Versi 2026.5</p>
      </div>
    ),
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Multi-line content</Button>
    </Tooltip>
  ),
};

/**
 * Pada icon-only button. Note: button tetap punya `aria-label` sebagai
 * accessible name primary; tooltip menambah informasi visual.
 */
export const OnIconButton: Story = {
  args: { content: 'Bantuan' },
  render: (args) => (
    <Tooltip {...args}>
      <button
        type="button"
        aria-label="Bantuan"
        className="inline-flex h-8 w-8 items-center justify-center rounded-pill border border-line bg-surface hover:bg-surface-2 transition-colors duration-hf focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
      >
        <Icon name="help" size={14} aria-hidden="true" />
      </button>
    </Tooltip>
  ),
};
