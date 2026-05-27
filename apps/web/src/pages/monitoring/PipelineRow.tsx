/**
 * PipelineRow — row pipeline dengan status badge, progress bar, throughput.
 *
 * Pakai `<tr>` semantic (parent table). Highlight warna progress mengikuti
 * status: green=ok, blue=running, amber=warning/queued, red=failed,
 * grey=cancelled.
 */
import { Icon, StatusChip, type StatusChipStatus } from '@ghanem/ui';
import type { Pipeline, PipelineStatus } from '../../mocks/monitoring';

/** StatusChip status mapping — PipelineStatus → StatusChipStatus (direct pass-through, all match). */
const PIPELINE_TO_CHIP_STATUS: Record<PipelineStatus, StatusChipStatus> = {
  queued: 'queued',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
  cancelled: 'cancelled',
};

/** Bar color per pipeline status (still needed for progress bar). */
const STATUS_BAR: Record<PipelineStatus, string> = {
  queued: 'bg-ink-5',
  running: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-ink-5',
};

/** Label display per pipeline status. */
const STATUS_LABEL: Record<PipelineStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
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
  const chipStatus = PIPELINE_TO_CHIP_STATUS[pipeline.status];
  const barClass = STATUS_BAR[pipeline.status];
  const statusLabel = STATUS_LABEL[pipeline.status];
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
        <StatusChip status={chipStatus}>{statusLabel}</StatusChip>
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
              className={['h-full transition-all duration-500 ease-out', barClass].join(' ')}
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
