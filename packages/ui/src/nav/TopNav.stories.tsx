/**
 * TopNav.stories — primary site chrome dengan brand, search, links, user.
 *
 * Komponen stateless — story memparkir state di wrapper component supaya
 * active route + search value reaktif.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { TopNav } from './TopNav';
import type { TopNavLink, TopNavUser } from './TopNav';

const DEMO_LINKS: TopNavLink[] = [
  { label: 'EXPLORE DATA', route: '/explore' },
  { label: 'PETA NASIONAL', route: '/map' },
  { label: 'WORKSPACE', route: '/workspace' },
  { label: 'AI ASSISTANT', route: '/ai' },
];

const DEMO_USER: TopNavUser = {
  initials: 'SM',
  org: 'SKK Migas',
  role: 'Regulator',
};

const meta = {
  title: 'Nav/TopNav',
  component: TopNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'TopNav — chrome utama (brand + links + actions + user). Stateless: caller pass ' +
          '`activeRoute` dan `onNavigate`. Search box opsional. Notifications dot muncul saat ' +
          '`notificationsCount > 0`.',
      },
    },
  },
  argTypes: {
    activeRoute: {
      control: 'select',
      options: DEMO_LINKS.map((l) => l.route),
    },
    notificationsCount: { control: { type: 'number', min: 0, max: 99 } },
  },
  args: {
    links: DEMO_LINKS,
    activeRoute: '/explore',
    user: DEMO_USER,
    onNavigate: fn(),
    onHelpClick: fn(),
    onNotificationsClick: fn(),
  },
} satisfies Meta<typeof TopNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — brand + links + actions + user. */
export const Default: Story = {};

/** Demo `aria-current="page"` mengikuti `activeRoute`. */
export const WithActiveRoute: Story = {
  args: { activeRoute: '/map' },
};

/** Notification dot — `notificationsCount > 0` menampilkan red indicator. */
export const WithNotifications: Story = {
  args: { notificationsCount: 7 },
};

/** Search box visible — `search` prop set. Controlled value via state. */
export const WithSearch: Story = {
  render: (args) => {
    const Wrapper = (): JSX.Element => {
      const [route, setRoute] = useState('/explore');
      const [q, setQ] = useState('');
      return (
        <TopNav
          {...args}
          activeRoute={route}
          onNavigate={(next) => {
            args.onNavigate(next);
            setRoute(next);
          }}
          search={{
            placeholder: 'Cari dataset, area kerja, sumur, atau dokumen...',
            value: q,
            onChange: setQ,
            shortcutHint: 'Ctrl K',
          }}
        />
      );
    };
    return <Wrapper />;
  },
};
