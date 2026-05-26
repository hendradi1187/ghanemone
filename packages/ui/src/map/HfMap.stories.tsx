/**
 * HfMap.stories — Leaflet wrapper variants.
 *
 * NOTE: Story butuh Leaflet CSS — Storybook preview harus import
 * `leaflet/dist/leaflet.css` di `.storybook/preview.ts` agar tiles render.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { HfMap, type MapDataset } from './HfMap';

const meta = {
  title: 'Map/HfMap',
  component: HfMap,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HfMap>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleDatasets: MapDataset[] = [
  {
    id: 'wk-onwj',
    name: 'WK ONWJ',
    category: 'Concession & WK',
    color: '#7a5cb8',
    bbox: [106.2, -6.55, 108.4, -5.45],
  },
  {
    id: 'seismic-nsumatra',
    name: 'Seismic 3D N. Sumatra',
    category: 'Seismic 2D/3D',
    color: '#2a5fb8',
    bbox: [96.8, 3.5, 98.5, 5.2],
  },
  {
    id: 'well-onwj-a12',
    name: 'ONWJ-A-12',
    category: 'Well log',
    color: '#1f8a4a',
    longitude: 107.1,
    latitude: -5.85,
  },
];

export const Default: Story = {
  args: { height: '70vh', basemap: 'osm' },
  render: (args) => (
    <div style={{ height: '70vh' }}>
      <HfMap {...args} />
    </div>
  ),
};

export const WithDatasets: Story = {
  args: { height: '70vh', basemap: 'osm', datasets: sampleDatasets },
  render: (args) => (
    <div style={{ height: '70vh' }}>
      <HfMap {...args} />
    </div>
  ),
};

export const Satellite: Story = {
  args: { height: '70vh', basemap: 'satellite', datasets: sampleDatasets },
  render: (args) => (
    <div style={{ height: '70vh' }}>
      <HfMap {...args} />
    </div>
  ),
};

export const Topo: Story = {
  args: { height: '70vh', basemap: 'topo', datasets: sampleDatasets },
  render: (args) => (
    <div style={{ height: '70vh' }}>
      <HfMap {...args} />
    </div>
  ),
};
