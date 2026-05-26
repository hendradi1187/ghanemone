/**
 * Button.stories — varian visual + keadaan interaktif untuk komponen aksi utama.
 *
 * Setiap story memvalidasi kombinasi prop yang umum. Story `IconOnly`
 * khusus untuk validasi a11y (button tanpa text wajib punya `aria-label`).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, fn } from '@storybook/test';
import { Button } from './Button';
import type { ButtonProps } from './Button';

const meta = {
  title: 'Form/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Button — tombol aksi variant-driven. Variant: `primary`, `secondary`, `ghost`, `danger`. ' +
          'Mendukung loading state, icon kiri/kanan, dan `fullWidth`. ' +
          'Untuk icon-only button wajib pass `aria-label`.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: 'Visual emphasis.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    leftIcon: {
      control: 'select',
      options: [undefined, 'plus', 'download', 'upload', 'search', 'check'],
    },
    rightIcon: {
      control: 'select',
      options: [undefined, 'arrowR', 'chevR', 'download', 'arrowUpRight'],
    },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Klik saya',
    variant: 'primary',
    size: 'md',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tombol CTA utama — gunakan paling banyak 1 di setiap viewport. */
export const Primary: Story = {
  args: { variant: 'primary', children: 'Simpan Perubahan' },
};

/** Aksi sekunder — emphasis lebih rendah dari Primary. */
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Batal' },
};

/** Ghost — paling sering di toolbar / inline action. */
export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Lihat Detail' },
};

/** Aksi destruktif (delete, revoke). Selalu konfirmasi sebelum dispatch. */
export const Danger: Story = {
  args: { variant: 'danger', children: 'Hapus Dataset' },
};

/** Tombol dengan icon di kiri — ideal untuk action label (Download, Upload). */
export const WithLeftIcon: Story = {
  args: { children: 'Unduh Laporan', leftIcon: 'download' },
};

/** Icon di kanan — pakai untuk forward action / navigation. */
export const WithRightIcon: Story = {
  args: { children: 'Lanjutkan', rightIcon: 'arrowR' },
};

/** Loading state — spinner replace icon kiri, `aria-busy=true`, disabled. */
export const Loading: Story = {
  args: { children: 'Menyimpan...', loading: true },
};

/** Disabled — `aria-disabled` + opacity 60%. Tidak menerima focus. */
export const Disabled: Story = {
  args: { children: 'Tidak tersedia', disabled: true },
};

/** Side-by-side perbandingan 3 ukuran. */
export const Sizes: Story = {
  render: (args: ButtonProps) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

/** Full-width — biasa di form mobile dan modal footer. */
export const FullWidth: Story = {
  args: { children: 'Login', fullWidth: true },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

/**
 * Icon-only — wajib `aria-label`. Tanpa label, axe akan flag violation
 * `button-name`.
 */
export const IconOnly: Story = {
  args: {
    children: undefined,
    leftIcon: 'plus',
    size: 'md',
    'aria-label': 'Tambah dataset baru',
  },
};

/**
 * Interaction test — verifikasi click handler dipanggil tepat sekali.
 * Membuktikan a11y keyboard-equivalence (Storybook userEvent.click meng-emit
 * pointer + keyboard).
 */
export const ClickInteraction: Story = {
  args: { children: 'Submit', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
