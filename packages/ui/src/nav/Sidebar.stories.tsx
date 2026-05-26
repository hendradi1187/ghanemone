/**
 * Sidebar.stories — left rail dengan 3 variant (Browse / Category / Provider).
 * Content driven by props — story menyiapkan dataset realistis.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { Sidebar } from './Sidebar';
import type {
  SidebarBrowseItem,
  SidebarCategoryItem,
  SidebarProviderItem,
  SidebarSection,
} from './Sidebar';

const BROWSE_ITEMS: SidebarBrowseItem[] = [
  { id: 'all', label: 'Semua Dataset', icon: 'database', count: 12480 },
  { id: 'recent', label: 'Terkini', icon: 'clock', count: 245 },
  { id: 'starred', label: 'Bintang', icon: 'star', count: 18 },
  { id: 'shared', label: 'Dibagikan ke saya', icon: 'share', count: 7 },
];

const CATEGORY_ITEMS: SidebarCategoryItem[] = [
  { id: 'cat-seismic', label: 'Seismic 2D/3D', color: '#2a5fb8' },
  { id: 'cat-well', label: 'Well log', color: '#1f8a4a' },
  { id: 'cat-prod', label: 'Production', color: '#c2840d' },
  { id: 'cat-explore', label: 'Exploration report', color: '#7a5cb8' },
  { id: 'cat-geochem', label: 'Geochemistry', color: '#cf3a2a' },
];

const PROVIDER_ITEMS: SidebarProviderItem[] = [
  {
    id: 'prov-pertamina',
    label: 'Pertamina EP',
    initials: 'PE',
    count: 3210,
    color: '#1f8a4a',
  },
  {
    id: 'prov-medco',
    label: 'Medco E&P',
    initials: 'ME',
    count: 1845,
    color: '#2a5fb8',
  },
  {
    id: 'prov-chevron',
    label: 'Chevron Indonesia',
    initials: 'CI',
    count: 1290,
    color: '#c2840d',
  },
  {
    id: 'prov-eni',
    label: 'Eni Indonesia',
    initials: 'EI',
    count: 720,
    color: '#7a5cb8',
  },
];

const meta = {
  title: 'Nav/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Sidebar — left rail dengan section variant (browse / category / provider). Content ' +
          'driven by props supaya bisa reuse across Explore/Map/Workspace. Setiap item ' +
          'rendered sebagai `<button>` (keyboard accessible).',
      },
    },
  },
  argTypes: {
    activeId: { control: 'text' },
  },
  args: {
    onItemClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] flex">
        <Story />
        <div className="flex-1 p-4 bg-surface-bg">
          <p className="text-sm text-ink-4">Konten area (main view)</p>
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hanya section Browse. */
export const Browse: Story = {
  args: {
    activeId: 'all',
    sections: [
      {
        title: 'Browse',
        variant: 'browse',
        items: BROWSE_ITEMS,
      } satisfies SidebarSection,
    ],
  },
};

/** Hanya section Categories. */
export const Categories: Story = {
  args: {
    sections: [
      {
        title: 'Kategori',
        variant: 'category',
        items: CATEGORY_ITEMS,
      } satisfies SidebarSection,
    ],
  },
};

/** Hanya section Providers — dengan footer "Show all". */
export const Providers: Story = {
  args: {
    sections: [
      {
        title: 'Data Provider',
        variant: 'provider',
        items: PROVIDER_ITEMS,
        footer: {
          label: 'Lihat semua 145 provider →',
          onClick: () => undefined,
        },
      } satisfies SidebarSection,
    ],
  },
};

/** Multiple sections — pola realistis (Browse + Categories + Providers). */
export const Combined: Story = {
  args: {
    activeId: 'all',
    sections: [
      { title: 'Browse', variant: 'browse', items: BROWSE_ITEMS },
      { title: 'Kategori', variant: 'category', items: CATEGORY_ITEMS },
      {
        title: 'Data Provider',
        variant: 'provider',
        items: PROVIDER_ITEMS,
        footer: {
          label: 'Lihat semua 145 provider →',
          onClick: () => undefined,
        },
      },
    ],
  },
};

/** Active item ber-state — klik item meng-update activeId reaktif. */
export const WithActiveItem: Story = {
  args: {
    sections: [
      { title: 'Browse', variant: 'browse', items: BROWSE_ITEMS },
      { title: 'Kategori', variant: 'category', items: CATEGORY_ITEMS },
    ],
  },
  render: (args) => {
    const Wrapper = (): JSX.Element => {
      const [activeId, setActiveId] = useState<string>('cat-seismic');
      return (
        <Sidebar
          {...args}
          activeId={activeId}
          onItemClick={(item) => {
            args.onItemClick(item, args.sections[0]);
            setActiveId(item.id);
          }}
        />
      );
    };
    return <Wrapper />;
  },
};
