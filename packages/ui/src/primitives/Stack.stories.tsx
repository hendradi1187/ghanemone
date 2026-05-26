/**
 * Stack.stories — flex container untuk row/col layout dengan token-aligned gap.
 *
 * Polymorphic `as` prop di-demo via story `Polymorphic` (render sebagai `<nav>`,
 * `<section>`, dll.).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta = {
  title: 'Primitives/Stack',
  component: Stack,
  parameters: {
    docs: {
      description: {
        component:
          'Stack — flex container yang menggantikan inline `display:flex; gap:…`. Token-only ' +
          'spacing (Tailwind `gap-X`). Polymorphic via `as` prop (semantic landmark).',
      },
    },
  },
  argTypes: {
    direction: { control: 'select', options: ['row', 'col'] },
    gap: {
      control: 'select',
      options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
    wrap: { control: 'boolean' },
    grow: { control: 'boolean' },
  },
  args: {
    direction: 'row',
    gap: '3',
    justify: 'start',
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Visual swatch supaya story memudahkan inspeksi layout. */
function Box({ label }: { label: string }): JSX.Element {
  return (
    <div className="bg-green-100 border border-green-200 text-green-700 px-3 py-2 rounded-2 text-xs font-medium">
      {label}
    </div>
  );
}

/** Default vertikal — gap 3 (12px). */
export const Vertical: Story = {
  args: { direction: 'col', gap: '3' },
  render: (args) => (
    <Stack {...args}>
      <Box label="Item 1" />
      <Box label="Item 2" />
      <Box label="Item 3" />
    </Stack>
  ),
};

/** Default horizontal — paling umum. */
export const Horizontal: Story = {
  args: { direction: 'row', gap: '3' },
  render: (args) => (
    <Stack {...args}>
      <Box label="Item 1" />
      <Box label="Item 2" />
      <Box label="Item 3" />
    </Stack>
  ),
};

/** Demo semua gap step (0..16). */
export const Gap: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['0', '1', '2', '3', '4', '6', '8', '12', '16'] as const).map((g) => (
        <div key={g}>
          <p className="text-xs text-ink-4 mb-1">gap={g}</p>
          <Stack gap={g}>
            <Box label="A" />
            <Box label="B" />
            <Box label="C" />
          </Stack>
        </div>
      ))}
    </div>
  ),
};

/** Demo `align` (cross-axis) ketika children punya tinggi berbeda. */
export const AlignItems: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['start', 'center', 'end', 'stretch', 'baseline'] as const).map((a) => (
        <div key={a}>
          <p className="text-xs text-ink-4 mb-1">align={a}</p>
          <Stack gap="3" align={a} className="bg-surface-2 p-2 rounded-2 h-16">
            <Box label="Tinggi default" />
            <div className="bg-blue-100 border border-blue-300 text-blue-500 px-3 py-4 rounded-2 text-xs">
              Lebih tinggi
            </div>
            <Box label="Mini" />
          </Stack>
        </div>
      ))}
    </div>
  ),
};

/** Demo `justify` (main-axis). */
export const JustifyContent: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['start', 'center', 'end', 'between', 'around', 'evenly'] as const).map((j) => (
        <div key={j}>
          <p className="text-xs text-ink-4 mb-1">justify={j}</p>
          <Stack gap="2" justify={j} className="bg-surface-2 p-2 rounded-2 w-96">
            <Box label="A" />
            <Box label="B" />
            <Box label="C" />
          </Stack>
        </div>
      ))}
    </div>
  ),
};

/** Flex-wrap — children otomatis turun baris saat overflow. */
export const Wrap: Story = {
  args: { direction: 'row', gap: '2', wrap: true },
  render: (args) => (
    <Stack {...args} className="max-w-md bg-surface-2 p-2 rounded-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Box key={i} label={`Item ${String(i + 1)}`} />
      ))}
    </Stack>
  ),
};

/** Polymorphic — render sebagai `<nav>` untuk semantic landmark. */
export const Polymorphic: Story = {
  args: { as: 'nav', direction: 'row', gap: '4' },
  render: (args) => (
    <Stack {...args} aria-label="Demo nav">
      <a href="#1" className="text-sm text-green-700 underline">
        Beranda
      </a>
      <a href="#2" className="text-sm text-green-700 underline">
        Eksplorasi
      </a>
      <a href="#3" className="text-sm text-green-700 underline">
        Peta
      </a>
    </Stack>
  ),
};
