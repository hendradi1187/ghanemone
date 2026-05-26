/**
 * DonutChartCard.stories — donut variant with center value label.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { DonutChartCard } from './DonutChartCard';

const meta = {
  title: 'Charts/DonutChartCard',
  component: DonutChartCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DonutChartCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const status = [
  { name: 'Public', value: 240, color: '#1f8a4a' },
  { name: 'Internal', value: 480, color: '#2a5fb8' },
  { name: 'Confidential', value: 120, color: '#7a5cb8' },
];

export const Default: Story = {
  args: {
    title: 'Status Sensitivitas',
    subtitle: 'Public · Internal · Confidential',
    data: status,
    height: 300,
    centerLabel: 'Total',
  },
  render: (args) => (
    <div className="max-w-md">
      <DonutChartCard {...args} />
    </div>
  ),
};

export const WithCenterValue: Story = {
  args: {
    title: 'Komposisi Data',
    subtitle: 'Override center value',
    data: status,
    height: 300,
    centerValue: '2.4K',
    centerLabel: 'Dataset',
  },
  render: (args) => (
    <div className="max-w-md">
      <DonutChartCard {...args} />
    </div>
  ),
};
