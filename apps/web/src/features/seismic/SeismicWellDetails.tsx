/**
 * SeismicWellDetails — right-docking panel saat seismic mode aktif.
 *
 * Ported from prototype `hifi-pages-2.jsx:283-394` (was `WellDetailsPanel`).
 *
 * Fix bug #2 (prototype): Originally cross-file global di hifi-pages-2.jsx,
 * referenced dari prototype-app.jsx PageMap via window-global. Di bundler ini
 * break. Sekarang di-export proper sebagai ES module dan diimpor oleh
 * MapPage via `../features/seismic` barrel.
 *
 * NOTE: Actual data (well attributes, seismic survey info, horizon depths)
 * datang dari `/wells/:id` + `/seismic/:surveyId` di Phase 8.6. Stub di sini
 * mempertahankan layout shape supaya MapPage integrasi-nya dapat diverifikasi.
 */
import type { ReactElement } from 'react';

export interface WellSummary {
  id: string;
  status: 'Active' | 'Inactive' | 'Plugged';
  basin: string;
  type: string;
  operator: string;
  spudDate: string;
  totalDepth: string;
  field: string;
  formation: string;
  reservoir: string;
  lastUpdate: string;
}

export interface SeismicWellDetailsProps {
  /** Required callback untuk menutup panel — di MapPage memicu `toggleLayer('seismic-3d-…')`. */
  onClose: () => void;
  /**
   * Optional well payload. Bila tidak di-pass, panel render placeholder
   * (cocok untuk Phase 8.5 sebelum API `/wells/:id` di-wire).
   */
  well?: WellSummary;
}

const PLACEHOLDER_WELL: WellSummary = {
  id: 'GWN-01',
  status: 'Active',
  basin: 'Jambi Sub Basin, South Sumatra Basin',
  type: 'Exploration',
  operator: 'PT. Ghanem Energy',
  spudDate: '12 Jan 2022',
  totalDepth: '3,250 m MD',
  field: 'Ghanem Field',
  formation: 'Bekasap Formation',
  reservoir: 'Sandstone',
  lastUpdate: '20 May 2024',
};

export function SeismicWellDetails({
  onClose,
  well = PLACEHOLDER_WELL,
}: SeismicWellDetailsProps): ReactElement {
  const rows: [string, string][] = [
    ['Well Type', well.type],
    ['Operator', well.operator],
    ['Spud Date', well.spudDate],
    ['Total Depth', well.totalDepth],
    ['Status', well.status],
    ['Field', well.field],
    ['Formation', well.formation],
    ['Reservoir', well.reservoir],
    ['Last Update', well.lastUpdate],
  ];

  return (
    <aside
      data-testid="seismic-well-details"
      aria-label={`Well details for ${well.id}`}
      style={{
        position: 'absolute',
        top: 72,
        right: 0,
        bottom: 0,
        width: 320,
        background: 'var(--hf-surface, #ffffff)',
        borderLeft: '1px solid var(--hf-line, #e6e1d4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 600,
        boxShadow: '-8px 0 24px rgba(14,23,38,.06)',
      }}
    >
      <div
        style={{
          padding: '14px 16px 12px',
          borderBottom: '1px solid var(--hf-line, #e6e1d4)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--hf-ink-4, #6b7280)',
          }}
        >
          Well Details
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close well details panel"
          style={{
            marginLeft: 'auto',
            width: 26,
            height: 26,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 14,
            color: 'var(--hf-ink-3, #4b5563)',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {well.id}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              padding: '2px 8px',
              borderRadius: 999,
              background: '#e8f5ec',
              color: '#1f8a4a',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {well.status}
          </span>
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: 'var(--hf-ink-3, #4b5563)',
            marginBottom: 14,
          }}
        >
          {well.basin}
        </div>

        <div
          style={{
            border: '1px solid var(--hf-line, #e6e1d4)',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 14,
          }}
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              style={{
                padding: '7px 12px',
                fontSize: 11.5,
                display: 'flex',
                gap: 8,
                borderBottom: i < rows.length - 1 ? '1px solid var(--hf-line, #e6e1d4)' : 0,
              }}
            >
              <span style={{ flex: '0 0 100px', color: 'var(--hf-ink-4, #6b7280)' }}>{k}</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--hf-ink-4, #6b7280)',
            opacity: 0.85,
          }}
        >
          Seismic survey info, amplitude legend, dan horizon depth table di-load
          dari API (`/wells/:id`, `/seismic/:surveyId`) di Phase 8.6.
        </div>
      </div>
    </aside>
  );
}
