/**
 * Select.stories — Radix Select wrapper. Compound API (Trigger / Content / Item).
 *
 * Stories memvalidasi: default, groups, error, disabled, long-list scroll,
 * dan separator.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from '@storybook/test';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './Select';

/**
 * `Select` adalah Radix Root re-export (bukan custom component). Meta.component
 * tetap di-set ke `SelectTrigger` agar Storybook punya target docgen yang
 * meaningful.
 */
const meta = {
  title: 'Form/Select',
  component: SelectTrigger,
  parameters: {
    docs: {
      description: {
        component:
          'Select — popup-based select Radix (bukan native `<select>`). Konsisten lintas ' +
          'browser, styleable, dan a11y-correct (combobox pattern, type-ahead, focus trap). ' +
          'Compound API: Select.Root + SelectTrigger + SelectContent + SelectItem.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof SelectTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — 4 opsi sederhana, placeholder visible. */
export const Default: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger {...args} className="w-72" aria-label="Pilih kategori">
        <SelectValue placeholder="Pilih kategori..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="seismic">Seismic</SelectItem>
        <SelectItem value="well">Well log</SelectItem>
        <SelectItem value="production">Production</SelectItem>
        <SelectItem value="exploration">Exploration</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Dengan grouping — label section per grup. */
export const WithGroups: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger {...args} className="w-72" aria-label="Pilih dataset type">
        <SelectValue placeholder="Pilih tipe..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Subsurface</SelectLabel>
          <SelectItem value="seismic-2d">Seismic 2D</SelectItem>
          <SelectItem value="seismic-3d">Seismic 3D</SelectItem>
          <SelectItem value="well-log">Well log</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Surface</SelectLabel>
          <SelectItem value="dem">Digital Elevation Model</SelectItem>
          <SelectItem value="satellite">Satellite imagery</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/** Error state — border merah + invalid. */
export const WithError: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <Select>
        <SelectTrigger
          {...args}
          invalid
          className="w-72"
          aria-label="Pilih kategori"
        >
          <SelectValue placeholder="Belum dipilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="seismic">Seismic</SelectItem>
          <SelectItem value="well">Well log</SelectItem>
        </SelectContent>
      </Select>
      <p role="alert" className="text-xs text-red-700">
        Kategori wajib dipilih.
      </p>
    </div>
  ),
};

/** Disabled — trigger tidak interaktif. */
export const Disabled: Story = {
  render: (args) => (
    <Select disabled>
      <SelectTrigger {...args} className="w-72" aria-label="Locked">
        <SelectValue placeholder="Field di-lock" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">A</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Long list — demo scroll behavior + viewport sizing. */
export const LongList: Story = {
  render: (args) => {
    const provinces = [
      'Aceh',
      'Sumatera Utara',
      'Sumatera Barat',
      'Riau',
      'Jambi',
      'Sumatera Selatan',
      'Bengkulu',
      'Lampung',
      'Kepulauan Bangka Belitung',
      'Kepulauan Riau',
      'DKI Jakarta',
      'Jawa Barat',
      'Jawa Tengah',
      'DI Yogyakarta',
      'Jawa Timur',
      'Banten',
      'Bali',
      'Nusa Tenggara Barat',
      'Nusa Tenggara Timur',
      'Kalimantan Barat',
      'Kalimantan Tengah',
      'Kalimantan Selatan',
      'Kalimantan Timur',
      'Kalimantan Utara',
    ];
    return (
      <Select>
        <SelectTrigger {...args} className="w-72" aria-label="Provinsi">
          <SelectValue placeholder="Pilih provinsi..." />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((p) => (
            <SelectItem key={p} value={p.toLowerCase().replace(/\s+/g, '-')}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

/** Dengan separator antara opsi semantik berbeda. */
export const WithSeparator: Story = {
  render: (args) => (
    <Select>
      <SelectTrigger {...args} className="w-72" aria-label="Aksi">
        <SelectValue placeholder="Pilih aksi..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="view">Lihat detail</SelectItem>
        <SelectItem value="edit">Edit metadata</SelectItem>
        <SelectItem value="share">Bagikan</SelectItem>
        <SelectSeparator />
        <SelectItem value="archive">Arsipkan</SelectItem>
        <SelectItem value="delete">Hapus permanen</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/** Interaction — buka popup + pilih item via click. */
export const OpenAndSelect: Story = {
  render: () => {
    const Controlled = (): JSX.Element => {
      const [value, setValue] = useState<string>('');
      return (
        <div className="flex flex-col gap-2">
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger className="w-72" aria-label="Pilih kategori">
              <SelectValue placeholder="Belum dipilih" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seismic">Seismic</SelectItem>
              <SelectItem value="well">Well log</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-ink-4">Selected: {value || '—'}</p>
        </div>
      );
    };
    return <Controlled />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: /pilih kategori/i });
    await userEvent.click(trigger);
    // reason: Radix Select portal items render di document.body, bukan inside
    // canvasElement. Cari di whole document.
    const seismicItem = await within(document.body).findByRole('option', {
      name: /seismic/i,
    });
    await userEvent.click(seismicItem);
    await expect(trigger).toHaveTextContent(/seismic/i);
  },
};
