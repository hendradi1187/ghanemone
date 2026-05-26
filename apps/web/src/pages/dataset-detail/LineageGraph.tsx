/**
 * LineageGraph — visualisasi sederhana SVG graph upstream→current→downstream.
 *
 * Phase 8.8 implementation: pure SVG dengan boxes + arrows. Tidak dependent
 * pada library graph (D3, Cytoscape, dll). Phase 8.10 akan upgrade ke D3
 * dengan zoom/pan + interaktif full.
 *
 * Layout:
 *   ┌──────────┐  →  ┌──────────┐  →  ┌──────────┐
 *   │ Upstream │     │ Current  │     │Downstream│
 *   │  source  │     │ dataset  │     │ derived  │
 *   └──────────┘     └──────────┘     └──────────┘
 *
 * Klik node → toast info (real navigation deferred ke Phase 8.10).
 *
 * A11y:
 *   - SVG punya `role="img"` + `aria-label` describing graph
 *   - Setiap node adalah focusable `<g>` dengan `tabIndex={0}` + Enter handler
 *   - Text fallback (list of nodes) untuk SR via `aria-hidden="false"` di SVG
 */
import { useId } from 'react';
import { toast } from '@ghanem/ui';
import type { DatasetLineage, LineageItem } from '../../mocks/datasets';

export interface LineageGraphProps {
  /** Lineage data. */
  lineage: DatasetLineage;
  /** Title kartu dataset saat ini (untuk center node label). */
  currentName: string;
  /** Id dataset saat ini (ditampilkan sebagai chip). */
  currentId: string;
}

const nodeWidth = 180;
const nodeHeight = 64;
const gap = 60;

const typeColor: Record<LineageItem['type'], { bg: string; border: string; fg: string }> = {
  source: { bg: '#eef7f1', border: '#1f8a4a', fg: '#0d6634' },
  connector: { bg: '#eaf0fb', border: '#2a5fb8', fg: '#1c4694' },
  derived: { bg: '#f6f0fc', border: '#7a5cb8', fg: '#4d3a85' },
  product: { bg: '#fff4dc', border: '#c2840d', fg: '#825a0a' },
};

const typeLabel: Record<LineageItem['type'], string> = {
  source: 'Sumber',
  connector: 'Konektor',
  derived: 'Turunan',
  product: 'Produk',
};

export function LineageGraph({ lineage, currentName, currentId }: LineageGraphProps): JSX.Element {
  const labelId = useId();
  const arrowId = `${useId()}-arrow`;

  const upstreamCount = lineage.upstream.length;
  const downstreamCount = lineage.downstream.length;
  const maxColumnRows = Math.max(upstreamCount, downstreamCount, 1);

  const width = nodeWidth * 3 + gap * 2 + 32;
  const height = maxColumnRows * (nodeHeight + 12) + 24;

  const upstreamX = 16;
  const currentX = upstreamX + nodeWidth + gap;
  const downstreamX = currentX + nodeWidth + gap;

  const centerY = height / 2 - nodeHeight / 2;

  const handleNodeClick = (label: string): void => {
    toast.info('Navigasi lineage (Phase 8.10)', { description: `Buka detail: ${label}` });
  };

  return (
    <div className="overflow-x-auto">
      <svg
        role="img"
        aria-labelledby={labelId}
        width={width}
        height={Math.max(height, 220)}
        viewBox={`0 0 ${width} ${Math.max(height, 220)}`}
        className="block bg-surface-2 rounded-3 border border-line"
      >
        <title id={labelId}>{`Lineage graph: ${upstreamCount} sumber upstream, ${downstreamCount} produk downstream`}</title>
        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="var(--hf-ink-4, #5b667e)" />
          </marker>
        </defs>

        {/* Upstream nodes */}
        {lineage.upstream.map((item, i) => {
          const y = (height / (upstreamCount + 1)) * (i + 1) - nodeHeight / 2;
          return (
            <LineageNode
              key={item.id}
              x={upstreamX}
              y={y}
              item={item}
              onClick={() => handleNodeClick(item.name)}
            />
          );
        })}

        {/* Current node */}
        <LineageNode
          x={currentX}
          y={centerY}
          item={{ id: currentId, name: currentName, type: 'derived' }}
          isCurrent
        />

        {/* Downstream nodes */}
        {lineage.downstream.map((item, i) => {
          const y = (height / (downstreamCount + 1)) * (i + 1) - nodeHeight / 2;
          return (
            <LineageNode
              key={item.id}
              x={downstreamX}
              y={y}
              item={item}
              onClick={() => handleNodeClick(item.name)}
            />
          );
        })}

        {/* Arrows upstream → current */}
        {lineage.upstream.map((item, i) => {
          const y = (height / (upstreamCount + 1)) * (i + 1);
          return (
            <line
              key={`up-${item.id}`}
              x1={upstreamX + nodeWidth}
              y1={y}
              x2={currentX - 4}
              y2={centerY + nodeHeight / 2}
              stroke="var(--hf-ink-4, #5b667e)"
              strokeWidth="1.4"
              markerEnd={`url(#${arrowId})`}
            />
          );
        })}

        {/* Arrows current → downstream */}
        {lineage.downstream.map((item, i) => {
          const y = (height / (downstreamCount + 1)) * (i + 1);
          return (
            <line
              key={`down-${item.id}`}
              x1={currentX + nodeWidth}
              y1={centerY + nodeHeight / 2}
              x2={downstreamX - 4}
              y2={y}
              stroke="var(--hf-ink-4, #5b667e)"
              strokeWidth="1.4"
              markerEnd={`url(#${arrowId})`}
            />
          );
        })}

        {/* Column labels */}
        <text x={upstreamX + nodeWidth / 2} y={14} textAnchor="middle" className="fill-ink-4 text-[10px] uppercase tracking-widest font-semibold">
          Upstream
        </text>
        <text x={currentX + nodeWidth / 2} y={14} textAnchor="middle" className="fill-ink-4 text-[10px] uppercase tracking-widest font-semibold">
          Dataset ini
        </text>
        <text x={downstreamX + nodeWidth / 2} y={14} textAnchor="middle" className="fill-ink-4 text-[10px] uppercase tracking-widest font-semibold">
          Downstream
        </text>
      </svg>
    </div>
  );
}

interface LineageNodeProps {
  x: number;
  y: number;
  item: LineageItem;
  isCurrent?: boolean;
  onClick?: () => void;
}

function LineageNode({ x, y, item, isCurrent = false, onClick }: LineageNodeProps): JSX.Element {
  const tone = isCurrent
    ? { bg: 'var(--hf-green-50, #eef7f1)', border: 'var(--hf-green-500, #1f8a4a)', fg: 'var(--hf-green-700, #0d6634)' }
    : typeColor[item.type];

  const interactive = !isCurrent && !!onClick;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-label={interactive ? `Buka ${item.name}` : item.name}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={interactive ? 'cursor-pointer focus:outline-none' : ''}
      style={interactive ? { outline: 'none' } : undefined}
    >
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx={8}
        fill={tone.bg}
        stroke={tone.border}
        strokeWidth={isCurrent ? 2 : 1.2}
      />
      <text
        x={12}
        y={20}
        fill={tone.fg}
        className="text-[10px] uppercase tracking-widest font-bold"
      >
        {isCurrent ? 'Saat ini' : typeLabel[item.type]}
      </text>
      <text x={12} y={40} className="text-[12px] fill-ink font-semibold">
        {truncate(item.name, 22)}
      </text>
      <text x={12} y={56} className="text-[10px] fill-ink-4 font-mono">
        {truncate(item.id, 26)}
      </text>
    </g>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}
