/**
 * Pagination.stories — page navigator dengan total count.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Data Display/Pagination',
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageSize: { control: { type: 'number', min: 1 } },
    total: { control: { type: 'number', min: 0 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: {
    page: 1,
    pageSize: 20,
    total: 246,
    siblingCount: 1,
    showCount: true,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { page: 1, pageSize: 20, total: 246, onPageChange: fn() },
  render: (args) => {
    const Wrapper = (): JSX.Element => {
      const [page, setPage] = useState(args.page);
      return (
        <div className="max-w-2xl">
          <Pagination {...args} page={page} onPageChange={setPage} />
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const FewPages: Story = {
  args: { page: 1, pageSize: 20, total: 60, onPageChange: fn() },
  render: (args) => {
    const Wrapper = (): JSX.Element => {
      const [page, setPage] = useState(1);
      return (
        <div className="max-w-2xl">
          <Pagination {...args} page={page} onPageChange={setPage} />
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const ManyPages: Story = {
  args: { page: 5, pageSize: 20, total: 2452, onPageChange: fn() },
  render: (args) => {
    const Wrapper = (): JSX.Element => {
      const [page, setPage] = useState(5);
      return (
        <div className="max-w-2xl">
          <Pagination {...args} page={page} onPageChange={setPage} />
        </div>
      );
    };
    return <Wrapper />;
  },
};

export const Empty: Story = {
  args: { page: 1, pageSize: 20, total: 0, onPageChange: fn() },
};
