/**
 * Textarea.stories — multi-line input dengan size + error variants.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Form/Textarea',
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          'Textarea — multi-line input. Resizable vertical. Pattern sama dengan Input ' +
          '(forwardRef RHF-friendly, no internal state, set `invalid` untuk error border).',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    size: 'md',
    placeholder: 'Tuliskan catatan...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — kosong dengan placeholder, min-height 80px (size md). */
export const Default: Story = {};

/** Dengan label native — pattern dasar tanpa FormField. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5 w-96">
      <label htmlFor="story-textarea-label" className="text-sm font-medium text-ink-2">
        Catatan Geologi
      </label>
      <Textarea
        {...args}
        id="story-textarea-label"
        placeholder="Deskripsikan formasi, fasies, atau temuan kunci..."
      />
    </div>
  ),
};

/** Dengan error state + pesan validasi di bawah. */
export const WithError: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5 w-96">
      <label htmlFor="story-textarea-err" className="text-sm font-medium text-ink-2">
        Komentar Review
      </label>
      <Textarea
        {...args}
        id="story-textarea-err"
        invalid
        defaultValue="ok"
        aria-describedby="story-textarea-err-msg"
      />
      <p id="story-textarea-err-msg" role="alert" className="text-xs text-red-700">
        Minimal 20 karakter — beri alasan review yang spesifik.
      </p>
    </div>
  ),
};

/** Side-by-side 3 ukuran. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-96">
      <Textarea size="sm" placeholder="Small (min-h 60px)" />
      <Textarea size="md" placeholder="Medium (min-h 80px)" />
      <Textarea size="lg" placeholder="Large (min-h 120px)" />
    </div>
  ),
};

/** Disabled — read-only-like, bg surface-2. */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Field ini di-lock karena status submitted.',
  },
};

/** Dengan konten panjang — demo scroll/resize behavior. */
export const LongContent: Story = {
  args: {
    defaultValue:
      'Hasil interpretasi seismik 3D di blok ABC menunjukkan struktur anticline ' +
      'dengan dimensi 5 × 8 km. Reservoir target di Formasi Talangakar dengan ' +
      'porositas rata-rata 18% (well log SKK-101). Risk geologis: seal capacity ' +
      'pada lapisan shale di atas reservoir perlu validasi ulang via pressure test. ' +
      'Rekomendasi: lanjut ke acquisition 3D seismic Phase 2 dengan budget Q3.',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

/** Interaction — verifikasi user dapat ketik konten panjang. */
export const TypingInteraction: Story = {
  args: { placeholder: 'Catatan' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Catatan') as HTMLTextAreaElement;
    await userEvent.type(textarea, 'Baris 1{enter}Baris 2');
    await expect(textarea.value).toBe('Baris 1\nBaris 2');
  },
};
