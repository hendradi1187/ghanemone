/**
 * QuickActions — panel large action tiles, persona-aware.
 *
 * Setiap tile: icon + label + (optional) sublabel. Pada Phase 8.10 ini hanya
 * toast "coming soon" — Phase 8.11+ wire ke route real.
 */
import { Icon, toast, type IconName } from '@ghanem/ui';
import type { Persona } from '../../mocks/dashboard';

interface QuickAction {
  id: string;
  label: string;
  sublabel?: string;
  icon: IconName;
  tone: 'green' | 'blue' | 'amber' | 'purple';
}

const ACTIONS_BY_PERSONA: Record<Persona, QuickAction[]> = {
  regulator: [
    { id: 'approve', label: 'Approve Dataset', sublabel: '12 menunggu', icon: 'check', tone: 'green' },
    { id: 'audit', label: 'Audit Log', sublabel: '30 hari terakhir', icon: 'shield', tone: 'blue' },
    { id: 'compliance', label: 'Laporan Compliance', sublabel: 'Q2 2026', icon: 'doc', tone: 'amber' },
    { id: 'broadcast', label: 'Broadcast Notifikasi', sublabel: 'Ke semua KKKS', icon: 'bell', tone: 'purple' },
  ],
  kkks_operator: [
    { id: 'upload', label: 'Upload Dataset', sublabel: 'Mulai unggahan baru', icon: 'upload', tone: 'green' },
    { id: 'project', label: 'Proyek Baru', sublabel: 'Inisiasi workspace', icon: 'plus', tone: 'blue' },
    { id: 'pipeline', label: 'Pipeline Saya', sublabel: '5 aktif', icon: 'activity', tone: 'amber' },
    { id: 'share', label: 'Bagikan Data', sublabel: 'Ke partner KKKS', icon: 'share', tone: 'purple' },
  ],
  analyst: [
    { id: 'explore', label: 'Jelajahi Data', sublabel: '1,840 dataset', icon: 'search', tone: 'green' },
    { id: 'query', label: 'Query Baru', sublabel: 'Sandbox SQL', icon: 'bolt', tone: 'blue' },
    { id: 'save', label: 'Simpan Pencarian', sublabel: '18 favorit', icon: 'star', tone: 'amber' },
    { id: 'export', label: 'Ekspor Hasil', sublabel: 'CSV / Parquet', icon: 'download', tone: 'purple' },
  ],
};

const toneClass: Record<QuickAction['tone'], { bg: string; fg: string; border: string }> = {
  green: { bg: 'bg-green-50', fg: 'text-green-700', border: 'border-green-200' },
  blue: { bg: 'bg-blue-50', fg: 'text-blue-600', border: 'border-blue-100' },
  amber: { bg: 'bg-amber-100', fg: 'text-amber-700', border: 'border-amber-100' },
  purple: { bg: 'bg-purple-100', fg: 'text-purple-500', border: 'border-purple-100' },
};

export function QuickActions({ persona }: { persona: Persona }): JSX.Element {
  const actions = ACTIONS_BY_PERSONA[persona];

  return (
    <section
      aria-label="Aksi cepat"
      className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
    >
      <h3 className="font-display font-semibold text-h3 text-ink m-0">Aksi Cepat</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action) => {
          const tone = toneClass[action.tone];
          return (
            <button
              key={action.id}
              type="button"
              onClick={() =>
                toast.info(action.label, {
                  description: 'Fitur ini akan tersedia di Phase 8.11+',
                })
              }
              className={[
                'flex flex-col items-start gap-2 p-3 rounded-3 text-left',
                'border bg-surface hover:bg-surface-2 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                tone.border,
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-flex items-center justify-center w-9 h-9 rounded-2',
                  tone.bg,
                  tone.fg,
                ].join(' ')}
              >
                <Icon name={action.icon} size={18} aria-hidden />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-ink truncate">{action.label}</span>
                {action.sublabel ? (
                  <span className="text-xs text-ink-4 truncate">{action.sublabel}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
