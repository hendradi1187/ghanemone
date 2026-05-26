/**
 * AppDetailDialog — modal detail app (overview + screenshots + permissions + reviews).
 *
 * Phase 8.13. Pakai @ghanem/ui Dialog + Tabs. Screenshots adalah colored
 * gradient blocks (Tailwind-friendly placeholder) — Phase 9 ganti dengan
 * real screenshot URLs dari CDN.
 *
 * A11y:
 *   - Dialog dari @ghanem/ui sudah a11y-correct (Radix focus trap, ESC, dst).
 *   - Tabs dari @ghanem/ui pakai WAI-ARIA tabs pattern.
 *   - Screenshot enlarge: dialog secondary (defer untuk Phase 9) — sekarang
 *     click hanya highlight border + caption tampil.
 */
import { useState } from 'react';
import { Button, Dialog, Icon, Tabs } from '@ghanem/ui';
import type { AppInstalled } from '../../api/apps';

const CATEGORY_LABEL: Record<AppInstalled['category'], string> = {
  visualization: 'Visualisasi',
  analysis: 'Analisis',
  integration: 'Integrasi',
  utility: 'Utilitas',
};

export interface AppDetailDialogProps {
  /** App yang ditampilkan. `null` → dialog closed. */
  app: AppInstalled | null;
  /** Handler close. */
  onClose: () => void;
  /** Toggle install handler. */
  onInstallToggle: (app: AppInstalled) => void;
  /** Loading state install mutation. */
  installPending: boolean;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function AppDetailDialog({
  app,
  onClose,
  onInstallToggle,
  installPending,
}: AppDetailDialogProps): JSX.Element {
  const [tab, setTab] = useState<'overview' | 'screenshots' | 'permissions' | 'reviews'>(
    'overview',
  );

  if (!app) {
    return (
      <Dialog.Root open={false} onOpenChange={() => onClose()}>
        <Dialog.Content size="lg" />
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root
      open={app !== null}
      onOpenChange={(open) => {
        if (!open) {
          setTab('overview');
          onClose();
        }
      }}
    >
      <Dialog.Content size="xl">
        <Dialog.Header>
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex-none inline-flex items-center justify-center w-14 h-14 rounded-2 text-white shadow-1"
              style={{
                background: `linear-gradient(135deg, ${app.gradient.from}, ${app.gradient.to})`,
              }}
            >
              <Icon name={app.iconName} size={28} aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title>{app.name}</Dialog.Title>
              <Dialog.Description>
                {app.vendor} · v{app.version} ·{' '}
                <span className="capitalize">{CATEGORY_LABEL[app.category]}</span>
              </Dialog.Description>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-4 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Icon name="star" size={11} className="text-amber-700" aria-hidden />
                  <span className="num font-semibold text-ink-2">{app.rating.toFixed(1)}</span>
                </span>
                <span aria-hidden>·</span>
                <span className="num">{app.downloads.toLocaleString('id-ID')} install</span>
                <span aria-hidden>·</span>
                <span>Diperbarui {fmtDate(app.lastUpdated)}</span>
                {app.installed ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-1 bg-green-50 text-green-700 text-[10.5px] font-semibold uppercase tracking-cap">
                    <Icon name="check" size={9} aria-hidden /> Installed
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex-none">
              <Button
                variant={app.installed ? 'secondary' : 'primary'}
                leftIcon={app.installed ? 'check' : 'download'}
                onClick={() => onInstallToggle(app)}
                loading={installPending}
              >
                {app.installed ? 'Uninstall' : 'Install'}
              </Button>
            </div>
          </div>
        </Dialog.Header>

        <div className="mt-4">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <Tabs.List aria-label="Detail app">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="screenshots">
                Screenshots{' '}
                <span className="text-ink-4 font-normal">({app.screenshots.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="permissions">
                Permissions{' '}
                <span className="text-ink-4 font-normal">({app.permissions.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="reviews">
                Reviews <span className="text-ink-4 font-normal">({app.reviews.length})</span>
              </Tabs.Trigger>
            </Tabs.List>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              <Tabs.Content value="overview">
                <OverviewTab app={app} />
              </Tabs.Content>
              <Tabs.Content value="screenshots">
                <ScreenshotsTab app={app} />
              </Tabs.Content>
              <Tabs.Content value="permissions">
                <PermissionsTab app={app} />
              </Tabs.Content>
              <Tabs.Content value="reviews">
                <ReviewsTab app={app} />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/* ─── Tabs ─────────────────────────────────────────────────────────────── */

function OverviewTab({ app }: { app: AppInstalled }): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-2 leading-relaxed m-0">{app.longDescription}</p>
      <section>
        <h3 className="text-cap text-ink-4 uppercase tracking-cap m-0 mb-2">Fitur utama</h3>
        <ul className="space-y-1.5">
          {app.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-ink-2">
              <Icon name="check" size={14} className="flex-none text-green-700 mt-0.5" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="text-cap text-ink-4 uppercase tracking-cap m-0 mb-2">Pricing</h3>
        <p className="text-sm text-ink-2 m-0">
          {app.pricing === 'free' ? (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-amber-100 text-amber-700 text-[10.5px] font-semibold uppercase tracking-cap mr-2">
                Free
              </span>
              Gratis untuk seluruh organisasi SPEKTRUM.
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-ink-3 text-[10.5px] font-semibold uppercase tracking-cap mr-2">
                Paid
              </span>
              Berbayar — hubungi vendor untuk lisensi enterprise.
            </>
          )}
        </p>
      </section>
    </div>
  );
}

function ScreenshotsTab({ app }: { app: AppInstalled }): JSX.Element {
  const [activeId, setActiveId] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {app.screenshots.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(isActive ? null : s.id)}
              aria-pressed={isActive}
              className={[
                'group relative flex flex-col gap-1.5 text-left',
                'rounded-3 overflow-hidden border-2 transition-colors duration-hf',
                isActive ? 'border-green-500' : 'border-line hover:border-green-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
              ].join(' ')}
            >
              <div
                aria-hidden="true"
                className={[
                  'w-full transition-all duration-hf',
                  isActive ? 'h-80' : 'h-40',
                ].join(' ')}
                style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
              />
              <p className="text-xs text-ink-3 px-3 pb-2">{s.caption}</p>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-ink-4">
        Klik thumbnail untuk perbesar (sementara). Lightbox final akan tersedia di Phase 9.
      </p>
    </div>
  );
}

function PermissionsTab({ app }: { app: AppInstalled }): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-3 m-0">
        Saat install, {app.name} akan diberikan akses berikut. Anda dapat mencabut akses
        kapan saja melalui menu Pengaturan.
      </p>
      <ul role="list" className="flex flex-col gap-2">
        {app.permissions.map((p) => (
          <li
            key={p}
            className="flex items-start gap-2 p-2.5 bg-surface-2 rounded-2 border border-line"
          >
            <Icon name="shield" size={14} className="flex-none text-blue-600 mt-0.5" aria-hidden />
            <code className="text-xs font-mono text-ink-2 break-all">{p}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewsTab({ app }: { app: AppInstalled }): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {app.reviews.map((r) => (
        <article
          key={r.id}
          className="p-3 bg-surface-2 rounded-2 border border-line"
          aria-labelledby={`review-${r.id}-author`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center w-7 h-7 rounded-pill bg-green-50 text-green-700 text-[10.5px] font-bold"
            >
              {r.authorInitials}
            </span>
            <div className="flex-1 min-w-0">
              <p id={`review-${r.id}-author`} className="text-xs font-semibold text-ink m-0">
                {r.authorName}
              </p>
              <p className="text-[11px] text-ink-4 m-0">
                {new Date(r.postedAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div
              className="flex items-center gap-0.5"
              role="img"
              aria-label={`Rating ${r.rating} dari 5`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={11}
                  className={i < r.rating ? 'text-amber-700' : 'text-ink-5'}
                  aria-hidden
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-ink-3 m-0">{r.comment}</p>
        </article>
      ))}
    </div>
  );
}
