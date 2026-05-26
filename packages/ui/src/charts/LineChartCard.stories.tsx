/**
 * LineChartCard.stories — Recharts LineChart wrapped Card.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { LineChartCard } from './LineChartCard';

const meta = {
  title: 'Charts/LineChartCard',
  component: LineChartCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LineChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const trend = [
  { month: 'Jan 25', value: 84 },
  { month: 'Feb 25', value: 92 },
  { month: 'Mar 25', value: 110 },
  { month: 'Apr 25', value: 105 },
  { month: 'Mei 25', value: 128 },
  { month: 'Jun 25', value: 134 },
  { month: 'Jul 25', value: 142 },
  { month: 'Agu 25', value: 156 },
  { month: 'Sep 25', value: 168 },
  { month: 'Okt 25', value: 178 },
  { month: 'Nov 25', value: 184 },
  { month: 'Des 25', value: 196 },
];

export const Default: Story = {
  args: {
    title: 'Dataset Ditambahkan',
    subtitle: '12 bulan terakhir',
    data: trend,
    xKey: 'month',
    yKey: 'value',
    height: 240,
  },
  render: (args) => (
    <div className="max-w-3xl">
      <LineChartCard {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    title: 'Dataset Ditambahkan',
    subtitle: 'Belum ada periode terisi',
    data: [],
    xKey: 'month',
    yKey: 'value',
  },
  render: (args) => (
    <div className="max-w-3xl">
      <LineChartCard {...args} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    title: 'Dataset Ditambahkan',
    subtitle: 'Memuat…',
    data: [],
    xKey: 'month',
    yKey: 'value',
    loading: true,
  },
  render: (args) => (
    <div className="max-w-3xl">
      <LineChartCard {...args} />
    </div>
  ),
};

export const MultipleSeries: Story = {
  args: {
    title: 'Aktivitas Data',
    subtitle: 'Dataset ditambahkan & diakses per bulan',
    data: trend.map((t) => ({ ...t, accessed: t.value * 9 })),
    xKey: 'month',
    series: [
      { key: 'value', label: 'Ditambahkan' },
      { key: 'accessed', label: 'Diakses' },
    ],
  },
  render: (args) => (
    <div className="max-w-3xl">
      <LineChartCard {...args} />
    </div>
  ),
};
