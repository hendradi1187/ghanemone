/**
 * Tabs.stories — WAI-ARIA tabs (underline + pill variants).
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs.Root,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabs — compound API (`Tabs.Root` / `List` / `Trigger` / `Content`). Implementasi WAI-ARIA dengan arrow-key nav, Home/End, dan automatic activation.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['underline', 'pill'] },
  },
  args: {
    // Placeholder controlled props — actual demo handled di render() per story.
    value: 'overview',
    onValueChange: () => undefined,
    children: null,
  },
} satisfies Meta<typeof Tabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [tab, setTab] = useState('overview');
      return (
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Dataset details">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="attrs">Attributes</Tabs.Trigger>
            <Tabs.Trigger value="files">Files</Tabs.Trigger>
            <Tabs.Trigger value="api">API</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="py-3 text-sm text-ink-2">
            Konten overview — deskripsi, statistik singkat, dan tag.
          </Tabs.Content>
          <Tabs.Content value="attrs" className="py-3 text-sm text-ink-2">
            Schema dataset — kolom, tipe, deskripsi.
          </Tabs.Content>
          <Tabs.Content value="files" className="py-3 text-sm text-ink-2">
            Daftar file dataset.
          </Tabs.Content>
          <Tabs.Content value="api" className="py-3 text-sm text-ink-2">
            Snippet curl, JavaScript, Python untuk akses via API.
          </Tabs.Content>
        </Tabs.Root>
      );
    };
    return <Wrapper />;
  },
};

export const Underline: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [tab, setTab] = useState('overview');
      return (
        <Tabs.Root value={tab} onValueChange={setTab} variant="underline">
          <Tabs.List aria-label="Underline tabs">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="lineage">Lineage</Tabs.Trigger>
            <Tabs.Trigger value="map">Map</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="py-3 text-sm text-ink-2">
            Variant underline (default).
          </Tabs.Content>
          <Tabs.Content value="lineage" className="py-3 text-sm text-ink-2">
            Konten lineage.
          </Tabs.Content>
          <Tabs.Content value="map" className="py-3 text-sm text-ink-2">
            Konten map.
          </Tabs.Content>
        </Tabs.Root>
      );
    };
    return <Wrapper />;
  },
};

export const Pill: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [tab, setTab] = useState('day');
      return (
        <Tabs.Root value={tab} onValueChange={setTab} variant="pill">
          <Tabs.List aria-label="Time range">
            <Tabs.Trigger value="day">Hari ini</Tabs.Trigger>
            <Tabs.Trigger value="week">Minggu ini</Tabs.Trigger>
            <Tabs.Trigger value="month">Bulan ini</Tabs.Trigger>
            <Tabs.Trigger value="year">Tahun ini</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="day" className="py-3 text-sm text-ink-2">
            Statistik hari ini.
          </Tabs.Content>
          <Tabs.Content value="week" className="py-3 text-sm text-ink-2">
            Statistik minggu ini.
          </Tabs.Content>
          <Tabs.Content value="month" className="py-3 text-sm text-ink-2">
            Statistik bulan ini.
          </Tabs.Content>
          <Tabs.Content value="year" className="py-3 text-sm text-ink-2">
            Statistik tahun ini.
          </Tabs.Content>
        </Tabs.Root>
      );
    };
    return <Wrapper />;
  },
};

export const WithDisabled: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [tab, setTab] = useState('overview');
      return (
        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List aria-label="Tabs with disabled">
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="attrs">Attributes</Tabs.Trigger>
            <Tabs.Trigger value="seismic" disabled>
              Seismic 3D (Premium)
            </Tabs.Trigger>
            <Tabs.Trigger value="api">API</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview" className="py-3 text-sm text-ink-2">
            Arrow-key navigation skip tab disabled.
          </Tabs.Content>
          <Tabs.Content value="attrs" className="py-3 text-sm text-ink-2">
            Atribut.
          </Tabs.Content>
          <Tabs.Content value="api" className="py-3 text-sm text-ink-2">
            API.
          </Tabs.Content>
        </Tabs.Root>
      );
    };
    return <Wrapper />;
  },
};

export const ScrollableTabs: Story = {
  render: () => {
    const Wrapper = (): JSX.Element => {
      const [tab, setTab] = useState('t1');
      const tabs = Array.from({ length: 12 }, (_, i) => `t${i + 1}`);
      return (
        <div className="max-w-md">
          <Tabs.Root value={tab} onValueChange={setTab}>
            <Tabs.List aria-label="Many tabs" className="overflow-x-auto">
              {tabs.map((t, i) => (
                <Tabs.Trigger key={t} value={t} className="whitespace-nowrap">
                  Tab {i + 1}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value={tab} className="py-3 text-sm text-ink-2">
              Konten untuk {tab}.
            </Tabs.Content>
          </Tabs.Root>
        </div>
      );
    };
    return <Wrapper />;
  },
};
