/**
 * DatasetCard.stories — list-row + grid-tile variant dengan sample data.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { DatasetCard, type DatasetCardData } from './DatasetCard';

const SAMPLE: DatasetCardData = {
  id: 'wk-onwj',
  title: 'Working Area (WK) Boundary — ONWJ',
  description:
    'Batas Wilayah Kerja Offshore North West Java berdasarkan kontrak PSC terkini.',
  kind: 'LAYER',
  category: 'Administrative',
  format: 'Vector · SHP, GeoJSON',
  provider: { name: 'PHE ONWJ', initials: 'PH', color: 'var(--hf-amber-500, #c2840d)' },
  verified: true,
  status: 'internal',
  year: 2024,
  updatedLabel: '2 hari lalu',
  stats: { downloads: 128, views: 3247, stars: 12 },
};

const SAMPLE_DOC: DatasetCardData = {
  id: 'doc-rokan',
  title: 'PSC Document — WK Rokan (Amendment 2024)',
  description: 'Dokumen Perjanjian Kerja Sama Wilayah Kerja Rokan.',
  kind: 'DOC',
  category: 'Document',
  format: 'PDF · 2.4 MB',
  provider: { name: 'SKK Migas', initials: 'SM', color: 'var(--hf-blue-500, #2a5fb8)' },
  verified: true,
  status: 'confidential',
  year: 2024,
  updatedLabel: '10 hari lalu',
  stats: { downloads: 78, views: 1100, stars: 6 },
};

const meta = {
  title: 'Data Display/DatasetCard',
  component: DatasetCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'DatasetCard — clickable card untuk dataset. Variants `list-row` (default) dan `grid-tile`. ' +
          'Stateless: caller mengelola `selected` + handlers.',
      },
    },
  },
  args: {
    dataset: SAMPLE,
    onClick: fn(),
    onOpen: fn(),
  },
} satisfies Meta<typeof DatasetCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ListRow: Story = {
  args: { variant: 'list-row' },
  render: (args) => (
    <div className="max-w-[640px]">
      <DatasetCard {...args} />
    </div>
  ),
};

export const GridTile: Story = {
  args: { variant: 'grid-tile' },
  render: (args) => (
    <div className="max-w-[320px]">
      <DatasetCard {...args} />
    </div>
  ),
};

export const Selected: Story = {
  args: { selected: true, variant: 'list-row' },
  render: (args) => (
    <div className="max-w-[640px]">
      <DatasetCard {...args} />
    </div>
  ),
};

export const MultipleList: Story = {
  render: (args) => {
    const data = [SAMPLE, SAMPLE_DOC];
    return (
      <div className="flex flex-col gap-2 max-w-[680px]">
        {data.map((d) => (
          <DatasetCard {...args} key={d.id} dataset={d} variant="list-row" />
        ))}
      </div>
    );
  },
};

/** Interactive — klik untuk select; "Open" disorot terpisah. */
export const Interactive: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [selectedId, setSelectedId] = useState<string | null>(null);
      const data = [SAMPLE, SAMPLE_DOC];
      return (
        <div className="flex flex-col gap-2 max-w-[680px]">
          {data.map((d) => (
            <DatasetCard
              key={d.id}
              dataset={d}
              variant="list-row"
              selected={selectedId === d.id}
              onClick={() => setSelectedId(d.id)}
              onOpen={() => {
                // reason: stories must not navigate; surface event via console for debug.
                // eslint-disable-next-line no-console
                console.info('open', d.id);
              }}
            />
          ))}
        </div>
      );
    };
    return <Wrapper />;
  },
};
