/**
 * Page.stories — top-level wrapper untuk app shell.
 *
 * Catatan: stories ini render dalam canvas dengan height terbatas. Default
 * Page menjalankan `overflow-hidden` (lock viewport-height app shell). Story
 * `WithScroll` menunjukkan opsi `scroll=true` ketika body overflow vertikal.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Page } from './Page';

const meta = {
  title: 'Primitives/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page — full-height flex column. Apply token bg/text supaya child component dapat ' +
          'andalkan inheritance. `screenLabel` membantu visual regression captures.',
      },
    },
  },
  argTypes: {
    scroll: { control: 'boolean' },
    screenLabel: { control: 'text' },
  },
  args: {
    scroll: false,
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — overflow-hidden, full height. */
export const Default: Story = {
  args: { screenLabel: 'Demo Page' },
  decorators: [
    (Story) => (
      <div className="h-[500px] w-full">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Page {...args}>
      <header className="flex-none p-4 border-b border-line bg-surface">
        <h1 className="text-h1 font-semibold">Header</h1>
      </header>
      <main className="flex-1 p-4">
        <p className="text-sm text-ink-3">
          Body — flex-1, mengisi sisa ruang. Default `overflow-hidden` lock
          viewport-height app shell (e.g. layout map dengan sidebar).
        </p>
      </main>
    </Page>
  ),
};

/** With scroll — body dapat overflow vertikal. */
export const WithScroll: Story = {
  args: { scroll: true, screenLabel: 'Long-content Page' },
  decorators: [
    (Story) => (
      <div className="h-[500px] w-full">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Page {...args}>
      <header className="flex-none p-4 border-b border-line bg-surface">
        <h1 className="text-h1 font-semibold">Long content</h1>
      </header>
      <main className="p-4 space-y-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="p-3 bg-surface border border-line rounded-2 text-sm text-ink-3"
          >
            Paragraph {String(i + 1)} — Page scroll diaktifkan saat body lebih
            tinggi dari viewport. Pakai untuk pages tipe artikel atau dashboard
            yang panjang.
          </div>
        ))}
      </main>
    </Page>
  ),
};
