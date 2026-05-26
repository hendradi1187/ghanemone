/**
 * AttributeTable.stories — schema/columns table dengan sort + filter.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { AttributeTable, type AttributeRow } from './AttributeTable';

const SAMPLE: AttributeRow[] = [
  { name: 'uwi', type: 'string', description: 'Unique Well Identifier.', nullable: false, example: 'GWN-01' },
  { name: 'well_name', type: 'string', description: 'Nama sumur.', nullable: false, example: 'Ghanem-Well-01' },
  { name: 'spud_date', type: 'date', description: 'Tanggal mulai pengeboran.', nullable: false, example: '2022-01-12' },
  { name: 'total_depth_m', type: 'number', description: 'Total kedalaman dalam meter TVDSS.', nullable: false, example: '3250' },
  { name: 'reservoir', type: 'string', description: 'Jenis reservoir target.', nullable: true, example: 'Sandstone' },
  { name: 'location', type: 'geometry', description: 'Koordinat well-head dalam WGS84.', nullable: false, example: 'POINT(107.10 -5.85)' },
];

const meta = {
  title: 'Data Display/AttributeTable',
  component: AttributeTable,
  parameters: { layout: 'padded' },
  args: { attributes: SAMPLE },
} satisfies Meta<typeof AttributeTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-3xl">
      <AttributeTable {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: { attributes: [] },
  render: (args) => (
    <div className="max-w-3xl">
      <AttributeTable {...args} />
    </div>
  ),
};

export const NoSearch: Story = {
  args: { hideSearch: true },
  render: (args) => (
    <div className="max-w-3xl">
      <AttributeTable {...args} />
    </div>
  ),
};

export const ManyAttrs: Story = {
  args: {
    attributes: Array.from({ length: 50 }, (_, i) => ({
      name: `attr_${(i + 1).toString().padStart(2, '0')}`,
      type: (['string', 'number', 'date', 'geometry'] as const)[i % 4]!,
      description: `Deskripsi kolom #${i + 1} — auto-generated untuk testing scroll.`,
      nullable: i % 3 === 0,
      example: i % 4 === 1 ? `${1000 + i}` : i % 4 === 2 ? '2024-05-12' : `value_${i}`,
    })),
  },
  render: (args) => (
    <div className="max-w-4xl">
      <AttributeTable {...args} />
    </div>
  ),
};
