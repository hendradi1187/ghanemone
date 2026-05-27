/**
 * ExploreMapPane — wrapper HfMap untuk konteks ExplorePage split view.
 *
 * Menampilkan embedded map dengan dataset list di kiri (saat split view aktif).
 * Terima:
 *   - datasets yang sudah di-filter dari parent
 *   - highlightId dari URL param `?selected=...`
 *   - onDatasetClick callback untuk sync ke URL
 *   - children untuk overlay panels (MapLayersPanel)
 *
 * Height: selalu 100% container — parent yang mengatur flex height.
 */
import type { ReactNode } from 'react';
import { HfMap, type MapDataset } from '@ghanem/ui';

export interface ExploreMapPaneProps {
  datasets: MapDataset[];
  highlightId?: string | null;
  onDatasetClick?: (dataset: MapDataset) => void;
  children?: ReactNode;
  className?: string;
}

export function ExploreMapPane({
  datasets,
  highlightId,
  onDatasetClick,
  children,
  className = '',
}: ExploreMapPaneProps): JSX.Element {
  return (
    <div
      className={[
        'relative w-full h-full min-h-0 rounded-2 overflow-hidden border border-line',
        className,
      ].join(' ')}
    >
      <HfMap
        datasets={datasets}
        highlightId={highlightId}
        onDatasetClick={onDatasetClick}
        height="100%"
        ariaLabel="Peta dataset — Explore view"
        zoom={5}
      >
        {children}
      </HfMap>
    </div>
  );
}
