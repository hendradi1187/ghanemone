/**
 * Container.stories — max-width wrapper untuk page-level content.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta = {
  title: 'Primitives/Container',
  component: Container,
  parameters: {
    docs: {
      description: {
        component:
          'Container — centered max-width wrapper. Mobile-first: full di sm-, max width naik ' +
          'di breakpoint. Pakai untuk page bodies di layar lebar.',
      },
    },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'] },
    paddingX: { control: 'select', options: ['0', '2', '3', '4', '5', '6'] },
  },
  args: {
    size: 'lg',
    paddingX: '4',
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — `lg` (max 1024px), padding-x 4 (16px). */
export const Default: Story = {
  render: (args) => (
    <Container {...args} className="bg-surface border border-line py-6 rounded-2">
      <h2 className="text-h2 font-semibold text-ink">Container default</h2>
      <p className="text-sm text-ink-4 mt-2">
        Container men-set max-width + horizontal padding. Centered via `mx-auto`.
      </p>
    </Container>
  ),
};

/** Narrow — size `sm` (640px), cocok untuk forms / reading text. */
export const Narrow: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Container {...args} className="bg-surface border border-line py-6 rounded-2">
      <h2 className="text-h2 font-semibold text-ink">Container narrow</h2>
      <p className="text-sm text-ink-4 mt-2">
        Max 640px — ideal untuk reading text + form yang panjang.
      </p>
    </Container>
  ),
};

/** Wide — size `2xl` (1440px), untuk dashboard yang penuh. */
export const Wide: Story = {
  args: { size: '2xl' },
  render: (args) => (
    <Container {...args} className="bg-surface border border-line py-6 rounded-2">
      <h2 className="text-h2 font-semibold text-ink">Container wide</h2>
      <p className="text-sm text-ink-4 mt-2">
        Max 1440px — dashboard wide-screen.
      </p>
    </Container>
  ),
};
