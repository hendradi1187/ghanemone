/**
 * Divider.stories — separator line horizontal / vertical.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta = {
  title: 'Primitives/Divider',
  component: Divider,
  parameters: {
    docs: {
      description: {
        component:
          'Divider — semantic separator (`<hr role="separator">`). Horizontal 1px tinggi, ' +
          'vertical 1px lebar dengan `self-stretch`. Selalu render sebagai `<hr>` (SR-friendly).',
      },
    },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
  args: {
    orientation: 'horizontal',
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Horizontal — full width, 1px tinggi. */
export const Horizontal: Story = {
  render: (args) => (
    <div className="w-80">
      <p className="text-sm text-ink-3">Section atas</p>
      <Divider {...args} className="my-3" />
      <p className="text-sm text-ink-3">Section bawah</p>
    </div>
  ),
};

/** Vertical — gunakan dalam flex row. */
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div className="flex items-center gap-3 h-12 bg-surface border border-line px-3 rounded-2">
      <span className="text-sm text-ink-3">Aksi 1</span>
      <Divider {...args} />
      <span className="text-sm text-ink-3">Aksi 2</span>
      <Divider {...args} />
      <span className="text-sm text-ink-3">Aksi 3</span>
    </div>
  ),
};

/**
 * Dengan label di tengah — composite pattern (Divider sendiri tidak punya
 * built-in label; kombinasi text + 2 Divider untuk hasilkan effect).
 */
export const WithLabel: Story = {
  render: () => (
    <div className="w-80 flex items-center gap-3">
      <Divider className="flex-1" />
      <span className="text-xs uppercase tracking-widest text-ink-4 font-semibold">
        ATAU
      </span>
      <Divider className="flex-1" />
    </div>
  ),
};
