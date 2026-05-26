/**
 * SeismicCrossSection — bottom-drawer 3D seismic cross-section view.
 *
 * Ported from prototype `hifi-pages-2.jsx:399-585`.
 *
 * Fix bug #2 (prototype): Originally lived as a global symbol di
 * hifi-pages-2.jsx and was referenced by prototype-app.jsx PageMap melalui
 * window-global karena HTML harness loaded both scripts. Di bundler itu break.
 * Sekarang exported as a real ES module — consumer (MapPage) imports lewat
 * `../features/seismic`.
 *
 * NOTE: Actual SEG-Y rendering di Phase 8.7 dengan Three.js (lihat
 * api-contract.md §10 — `/seismic/:id/cross-section`). Komponen ini stub UI
 * dengan placeholder visual + a11y attrs supaya integrasi MapPage bisa
 * diverifikasi end-to-end di Phase 8.5 tanpa nunggu seismic data engine.
 */
import type { ReactElement } from 'react';

export interface SeismicCrossSectionProps {
  /** Tampilkan garis-garis horizon (top reservoir, pre-rift, dst). */
  showHorizons?: boolean;
  /** Tampilkan garis-garis fault (major + minor). */
  showFaults?: boolean;
  /**
   * Survey id — di production akan dipakai untuk fetch `/seismic/:id/cross-section`.
   * Optional di stub karena render placeholder.
   */
  surveyId?: string;
  /** Optional: callback ketika user klik well di cross-section. */
  onWellSelect?: (wellId: string) => void;
}

export function SeismicCrossSection({
  showHorizons = true,
  showFaults = true,
  surveyId,
  onWellSelect: _onWellSelect,
}: SeismicCrossSectionProps): ReactElement {
  // Stub: render placeholder bar untuk verifikasi layout MapPage.
  // Actual SVG/Canvas/Three.js rendering ported dari hifi-pages-2.jsx:411-535
  // akan di-implement di Phase 8.7 dengan data dari API.
  return (
    <div
      data-testid="seismic-cross-section"
      role="img"
      aria-label={`Seismic cross-section${surveyId ? ` for ${surveyId}` : ''}`}
      style={{
        flex: 1,
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1a1410 0%, #0d0a07 100%)',
        color: '#9aa4bb',
        position: 'relative',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
          opacity: 0.75,
        }}
      >
        SEISMIC CROSS-SECTION
        {surveyId ? ` · ${surveyId}` : ' · SUMATRA_3D_VOL_01'}
        {' · '}
        Horizons: {showHorizons ? 'on' : 'off'}
        {' · '}
        Faults: {showFaults ? 'on' : 'off'}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          opacity: 0.55,
          textAlign: 'center',
          padding: 24,
        }}
      >
        Placeholder · SEG-Y rendering wired di Phase 8.7 (Three.js + API
        `/seismic/:id/cross-section`).
      </div>

      <div
        style={{
          padding: '8px 16px',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace',
          borderTop: '1px solid rgba(255,255,255,.06)',
          opacity: 0.6,
        }}
      >
        25 km · Cross Section
      </div>
    </div>
  );
}
