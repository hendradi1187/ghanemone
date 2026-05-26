/**
 * PipelineRow — row pipeline dengan status badge, progress bar, throughput.
 *
 * Pakai `<tr>` semantic (parent table). Highlight warna progress mengikuti
 * status: green=ok, blue=running, amber=warning/queued, red=failed,
 * grey=cancelled.
 */
import { Icon } from '@ghanem/ui';
import type { Pipeline, PipelineStatus } from '../../mocks/monitoring';

interface StatusConfig {
  label: string;
  pillClass: string;
  barClass: string;
  textClass: string;
  dot: string;
}

const STATUS_CONFIG: Record<PipelineStatus, StatusConfig> = {
  queued: {
    label: 'Queued',
    pillClass: 'bg-surface-3 text-ink-3 border-line',
    barClass: 'bg-ink-5',
    textClass: 'text-ink-4',
    dot: 'bg-ink-4',
  },
  running: {
    label: 'Running',
    pillClass: 'bg-blue-50 text-blue-600 border-blue-100',
    barClass: 'bg-blue-500',
    textClass: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    pillClass: 'bg-green-50 text-green-700 border-green-200',
    barClass: 'bg-green-500',
    textClass: 'text-green-700',
    dot: 'bg-green-500',
  },
  failed: {
    label: 'Failed',
    pillClass: 'bg-red-100 text-red-500 border-red-100',
    barClass: 'bg-red-500',
    textClass: 'text-red-500',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    pillClass: 'bg-surface-3 text-ink-4 border-line',
    barClass: 'bg-ink-5',
    textClass: 'text-ink-4',
    dot: 'bg-ink-4',
  },
};

function formatDuration(sec: number): string {
  if (sec <= 0) return '—';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}

export interface PipelineRowProps {
  pipeline: Pipeline;
  onClick?: (id: string) => void;
}

export function PipelineRow({ pipeline, onClick }: PipelineRowProps): JSX.Element {
  const cfg = STATUS_CONFIG[pipeline.status];
  const isRunning = pipeline.status === 'running';

  return (
    <tr
      className={[
        'border-b border-line last:border-b-0',
        onClick ? 'cursor-pointer hover:bg-surface-2' : '',
      ].join(' ')}
      onClick={onClick ? () => onClick(pipeline.id) : undefined}
    >
      <td className="px-3 py-3 align-top">
        <div className="font-semibold text-sm text-ink leading-snug">{pipeline.name}</div>
        <div className="text-[11px] text-ink-4 mt-0.5">{pipeline.provider}</div>
      </td>
      <td className="px-3 py-3 align-top">
        <span
          className={[
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill border',
            'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
            cfg.pillClass,
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className={['inline-block w-1.5 h-1.5 rounded-full', cfg.dot].join(' ')}
          />
          {cfg.label}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <span className="num font-mono text-xs text-ink-2">
          Step {pipeline.stepCurrent}/{pipeline.stepTotal}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <span className="num font-mono text-xs text-ink-3">{formatDuration(pipeline.durationSec)}</span>
      </td>
      <td className="px-3 py-3 align-top w-44">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 h-1.5 bg-surface-3 rounded-pill overflow-hidden"
            role="progressbar"
            aria-valuenow={pipeline.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress ${pipeline.name}`}
          >
            <div
              className={['h-full transition-all duration-500 ease-out', cfg.barClass].join(' ')}
              style={{ width: `${pipeline.progress}%` }}
            />
          </div>
          <span className="num text-xs text-ink-3 w-9 text-right">{pipeline.progress}%</span>
        </div>
        {isRunning ? (
          <div className="text-[10.5px] text-ink-4 mt-1">
            <span className="num font-mono">{pipeline.throughput.toLocaleString('id-ID')}</span> rec/s
          </div>
        ) : null}
        {pipeline.status === 'failed' && pipeline.errorMessage ? (
          <div className="text-[10.5px] text-red-500 mt-1 flex items-start gap-1">
            <Icon name="warn" size={10} aria-hidden />
            <span className="line-clamp-2">{pipeline.errorMessage}</span>
          </div>
        ) : null}
      </td>
    </tr>
  );
}
