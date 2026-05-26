/**
 * MapLegend.stories — floating legend card.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { MapLegend } from './MapLegend';

const meta = {
  title: 'Map/MapLegend',
  component: MapLegend,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entries: [
      { label: 'Seismic 2D/3D', color: '#2a5fb8', count: 8 },
      { label: 'Well log', color: '#1f8a4a', count: 8 },
      { label: 'Production', color: '#c2840d', count: 8 },
      { label: 'Concession', color: '#7a5cb8', count: 8 },
    ],
  },
};

export const ManyCategories: Story = {
  args: {
    entries: [
      { label: 'Seismic 2D/3D', color: '#2a5fb8', count: 18 },
      { label: 'Well log', color: '#1f8a4a', count: 14 },
      { label: 'Production', color: '#c2840d', count: 12 },
      { label: 'Concession & WK', color: '#7a5cb8', count: 10 },
      { label: 'Geology & Geochemistry', color: '#cf3a2a', count: 7 },
      { label: 'Document', color: '#5b667e', count: 5 },
      { label: 'Pipeline', color: '#185a8c', count: 4 },
      { label: 'Facility', color: '#9b2218', count: 3 },
    ],
  },
};
