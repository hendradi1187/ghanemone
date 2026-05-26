/**
 * AlertCard — kartu alert dengan severity icon, message, dan ack button.
 *
 * Severity → warna icon background + accent border:
 *   critical (red), warning (amber), info (blue).
 *
 * A11y:
 *   - Icon decorative (aria-hidden), severity dikomunikasikan via text label
 *     ("Kritis", "Peringatan", "Info") yang visually-hidden untuk SR.
 *   - Ack button menjadi aria-disabled saat sudah di-ack.
 */
import { Icon, type IconName } from '@ghanem/ui';
import type { Alert, AlertSeverity } from '../../mocks/monitoring';

interface SeverityConfig {
  label: string;
  icon: IconName;
  bg: string;
  fg: string;
  border: string;
}

const SEVERITY_CONFIG: Record<AlertSeverity, SeverityConfig> = {
  critical: {
    label: 'Kritis',
    icon: 'warn',
    bg: 'bg-red-100',
    fg: 'text-red-500',
    border: 'border-red-100',
  },
  warning: {
    label: 'Peringatan',
    icon: 'bell',
    bg: 'bg-amber-100',
    fg: 'text-amber-700',
    border: 'border-amber-100',
  },
  info: {
    label: 'Info',
    icon: 'check',
    bg: 'bg-blue-50',
    fg: 'text-blue-600',
    border: 'border-blue-100',
  },
};

function formatTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(1, Math.floor(ms / 1000))} dtk`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)} mnt`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)} jam`;
  return `${Math.floor(ms / 86_400_000)} hari`;
}

export interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onOpen?: (alert: Alert) => void;
}

export function AlertCard({ alert, onAcknowledge, onOpen }: AlertCardProps): JSX.Element {
  const cfg = SEVERITY_CONFIG[alert.severity];

  return (
    <article
      className={[
        'flex items-start gap-3 p-3 bg-surface border rounded-3',
        alert.acknowledged ? 'border-line opacity-70' : cfg.border,
        'transition-opacity duration-hf',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-flex items-center justify-center flex-none w-9 h-9 rounded-2',
          cfg.bg,
          cfg.fg,
        ].join(' ')}
      >
        <Icon name={cfg.icon} size={16} aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm text-ink m-0 leading-snug">
            <span className="sr-only">{cfg.label}: </span>
            {alert.title}
          </h3>
          <span className="num text-[11px] text-ink-4 flex-none">{formatTimeAgo(alert.createdAt)}</span>
        </div>
        <p className="text-xs text-ink-3 mt-0.5 m-0 line-clamp-2">{alert.message}</p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-[10.5px] text-ink-4 font-medium">{alert.source}</span>
          <div className="flex items-center gap-1.5">
            {onOpen ? (
              <button
                type="button"
                onClick={() => onOpen(alert)}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-1 text-[11px] font-semibold',
                  'text-blue-600 hover:bg-blue-50',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                Detail
                <Icon name="arrowR" size={10} aria-hidden />
              </button>
            ) : null}
            {!alert.acknowledged && onAcknowledge ? (
              <button
                type="button"
                onClick={() => onAcknowledge(alert.id)}
                aria-label={`Acknowledge ${alert.title}`}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-1 text-[11px] font-semibold',
                  'text-ink-2 border border-line bg-surface hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                ].join(' ')}
              >
                <Icon name="check" size={10} aria-hidden /> Ack
              </button>
            ) : alert.acknowledged ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] text-ink-4">
                <Icon name="check" size={10} aria-hidden /> Acked
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
