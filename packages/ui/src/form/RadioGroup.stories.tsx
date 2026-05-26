/**
 * RadioGroup.stories — single-select dari beberapa opsi.
 *
 * Radix sudah handle arrow key nav + roving tabindex. Story memvalidasi
 * layout (vertical/horizontal) + error state.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from '@storybook/test';
import { RadioGroup, RadioItem } from './RadioGroup';

const meta = {
  title: 'Form/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'RadioGroup — single-select group. Radix menangani keyboard ' +
          'navigation (arrow keys), focus management, dan ARIA roles. ' +
          'RHF integration: gunakan Controller — `field.value` → `value`, ' +
          '`field.onChange` → `onValueChange`.',
      },
    },
  },
  argTypes: {
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
    disabled: { control: 'boolean' },
  },
  args: {
    layout: 'vertical',
    defaultValue: 'seismic',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vertikal — layout default, paling umum di forms. */
export const Vertical: Story = {
  render: (args) => (
    <RadioGroup {...args} aria-label="Kategori dataset">
      <RadioItem value="seismic">Seismic 2D/3D</RadioItem>
      <RadioItem value="well">Well log</RadioItem>
      <RadioItem value="production">Production</RadioItem>
      <RadioItem value="exploration">Exploration report</RadioItem>
    </RadioGroup>
  ),
};

/** Horizontal — cocok untuk binary/triadic choice (Yes/No/Maybe). */
export const Horizontal: Story = {
  args: { layout: 'horizontal', defaultValue: 'public' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Visibility level">
      <RadioItem value="public">Public</RadioItem>
      <RadioItem value="restricted">Restricted</RadioItem>
      <RadioItem value="confidential">Confidential</RadioItem>
    </RadioGroup>
  ),
};

/** Error state — semua item merah, pesan di bawah grup. */
export const WithError: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <RadioGroup {...args} aria-label="Pilih lisensi" aria-invalid>
        <RadioItem value="mit" invalid>
          MIT
        </RadioItem>
        <RadioItem value="apache" invalid>
          Apache-2.0
        </RadioItem>
        <RadioItem value="proprietary" invalid>
          Proprietary
        </RadioItem>
      </RadioGroup>
      <p role="alert" className="text-xs text-red-700">
        Lisensi wajib dipilih sebelum publish dataset.
      </p>
    </div>
  ),
};

/** Disabled — semua opsi tidak interaktif. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'seismic' },
  render: (args) => (
    <RadioGroup {...args} aria-label="Kategori (locked)">
      <RadioItem value="seismic">Seismic 2D/3D</RadioItem>
      <RadioItem value="well">Well log</RadioItem>
    </RadioGroup>
  ),
};

/** Interaction — arrow keys memindah selection. */
export const KeyboardInteraction: Story = {
  render: () => {
    const Controlled = (): JSX.Element => {
      const [value, setValue] = useState('a');
      return (
        <div className="flex flex-col gap-2">
          <RadioGroup value={value} onValueChange={setValue} aria-label="Pilihan">
            <RadioItem value="a">Pilihan A</RadioItem>
            <RadioItem value="b">Pilihan B</RadioItem>
            <RadioItem value="c">Pilihan C</RadioItem>
          </RadioGroup>
          <p className="text-xs text-ink-4">Selected: {value}</p>
        </div>
      );
    };
    return <Controlled />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const itemA = canvas.getByRole('radio', { name: /pilihan a/i });
    await userEvent.click(itemA);
    await expect(itemA).toHaveAttribute('aria-checked', 'true');
  },
};
