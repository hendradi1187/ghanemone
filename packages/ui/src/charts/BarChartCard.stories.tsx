/**
 * BarChartCard.stories — Recharts BarChart wrapped Card.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { BarChartCard } from './BarChartCard';

const meta = {
  title: 'Charts/BarChartCard',
  component: BarChartCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BarChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const providers = [
  { name: 'Pertamina Hulu Mahakam', count: 245, color: '#1f8a4a' },
  { name: 'PHE ONWJ', count: 183, color: '#c2840d' },
  { name: 'Pertamina Subsurface', count: 167, color: '#2a5fb8' },
  { name: 'Medco E&P', count: 142, color: '#2a5fb8' },
  { name: 'Harbour Energy', count: 96, color: '#7a5cb8' },
];

export const Default: Story = {
  args: {
    title: 'Top 5 Provider',
    subtitle: 'Berdasarkan jumlah dataset',
    data: providers,
    xKey: 'name',
    yKey: 'count',
    colors: providers.map((p) => p.color),
    orientation: 'horizontal',
    height: 260,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <BarChartCard {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    title: 'Distribusi (Horizontal)',
    data: providers,
    xKey: 'name',
    yKey: 'count',
    orientation: 'horizontal',
    color: '#1f8a4a',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <BarChartCard {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    title: 'Distribusi (Vertical)',
    data: providers.map((p) => ({ name: p.name.split(' ')[0] ?? p.name.slice(0, 3), count: p.count })),
    xKey: 'name',
    yKey: 'count',
    orientation: 'vertical',
    color: '#2a5fb8',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <BarChartCard {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    title: 'Top Provider',
    data: [],
    xKey: 'name',
    yKey: 'count',
  },
  render: (args) => (
    <div className="max-w-2xl">
      <BarChartCard {...args} />
    </div>
  ),
};
