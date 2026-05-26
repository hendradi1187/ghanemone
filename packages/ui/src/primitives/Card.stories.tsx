/**
 * Card.stories — surface container dengan elevation (shadow) + padding + radius.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Card — surface container konsisten (border + shadow). Elevation 1..3 menambah ' +
          'shadow depth; `flat` tidak ada shadow. `interactive` menambah hover state.',
      },
    },
  },
  argTypes: {
    elevation: { control: 'select', options: ['flat', '1', '2', '3'] },
    padding: { control: 'select', options: ['0', '2', '3', '4', '5', '6'] },
    radius: { control: 'select', options: ['1', '2', '3', '4'] },
    interactive: { control: 'boolean' },
  },
  args: {
    elevation: '1',
    padding: '4',
    radius: '3',
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Flat — tanpa shadow, hanya border. Cocok untuk inline panel. */
export const Flat: Story = {
  args: { elevation: 'flat' },
  render: (args) => (
    <Card {...args} className="w-72">
      <h3 className="text-h3 font-semibold text-ink">Card Flat</h3>
      <p className="text-sm text-ink-4 mt-1">
        Border only — tidak ada shadow. Cocok untuk inline section.
      </p>
    </Card>
  ),
};

/** Elevation 1 — default, subtle shadow. */
export const Elevation1: Story = {
  args: { elevation: '1' },
  render: (args) => (
    <Card {...args} className="w-72">
      <h3 className="text-h3 font-semibold text-ink">Elevation 1</h3>
      <p className="text-sm text-ink-4 mt-1">
        Default shadow — lift halus dari background.
      </p>
    </Card>
  ),
};

/** Elevation 2 — menengah, dipakai di KPI tile + sidebar panel. */
export const Elevation2: Story = {
  args: { elevation: '2' },
  render: (args) => (
    <Card {...args} className="w-72">
      <h3 className="text-h3 font-semibold text-ink">Elevation 2</h3>
      <p className="text-sm text-ink-4 mt-1">
        Shadow medium — kontras visual lebih tinggi.
      </p>
    </Card>
  ),
};

/** Elevation 3 — terkuat, biasa di floating overlay / modal-like. */
export const Elevation3: Story = {
  args: { elevation: '3' },
  render: (args) => (
    <Card {...args} className="w-72">
      <h3 className="text-h3 font-semibold text-ink">Elevation 3</h3>
      <p className="text-sm text-ink-4 mt-1">
        Shadow maksimum — gunakan sparingly (modal, floating panel).
      </p>
    </Card>
  ),
};

/** Dengan header section — gunakan padding=0 + inner spacing manual. */
export const WithHeader: Story = {
  args: { padding: '0' },
  render: (args) => (
    <Card {...args} className="w-80 overflow-hidden">
      <header className="px-4 py-3 border-b border-line bg-surface-2">
        <h3 className="text-h3 font-semibold text-ink">Dataset Seismic 3D</h3>
        <p className="text-xs text-ink-4 mt-0.5">WK-2023-001 · 1.2 GB</p>
      </header>
      <div className="px-4 py-3">
        <p className="text-sm text-ink-3">
          Body section — opacity full, padding standard. Pakai pola ini untuk
          card yang punya header semantik (mis. dataset summary).
        </p>
      </div>
    </Card>
  ),
};

/** Interactive — hover state untuk clickable card. */
export const Interactive: Story = {
  args: { interactive: true, elevation: '2' },
  render: (args) => (
    <Card {...args} className="w-72 cursor-pointer" role="button" tabIndex={0}>
      <h3 className="text-h3 font-semibold text-ink">Hover saya</h3>
      <p className="text-sm text-ink-4 mt-1">
        Background berubah ke `surface-2` saat hover. Pasangkan dengan
        `role="button"` + `tabIndex={0}` supaya keyboard accessible.
      </p>
    </Card>
  ),
};
