// AlasBuana Prototype — Loading skeletons + reusable empty states
// Shared across pages for consistent UX patterns.

// ─────────────────────────────────────────────────────────────
// Skeleton — animated shimmer placeholder
// ─────────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 12, radius = 4, style }) {
  return (
    <div className="skeleton" aria-hidden="true"
      style={{ width, height, borderRadius: radius, ...style }}></div>
  );
}

// Dataset card skeleton — matches DsRowInteractive shape
function DatasetCardSkeleton() {
  return (
    <div className="ds-card" aria-busy="true" aria-live="polite"
      style={{ margin: '0 -8px', padding: '14px 8px', borderBottom: '1px solid var(--hf-line)' }}>
      <Skeleton width={96} height={84} radius={6} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Skeleton width="70%" height={16} />
          <Skeleton width={60} height={18} radius={9} />
        </div>
        <Skeleton width="50%" height={11} />
        <Skeleton width="90%" height={11} />
        <Skeleton width="80%" height={11} />
        <div style={{ display: 'flex', gap: 14, marginTop: 6, paddingTop: 8, borderTop: '1px dashed var(--hf-line)' }}>
          <Skeleton width={80} height={14} />
          <Skeleton width={40} height={14} />
          <Skeleton width={40} height={14} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <Skeleton width={28} height={28} radius={6} />
            <Skeleton width={68} height={28} radius={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail page skeleton
function DetailPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <Skeleton width={44} height={18} radius={9} />
        <Skeleton width={56} height={18} radius={9} />
        <Skeleton width={88} height={18} radius={9} />
      </div>
      <Skeleton width="80%" height={28} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="60%" height={14} />
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <Skeleton width="33%" height={36} radius={6} />
        <Skeleton width="33%" height={36} radius={6} />
        <Skeleton width={80} height={36} radius={6} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EmptyState — reusable empty/error UI
// ─────────────────────────────────────────────────────────────
function EmptyState({ icon = 'search', title, description, action, secondaryAction, tone = 'default' }) {
  const tones = {
    default: { bg: 'var(--hf-surface)', iconBg: 'var(--hf-surface-3)', iconColor: 'var(--hf-ink-4)' },
    error:   { bg: 'var(--hf-red-100)',  iconBg: 'var(--hf-red-100)',   iconColor: 'var(--hf-red-700)' },
    success: { bg: 'var(--hf-green-50)', iconBg: 'var(--hf-green-100)', iconColor: 'var(--hf-green-700)' },
  };
  const t = tones[tone] || tones.default;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'}
      style={{
        padding: 28, textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        maxWidth: 380, margin: '0 auto'
      }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: t.iconBg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4
      }}>
        <Icon name={icon} size={26} color={t.iconColor} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      {description && (
        <div className="sm" style={{ maxWidth: 320, lineHeight: 1.5 }}>{description}</div>
      )}
      {(action || secondaryAction) && (
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          {secondaryAction && (
            <button className="btn sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button className="btn primary sm" onClick={action.onClick}>
              {action.icon && <Icon name={action.icon} size={12} color="#fff" />}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Error boundary for AI Assistant + other async features
function ErrorState({ message, onRetry }) {
  return (
    <EmptyState tone="error" icon="warn"
      title="Terjadi kesalahan"
      description={message || 'Tidak dapat memuat data. Periksa koneksi Anda atau coba lagi.'}
      action={onRetry ? { label: 'Coba lagi', icon: 'refresh', onClick: onRetry } : null} />
  );
}

Object.assign(window, { Skeleton, DatasetCardSkeleton, DetailPageSkeleton, EmptyState, ErrorState });
