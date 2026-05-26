/**
 * ActivityFeed — vertical timeline event log untuk Dashboard.
 *
 * Stateless: terima array events + onSelect callback. Time-ago format Bahasa
 * Indonesia ("2 menit lalu", "3 jam lalu", "kemarin").
 *
 * Phase 8.11+ akan wire click → navigate ke event detail / dataset.
 */
import { Icon, toast, type IconName } from '@ghanem/ui';
import type { ActivityEvent, ActivityType } from '../../mocks/dashboard';

interface ActivityFeedProps {
  events: ActivityEvent[];
  loading?: boolean;
  /** Override default toast → navigate (Phase 8.11). */
  onSelect?: (event: ActivityEvent) => void;
}

const ICON_BY_TYPE: Record<ActivityType, IconName> = {
  upload: 'upload',
  approval: 'check',
  alert: 'warn',
  query: 'bolt',
  download: 'download',
  comment: 'comment',
};

const TONE_BY_SEVERITY: Record<ActivityEvent['severity'], { bg: string; fg: string }> = {
  info: { bg: 'bg-blue-50', fg: 'text-blue-600' },
  success: { bg: 'bg-green-50', fg: 'text-green-700' },
  warning: { bg: 'bg-amber-100', fg: 'text-amber-700' },
  error: { bg: 'bg-red-100', fg: 'text-red-500' },
};

/** Format timestamp ISO → "X menit/jam/hari lalu" (Bahasa Indonesia). */
function formatRelative(iso: string, now = new Date(2026, 4, 20, 9, 30, 0)): string {
  const ts = new Date(iso).getTime();
  const diffMs = now.getTime() - ts;
  if (diffMs < 60_000) return 'baru saja';
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'kemarin';
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export function ActivityFeed({ events, loading = false, onSelect }: ActivityFeedProps): JSX.Element {
  const handleClick = (event: ActivityEvent): void => {
    if (onSelect) {
      onSelect(event);
      return;
    }
    toast.info(event.message, {
      description: `Detail event ${event.id} akan tersedia di Phase 8.11+`,
    });
  };

  if (loading) {
    return (
      <section
        aria-busy="true"
        aria-label="Memuat aktivitas terkini"
        className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
      >
        <h3 className="font-display font-semibold text-h3 text-ink m-0">Aktivitas Terkini</h3>
        <ul className="m-0 p-0 list-none flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <li key={idx} className="flex items-start gap-3 py-1">
              <span className="w-8 h-8 rounded-pill bg-surface-3 animate-skeleton-shimmer flex-none" />
              <span className="flex-1 h-3 rounded-1 bg-surface-3 animate-skeleton-shimmer" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section
        aria-label="Aktivitas terkini"
        className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
      >
        <h3 className="font-display font-semibold text-h3 text-ink m-0">Aktivitas Terkini</h3>
        <div className="flex flex-col items-center text-sm text-ink-4 py-8 text-center">
          <Icon name="activity" size={28} aria-hidden className="text-ink-5 mb-2" />
          <p className="m-0">Belum ada aktivitas dalam 24 jam terakhir.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Aktivitas terkini"
      className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
    >
      <header className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-h3 text-ink m-0">Aktivitas Terkini</h3>
        <span
          className={[
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-pill',
            'text-[10.5px] font-semibold bg-green-50 text-green-700',
          ].join(' ')}
        >
          <span aria-hidden="true" className="inline-block w-1.5 h-1.5 rounded-pill bg-green-500" />
          Live
        </span>
      </header>

      <ul className="m-0 p-0 list-none flex flex-col">
        {events.map((event, idx) => {
          const icon = ICON_BY_TYPE[event.type];
          const tone = TONE_BY_SEVERITY[event.severity];
          const isLast = idx === events.length - 1;
          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => handleClick(event)}
                className={[
                  'w-full flex items-start gap-3 py-2.5 text-left',
                  'hover:bg-surface-2 rounded-2 -mx-2 px-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                  !isLast ? 'border-b border-line' : '',
                ].join(' ')}
                aria-label={`${event.message} — ${formatRelative(event.timestamp)}`}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-flex items-center justify-center flex-none',
                    'w-8 h-8 rounded-pill',
                    tone.bg,
                    tone.fg,
                  ].join(' ')}
                >
                  <Icon name={icon} size={14} aria-hidden />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm text-ink leading-snug">
                    <span className="font-semibold">{event.actor.name}</span>
                    <span className="text-ink-3"> · {event.message.replace(`${event.actor.name} `, '')}</span>
                  </p>
                  <p className="m-0 text-xs text-ink-4 mt-0.5 num">{formatRelative(event.timestamp)}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
