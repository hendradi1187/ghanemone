/**
 * Icon.stories — Lucide-style SVG icon. Mencakup grid lengkap (`AllIcons`)
 * supaya designer + developer dapat browse set ikon yang tersedia.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { iconPaths, type IconName } from './icon-paths';

const meta = {
  title: 'Icon/Icon',
  component: Icon,
  parameters: {
    docs: {
      description: {
        component:
          'Icon — stroked SVG (24×24 viewBox). Decorative by default (`aria-hidden`). Set ' +
          '`title` untuk meaningful icon (otomatis menjadi `role="img"` + `<title>` SR-friendly). ' +
          'Untuk icon-only button, wrap dalam `<button aria-label="...">`.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'select',
      options: Object.keys(iconPaths) as IconName[],
    },
    size: { control: { type: 'number', min: 10, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'number', min: 1, max: 3, step: 0.1 } },
    color: { control: 'color' },
    title: { control: 'text' },
  },
  args: {
    name: 'search',
    size: 16,
    strokeWidth: 1.7,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Grid yang menampilkan SEMUA 41 ikon dengan label nama. Pakai sebagai
 * catalog reference. Layout responsive grid.
 */
export const AllIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Catalog lengkap 41 ikon. Klik label untuk copy nama. ' +
          'Tambah ikon baru di `icon-paths.ts` — otomatis muncul di sini.',
      },
    },
  },
  render: () => {
    const names = Object.keys(iconPaths) as IconName[];
    return (
      <div className="grid grid-cols-4 gap-3 max-w-3xl">
        {names.map((n) => (
          <div
            key={n}
            className="flex flex-col items-center gap-1.5 p-3 bg-surface border border-line rounded-2 hover:bg-surface-2 transition-colors duration-hf"
          >
            <Icon name={n} size={20} className="text-ink-2" />
            <code className="text-[10.5px] font-mono text-ink-4 truncate w-full text-center">
              {n}
            </code>
          </div>
        ))}
      </div>
    );
  },
};

/** Demo 4 ukuran (sm 14 / md 16 / lg 18 / xl 24). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {[14, 16, 18, 24, 32, 48].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <Icon name="layers" size={s} className="text-ink-2" />
          <span className="text-xs text-ink-4">{s}px</span>
        </div>
      ))}
    </div>
  ),
};

/** Color menggunakan token classes (currentColor inherit dari parent). */
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5 text-ink">
        <Icon name="map" size={18} />
        ink
      </span>
      <span className="flex items-center gap-1.5 text-green-500">
        <Icon name="map" size={18} />
        green-500
      </span>
      <span className="flex items-center gap-1.5 text-blue-500">
        <Icon name="map" size={18} />
        blue-500
      </span>
      <span className="flex items-center gap-1.5 text-amber-500">
        <Icon name="warn" size={18} />
        amber-500
      </span>
      <span className="flex items-center gap-1.5 text-red-500">
        <Icon name="x" size={18} />
        red-500
      </span>
    </div>
  ),
};

/**
 * Perbedaan decorative vs labeled. Inspect HTML output di DevTools — labeled
 * icon punya `role="img"` + `<title>`, decorative punya `aria-hidden="true"`.
 */
export const WithTitle: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center gap-2 text-ink-2">
        <Icon name="warn" size={18} className="text-amber-500" aria-hidden />
        <span>
          <strong>Decorative:</strong> warn icon di samping text "Pesan
          peringatan" — text sendiri sudah convey meaning.
        </span>
      </div>
      <div className="flex items-center gap-2 text-ink-2">
        <Icon
          name="warn"
          size={18}
          className="text-amber-500"
          title="Peringatan"
        />
        <span>
          <strong>Labeled:</strong> standalone icon — SR baca "Peringatan".
        </span>
      </div>
    </div>
  ),
};
