/**
 * Input.stories — variant tampilan dan keadaan untuk text input single-line.
 *
 * Karena Input sering dipakai bersamaan FormField, beberapa story (`WithLabel`,
 * `WithError`, `WithHint`) menunjukkan komposisi minimal — bukan via
 * FormField (yang punya story sendiri).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Input } from './Input';
import type { InputProps } from './Input';
import { Icon } from '../icon';

const meta = {
  title: 'Form/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'Input — text input dengan size variant + slot composition (leftSlot / rightSlot). ' +
          'Ref forwarding RHF-compatible. Set `invalid` untuk visual error state.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url'],
    },
    placeholder: { control: 'text' },
  },
  args: {
    size: 'md',
    type: 'text',
    placeholder: 'Ketik di sini...',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — text input kosong dengan placeholder. */
export const Default: Story = {};

/**
 * Dengan label native — `<label htmlFor>` standar. Untuk integrasi RHF yang
 * auto-wire `aria-describedby`, gunakan FormField (lihat FormField.stories).
 */
export const WithLabel: Story = {
  render: (args: InputProps) => (
    <div className="flex flex-col gap-1.5 w-72">
      <label htmlFor="story-input-label" className="text-sm font-medium text-ink-2">
        Nama Lengkap
      </label>
      <Input {...args} id="story-input-label" placeholder="Nama sesuai KTP" />
    </div>
  ),
};

/** Dengan hint helper text di bawah field. */
export const WithHint: Story = {
  render: (args: InputProps) => (
    <div className="flex flex-col gap-1.5 w-72">
      <label htmlFor="story-input-hint" className="text-sm font-medium text-ink-2">
        Email
      </label>
      <Input
        {...args}
        id="story-input-hint"
        type="email"
        placeholder="nama@skkmigas.go.id"
        aria-describedby="story-input-hint-msg"
      />
      <p id="story-input-hint-msg" className="text-xs text-ink-4">
        Pakai email organisasi (SKK Migas atau KKKS).
      </p>
    </div>
  ),
};

/** State error — `invalid={true}`, border merah, plus pesan error di bawah. */
export const WithError: Story = {
  render: (args: InputProps) => (
    <div className="flex flex-col gap-1.5 w-72">
      <label htmlFor="story-input-err" className="text-sm font-medium text-ink-2">
        Email
      </label>
      <Input
        {...args}
        id="story-input-err"
        type="email"
        defaultValue="bukan-email"
        invalid
        aria-describedby="story-input-err-msg"
      />
      <p id="story-input-err-msg" role="alert" className="text-xs text-red-700">
        Format email tidak valid.
      </p>
    </div>
  ),
};

/** Slot kiri — icon search. Padding kiri otomatis di-adjust. */
export const WithLeftSlot: Story = {
  args: {
    placeholder: 'Cari dataset, area kerja...',
    leftSlot: <Icon name="search" size={14} aria-hidden="true" />,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/** Slot kanan — clear button. Caller bertanggung jawab atas click handler. */
export const WithRightSlot: Story = {
  args: {
    placeholder: 'Filter...',
    defaultValue: 'seismic',
    rightSlot: (
      <button
        type="button"
        aria-label="Bersihkan"
        className="pointer-events-auto inline-flex h-5 w-5 items-center justify-center rounded-pill text-ink-4 hover:bg-surface-2"
      >
        <Icon name="x" size={12} aria-hidden="true" />
      </button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/** Perbandingan 3 ukuran side-by-side. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      <Input size="sm" placeholder="Small (h-8)" />
      <Input size="md" placeholder="Medium (h-10)" />
      <Input size="lg" placeholder="Large (h-12)" />
    </div>
  ),
};

/** Disabled — opacity 60, cursor not-allowed, bg surface-2. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Field di-lock' },
};

/** Read-only — text visible tapi tidak editable. */
export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'WK-2023-001' },
};

/** Password input — masking otomatis browser. */
export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••', autoComplete: 'current-password' },
};

/** Email input — keyboard mobile menampilkan `@` shortcut. */
export const Email: Story = {
  args: { type: 'email', placeholder: 'nama@skkmigas.go.id', autoComplete: 'username' },
};

/**
 * Interaction — verifikasi user dapat ketik dan value ter-update.
 */
export const TypingInteraction: Story = {
  args: { placeholder: 'Ketik nama' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Ketik nama') as HTMLInputElement;
    await userEvent.type(input, 'SKK Migas');
    await expect(input.value).toBe('SKK Migas');
  },
};
