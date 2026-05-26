/**
 * DropdownMenu.stories — action menu (kebab, user menu, context menu).
 *
 * Radix handle keyboard nav (arrow keys), type-ahead, focus management,
 * sub-menus. Stories memvalidasi setiap variant item.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { DropdownMenu } from './DropdownMenu';
import { Button } from '../form/Button';

const meta = {
  title: 'Overlay/DropdownMenu',
  component: DropdownMenu.Content,
  parameters: {
    docs: {
      description: {
        component:
          'DropdownMenu — Radix action menu. Untuk select-style (form value), pakai Select. ' +
          'Item variants: Item / CheckboxItem / RadioItem / Sub (nested). Separator dan Label ' +
          'untuk grouping.',
      },
    },
  },
} satisfies Meta<typeof DropdownMenu.Content>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — 3 simple items. */
export const Default: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" rightIcon="chevron">
          Aksi
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={fn()}>Lihat detail</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Edit metadata</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Bagikan</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};

/** Checkbox items — multi-select filter pattern. */
export const WithCheckbox: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [filters, setFilters] = useState({
        seismic: true,
        well: false,
        production: true,
      });
      return (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" leftIcon="filter">
              Filter Kategori
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Kategori dataset</DropdownMenu.Label>
            <DropdownMenu.CheckboxItem
              checked={filters.seismic}
              onCheckedChange={(c) =>
                setFilters((f) => ({ ...f, seismic: c === true }))
              }
            >
              Seismic
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={filters.well}
              onCheckedChange={(c) =>
                setFilters((f) => ({ ...f, well: c === true }))
              }
            >
              Well log
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.CheckboxItem
              checked={filters.production}
              onCheckedChange={(c) =>
                setFilters((f) => ({ ...f, production: c === true }))
              }
            >
              Production
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    };
    return <Demo />;
  },
};

/** Radio items — single-select pattern. */
export const WithRadio: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [sort, setSort] = useState('recent');
      return (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary">Sort by: {sort}</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Urutkan</DropdownMenu.Label>
            <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
              <DropdownMenu.RadioItem value="recent">Terbaru</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="name">Nama (A-Z)</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="size">Ukuran</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="provider">Provider</DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );
    };
    return <Demo />;
  },
};

/** Sub menu — nested action group (e.g. "Share > Email / Link / Embed"). */
export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">Aksi Dataset</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={fn()}>Lihat detail</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Edit metadata</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Bagikan</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onSelect={fn()}>Via Email</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={fn()}>Copy link</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={fn()}>Embed code</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item onSelect={fn()}>Download</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};

/** Separator antar group. */
export const WithSeparators: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" leftIcon="more" aria-label="Menu" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Aksi cepat</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={fn()}>Pin ke beranda</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Tambah bintang</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>File</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={fn()}>Download</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Export ke CSV</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Berbahaya</DropdownMenu.Label>
        <DropdownMenu.Item
          onSelect={fn()}
          className="data-[highlighted]:bg-red-100 data-[highlighted]:text-red-700"
        >
          Hapus permanen
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};

/**
 * Destructive item — highlighted dengan warna danger. Pattern kebab menu
 * di list dataset row.
 */
export const Destructive: Story = {
  render: () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" leftIcon="more" aria-label="Menu" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={fn()}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={fn()}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onSelect={fn()}
          className="text-red-700 data-[highlighted]:bg-red-100 data-[highlighted]:text-red-700"
        >
          Hapus
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  ),
};
