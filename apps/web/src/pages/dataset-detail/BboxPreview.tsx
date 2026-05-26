/**
 * BboxPreview — placeholder peta dengan red rectangle untuk bbox dataset.
 *
 * SVG manual map outline (Indonesia focused, bbox 92E-142E × 8N-12S).
 * Cukup untuk indikasi visual lokasi dataset relatif terhadap nusantara.
 * Phase 8.9 akan diganti dengan Leaflet real map.
 *
 * Math:
 *   - Map area di koordinat 92..142 E × -12..8 N (50° lon × 20° lat).
 *   - SVG viewport 800 × 320 → 1° lon = 16 px, 1° lat = 16 px.
 *
 * A11y:
 *   - `role="img"` + `aria-label` describing bbox center + extent
 *   - "Open di Map View" link punya semantic anchor (Link)
 */
import { Link } from 'react-router-dom';
import { useId } from 'react';
import { Icon } from '@ghanem/ui';

export interface BboxPreviewProps {
  /** [minLon, minLat, maxLon, maxLat]. */
  bbox: [number, number, number, number];
  /** ID dataset untuk link ke /map?layer=:id. */
  datasetId: string;
}

const MAP = {
  minLon: 92,
  maxLon: 142,
  minLat: -12,
  maxLat: 8,
  width: 800,
  height: 320,
};

function lonToX(lon: number): number {
  return ((lon - MAP.minLon) / (MAP.maxLon - MAP.minLon)) * MAP.width;
}

function latToY(lat: number): number {
  // SVG y axis flipped — latitude tinggi = y kecil.
  return ((MAP.maxLat - lat) / (MAP.maxLat - MAP.minLat)) * MAP.height;
}

// Approximate Indonesia archipelago outline — simplified untuk decorative purpose.
const ISLAND_PATHS = [
  // Sumatra
  'M 96,52 L 102,46 L 108,52 L 114,62 L 116,76 L 110,84 L 104,80 L 100,74 L 96,68 Z',
  // Java
  'M 116,108 L 130,110 L 142,112 L 152,114 L 148,120 L 134,120 L 122,118 L 116,114 Z',
  // Kalimantan
  'M 132,52 L 144,46 L 156,50 L 162,60 L 160,72 L 154,84 L 146,84 L 138,76 L 134,66 Z',
  // Sulawesi
  'M 168,52 L 178,46 L 184,54 L 182,68 L 188,76 L 184,90 L 178,92 L 178,82 L 172,78 L 174,68 L 168,62 Z',
  // Papua
  'M 208,68 L 230,64 L 246,68 L 252,80 L 248,94 L 230,98 L 212,94 L 204,86 Z',
  // Maluku
  'M 196,76 L 202,72 L 206,78 L 204,86 L 198,84 Z',
  // Nusa Tenggara
  'M 152,124 L 166,124 L 178,124 L 192,126 L 186,128 L 172,128 L 158,128 Z',
];

export function BboxPreview({ bbox, datasetId }: BboxPreviewProps): JSX.Element {
  const labelId = useId();
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const x = lonToX(minLon);
  const y = latToY(maxLat);
  const w = lonToX(maxLon) - lonToX(minLon);
  const h = latToY(minLat) - latToY(maxLat);

  const centerLon = ((minLon + maxLon) / 2).toFixed(2);
  const centerLat = ((minLat + maxLat) / 2).toFixed(2);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-3 border border-line bg-blue-50">
        <svg
          role="img"
          aria-labelledby={labelId}
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          className="block w-full h-auto bg-gradient-to-br from-blue-50 to-blue-100"
        >
          <title id={labelId}>
            {`Bbox dataset di pusat ${centerLon}E, ${centerLat}N. Extent: ${minLon}..${maxLon} lon × ${minLat}..${maxLat} lat.`}
          </title>
          {/* Decorative graticule */}
          {Array.from({ length: 6 }, (_, i) => 100 + i * 8).map((lon) => (
            <line
              key={`mer-${lon}`}
              x1={lonToX(lon)}
              y1={0}
              x2={lonToX(lon)}
              y2={MAP.height}
              stroke="#bccfeb"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          ))}
          {Array.from({ length: 4 }, (_, i) => -8 + i * 4).map((lat) => (
            <line
              key={`par-${lat}`}
              x1={0}
              y1={latToY(lat)}
              x2={MAP.width}
              y2={latToY(lat)}
              stroke="#bccfeb"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          ))}
          {/* Islands */}
          {ISLAND_PATHS.map((d, idx) => (
            <path key={idx} d={d} fill="#cfead8" stroke="#1f8a4a" strokeWidth="0.7" />
          ))}
          {/* BBox rectangle */}
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill="rgba(207, 58, 42, 0.18)"
            stroke="#cf3a2a"
            strokeWidth="1.6"
            strokeDasharray="4 3"
          />
          {/* Center crosshair */}
          <circle cx={x + w / 2} cy={y + h / 2} r="3" fill="#cf3a2a" />
          <text
            x={x + w / 2}
            y={y - 4}
            textAnchor="middle"
            className="text-[10px] font-semibold"
            fill="#cf3a2a"
          >
            Bbox dataset
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-ink-4 m-0">
          Pusat:{' '}
          <span className="num font-mono text-ink-2">
            {centerLon}°E, {centerLat}°N
          </span>
          {' · '}
          Extent:{' '}
          <span className="num font-mono text-ink-2">
            {(maxLon - minLon).toFixed(2)}° × {(maxLat - minLat).toFixed(2)}°
          </span>
        </p>
        <Link
          to={`/map?layer=${encodeURIComponent(datasetId)}`}
          className={[
            'inline-flex items-center gap-1 text-xs font-semibold text-green-700',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1.5 py-0.5',
          ].join(' ')}
        >
          Buka di Map View
          <Icon name="arrowUpRight" size={11} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
