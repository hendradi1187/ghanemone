/**
 * PieChartCard.stories — Recharts PieChart wrapped Card.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { PieChartCard } from './PieChartCard';

const meta = {
  title: 'Charts/PieChartCard',
  component: PieChartCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PieChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories = [
  { name: 'Seismic', value: 420, color: '#2a5fb8' },
  { name: 'Well log', value: 280, color: '#1f8a4a' },
  { name: 'Production', value: 180, color: '#c2840d' },
  { name: 'Concession', value: 140, color: '#7a5cb8' },
  { name: 'Geology', value: 96, color: '#cf3a2a' },
  { name: 'Document', value: 64, color: '#5b667e' },
];

export const Default: Story = {
  args: {
    title: 'Distribusi Kategori',
    subtitle: 'Persentase per kategori',
    data: categories,
    height: 300,
  },
  render: (args) => (
    <div className="max-w-md">
      <PieChartCard {...args} />
    </div>
  ),
};

export const ManySlices: Story = {
  args: {
    title: 'Distribusi (10 kategori)',
    data: Array.from({ length: 10 }).map((_, i) => ({
      name: `Cat-${i + 1}`,
      value: 60 + ((i * 17) % 90),
    })),
    height: 320,
  },
  render: (args) => (
    <div className="max-w-md">
      <PieChartCard {...args} />
    </div>
  ),
};

export const FewSlices: Story = {
  args: {
    title: 'Status Sensitivitas',
    subtitle: 'Public · Internal · Confidential',
    data: [
      { name: 'Public', value: 240, color: '#1f8a4a' },
      { name: 'Internal', value: 480, color: '#2a5fb8' },
      { name: 'Confidential', value: 120, color: '#7a5cb8' },
    ],
    height: 300,
  },
  render: (args) => (
    <div className="max-w-md">
      <PieChartCard {...args} />
    </div>
  ),
};
