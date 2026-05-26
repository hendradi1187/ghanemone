/**
 * StatCard.stories — metric tile compact.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta = {
  title: 'Data Display/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'select', options: ['green', 'blue', 'amber', 'purple', 'neutral'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    label: 'Unduhan 30 hari',
    value: 1248,
    icon: 'download',
    tone: 'green',
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xs">
      <StatCard {...args} />
    </div>
  ),
};

export const WithPositiveChange: Story = {
  args: {
    label: 'API calls 30d',
    value: 84210,
    icon: 'bolt',
    tone: 'blue',
    change: 12.4,
  },
  render: (args) => (
    <div className="max-w-xs">
      <StatCard {...args} />
    </div>
  ),
};

export const WithNegativeChange: Story = {
  args: {
    label: 'Pengguna unik',
    value: 42,
    icon: 'user',
    tone: 'amber',
    change: -3.2,
  },
  render: (args) => (
    <div className="max-w-xs">
      <StatCard {...args} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-start gap-3 flex-wrap">
      <StatCard size="sm" label="Compact" value={1248} icon="download" tone="green" change={4.2} />
      <StatCard size="md" label="Default" value={1248} icon="download" tone="green" change={4.2} />
    </div>
  ),
};

export const Grid: Story = {
  render: () => (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-3 max-w-4xl">
      <StatCard label="Unduhan 30 hari" value={1248} icon="download" tone="green" change={8.2} />
      <StatCard label="API calls 30 hari" value={84210} icon="bolt" tone="blue" change={12.4} />
      <StatCard label="Pengguna unik 30 hari" value={42} icon="user" tone="amber" change={-3.2} />
    </div>
  ),
};

export const NoIcon: Story = {
  args: { icon: undefined },
  render: (args) => (
    <div className="max-w-xs">
      <StatCard {...args} />
    </div>
  ),
};

export const WithUnit: Story = {
  args: { value: 99.4, unit: '%', label: 'Compliance', icon: 'shield', tone: 'purple', change: 0.8 },
  render: (args) => (
    <div className="max-w-xs">
      <StatCard {...args} />
    </div>
  ),
};
