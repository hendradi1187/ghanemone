/**
 * FilterChip.stories — pill filter aktif dengan tombol remove.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterChip } from './FilterChip';

const meta = {
  title: 'Data Display/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    tone: { control: 'select', options: ['green', 'blue', 'amber', 'neutral'] },
  },
  args: {
    label: 'Kategori',
    value: 'Seismic',
    tone: 'green',
  },
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutRemove: Story = {
  args: { onRemove: undefined },
};

export const AllTones: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterChip {...args} tone="green" />
      <FilterChip {...args} tone="blue" label="Provider" value="PHE ONWJ" />
      <FilterChip {...args} tone="amber" label="Status" value="Internal" />
      <FilterChip {...args} tone="neutral" label="Year" value="2024" />
    </div>
  ),
};

export const RemovableList: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [chips, setChips] = useState<Array<{ key: string; value: string }>>([
        { key: 'Kategori', value: 'Seismic' },
        { key: 'Provider', value: 'PHE ONWJ' },
        { key: 'Status', value: 'Internal' },
      ]);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {chips.map((c) => (
            <FilterChip
              key={`${c.key}-${c.value}`}
              label={c.key}
              value={c.value}
              onRemove={() => setChips((prev) => prev.filter((p) => p.key !== c.key))}
            />
          ))}
          {chips.length === 0 ? (
            <span className="text-sm text-ink-4">Semua chip terhapus.</span>
          ) : null}
        </div>
      );
    };
    return <Wrapper />;
  },
};
