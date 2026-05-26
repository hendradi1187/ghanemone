/**
 * Checkbox.stories — Radix Checkbox wrapper. Mencakup checked, indeterminate,
 * dan state error.
 *
 * Indeterminate state (`checked="indeterminate"`) dipakai di parent checkbox
 * yang merepresentasikan grup (some-but-not-all children selected).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from '@storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Form/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox — wrapper Radix Checkbox dengan styling brand. Mendukung tri-state ' +
          '(unchecked / checked / indeterminate). Untuk integrasi RHF gunakan Controller ' +
          '(checkbox adalah controlled component).',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    size: 'md',
    label: 'Setuju dengan Syarat & Ketentuan',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — unchecked, dengan inline label. */
export const Default: Story = {
  args: { id: 'cb-default' },
};

/** Checked — dengan checkmark hijau. */
export const Checked: Story = {
  args: { id: 'cb-checked', defaultChecked: true },
};

/**
 * Indeterminate — kotak terisi tapi bukan check, merepresentasikan
 * "some children selected". Pakai prop `checked="indeterminate"` (controlled).
 */
export const Indeterminate: Story = {
  args: {
    id: 'cb-indeterm',
    checked: 'indeterminate',
    label: 'Pilih semua provider',
  },
};

/** Disabled — opacity 60, tidak bisa di-toggle. */
export const Disabled: Story = {
  args: { id: 'cb-disabled', disabled: true, defaultChecked: true },
};

/** State error — border merah, pesan di bawah. */
export const WithError: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <Checkbox {...args} id="cb-err" invalid label="Saya menyetujui MoU" />
      <p role="alert" className="text-xs text-red-700">
        Anda harus menyetujui MoU sebelum melanjutkan.
      </p>
    </div>
  ),
};

/** Side-by-side 3 ukuran. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Checkbox id="cb-sm" size="sm" label="Small (14px)" defaultChecked />
      <Checkbox id="cb-md" size="md" label="Medium (16px)" defaultChecked />
      <Checkbox id="cb-lg" size="lg" label="Large (20px)" defaultChecked />
    </div>
  ),
};

/** Interaction — verifikasi toggle on/off. */
export const ToggleInteraction: Story = {
  render: () => {
    const Controlled = (): JSX.Element => {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          id="cb-interactive"
          checked={checked}
          onCheckedChange={(next) => setChecked(next === true)}
          label="Toggle saya"
        />
      );
    };
    return <Controlled />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cb = canvas.getByRole('checkbox', { name: /toggle saya/i });
    await expect(cb).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(cb);
    await expect(cb).toHaveAttribute('aria-checked', 'true');
  },
};
