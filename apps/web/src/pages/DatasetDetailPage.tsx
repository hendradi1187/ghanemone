/**
 * DatasetDetailPage — `/datasets/:id` route.
 *
 * Port dari `PageDetail` di `prototype-app.jsx:658-854` + `HfDetail` di
 * `hifi-pages.jsx:224-441`. Re-imagined sebagai full page (bukan side-panel
 * di atas Map) supaya cocok dengan content-rich tabs (Lineage, API, Files).
 *
 * Tab state via URL search param `?tab=overview` (shareable, history-friendly,
 * pola reuse Phase 8.7 ExplorePage).
 *
 * Layout:
 *   - Header: back link, title, badges, action buttons (Download / Request Access / Share / Star)
 *   - Tabs: Overview / Attributes / Lineage / API / Files / Map
 *   - Right rail: "Tentang dataset ini" + "Dataset terkait"
 *
 * A11y:
 *   - Tabs WAI-ARIA via @ghanem/ui Tabs (arrow-key nav, automatic activation)
 *   - Skeleton loading dengan `role="status"` + `aria-live="polite"`
 *   - Error 404 → EmptyState (role="alert") + back link
 *   - Semua action button punya `aria-label` deskriptif untuk icon-only buttons
 */
import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AttributeTable,
  CodeBlock,
  EmptyState,
  Icon,
  StatCard,
  Stack,
  StatusChip,
  Tabs,
  toast,
} from '@ghanem/ui';
import { getDatasetById, getRelatedDatasets } from '../api/datasets';
import type { DatasetRecord } from '../mocks/datasets';
import { LineageGraph } from './dataset-detail/LineageGraph';
import { BboxPreview } from './dataset-detail/BboxPreview';
import { ApiSnippets } from './dataset-detail/ApiSnippets';
import { DataQualitySection } from '../components/dataset/DataQualitySection';

type DetailTab = 'overview' | 'attributes' | 'lineage' | 'api' | 'files' | 'map';

const VALID_TABS: readonly DetailTab[] = [
  'overview',
  'attributes',
  'lineage',
  'api',
  'files',
  'map',
];

function parseTab(raw: string | null): DetailTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) return raw as DetailTab;
  return 'overview';
}

export function DatasetDetailPage(): JSX.Element {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = parseTab(searchParams.get('tab'));

  const handleTabChange = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === 'overview') params.delete('tab');
          else params.set('tab', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['dataset', id],
    queryFn: () => getDatasetById(id),
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ['dataset-related', id],
    queryFn: () => getRelatedDatasets(id, 4),
    enabled: !!id && !!data,
  });

  /* ── Loading state ────────────────────────────────────────────────── */
  if (isFetching && !data) {
    return <DetailSkeleton />;
  }

  /* ── Error / not-found state ──────────────────────────────────────── */
  if (isError || (!isFetching && !data)) {
    return (
      <div className="px-6 py-10 max-w-3xl mx-auto">
        <Link
          to="/explore"
          className={[
            'inline-flex items-center gap-1 text-sm font-semibold text-green-700 mb-4',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1 py-0.5',
          ].join(' ')}
        >
          <Icon name="chevL" size={12} aria-hidden /> Kembali ke Explore
        </Link>
        <EmptyState
          variant="error"
          title={isError ? 'Gagal memuat dataset' : 'Dataset tidak ditemukan'}
          description={
            isError
              ? 'Terjadi kesalahan saat mengambil detail. Coba lagi atau periksa koneksi Anda.'
              : `Dataset dengan ID "${id}" tidak tersedia atau telah dihapus.`
          }
          action={
            isError
              ? { label: 'Coba lagi', onClick: () => void refetch(), icon: 'refresh' }
              : { label: 'Kembali ke Explore', onClick: () => navigate('/explore'), icon: 'chevL' }
          }
        />
      </div>
    );
  }

  // From here `data` is defined.
  const dataset = data as DatasetRecord;

  return <DetailContent dataset={dataset} related={related} tab={tab} onTabChange={handleTabChange} />;
}

/* ─── Detail content (split out untuk readability) ────────────────────── */

interface DetailContentProps {
  dataset: DatasetRecord;
  related: DatasetRecord[];
  tab: DetailTab;
  onTabChange: (next: string) => void;
}

function DetailContent({ dataset, related, tab, onTabChange }: DetailContentProps): JSX.Element {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [addedToMap, setAddedToMap] = useState(false);

  const isInternal = dataset.status === 'internal' || dataset.status === 'confidential';

  const handleDownload = useCallback(() => {
    toast.success('Permintaan unduh terkirim', {
      description: `${dataset.title} — signed URL akan dikirim ke email Anda.`,
    });
  }, [dataset.title]);

  const handleRequestAccess = useCallback(() => {
    toast.info('Akses diminta', {
      description: 'Tim SKK Migas akan memverifikasi dalam 1-2 hari kerja.',
    });
  }, []);

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success('Tautan tersalin', { description: 'URL detail dataset disalin ke clipboard.' });
    }
  }, []);

  const handleBookmark = useCallback(() => {
    setBookmarked((prev) => !prev);
    toast.info(bookmarked ? 'Bookmark dihapus' : 'Bookmark ditambahkan', {
      description: dataset.title,
    });
  }, [bookmarked, dataset.title]);

  const handleAddToMap = useCallback(() => {
    setAddedToMap(true);
    toast.success('Ditambahkan ke peta', {
      description: `${dataset.title} — buka Map View untuk melihat.`,
    });
  }, [dataset.title]);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      {/* ── Back link / breadcrumb ────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="px-6 pt-4 pb-2 bg-surface border-b border-line flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={[
            'inline-flex items-center gap-1 text-sm font-semibold text-green-700',
            'hover:text-green-500',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-1 py-0.5',
          ].join(' ')}
        >
          <Icon name="chevL" size={12} aria-hidden />
          Kembali ke Explore
        </button>
        <span className="text-ink-5 text-xs" aria-hidden>
          /
        </span>
        <span className="text-xs text-ink-4 truncate">
          {dataset.category} · {dataset.provider.name}
        </span>
      </nav>

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="px-6 py-5 bg-surface border-b border-line">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span
                aria-hidden="true"
                className={[
                  'inline-flex items-center px-1.5 py-0.5 rounded-1',
                  'text-[10px] font-bold uppercase tracking-widest leading-none',
                  dataset.kind === 'LAYER'
                    ? 'bg-green-500 text-white'
                    : dataset.kind === 'VOLUME'
                      ? 'bg-purple-500 text-white'
                      : 'bg-blue-500 text-white',
                ].join(' ')}
              >
                {dataset.kind}
              </span>
              {dataset.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700">
                  <Icon name="check" size={11} aria-hidden />
                  Verified
                </span>
              ) : null}
              {dataset.status ? (
                <StatusChip status={dataset.status}>{dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}</StatusChip>
              ) : null}
              {dataset.year !== undefined ? (
                <span className="text-[11px] text-ink-4 font-medium num">{dataset.year}</span>
              ) : null}
            </div>
            <h1 className="font-display font-bold text-h1 text-ink m-0 mb-2 leading-tight">
              {dataset.title}
            </h1>
            <p className="text-sm text-ink-3 m-0 mb-3 max-w-3xl">{dataset.description}</p>
            <div className="flex items-center gap-3 text-xs text-ink-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-bold leading-none"
                  style={{
                    borderColor: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
                    color: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
                  }}
                >
                  {dataset.provider.initials}
                </span>
                <b className="text-ink-2">{dataset.provider.name}</b>
              </span>
              {dataset.category ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{dataset.category}</span>
                </>
              ) : null}
              {dataset.updatedLabel ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="clock" size={11} aria-hidden /> diperbarui {dataset.updatedLabel}
                  </span>
                </>
              ) : null}
              <>
                <span aria-hidden>·</span>
                <span>Lisensi {dataset.metadata.license}</span>
              </>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownload}
              className={[
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-2',
                'bg-green-500 text-white font-semibold text-sm shadow-1',
                'hover:bg-green-600',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                'transition-colors duration-hf',
              ].join(' ')}
            >
              <Icon name="download" size={13} aria-hidden /> Unduh
            </button>
            <button
              type="button"
              onClick={handleAddToMap}
              aria-pressed={addedToMap}
              className={[
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-2',
                addedToMap
                  ? 'bg-green-100 text-green-700 border border-green-300 font-semibold text-sm'
                  : 'bg-surface border border-line text-ink-2 font-semibold text-sm',
                'hover:bg-green-50 hover:border-green-300 hover:text-green-700',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                'transition-colors duration-hf',
              ].join(' ')}
            >
              <Icon name="pin" size={13} aria-hidden />
              {addedToMap ? 'Di Peta' : 'Add to Map'}
            </button>
            {isInternal ? (
              <button
                type="button"
                onClick={handleRequestAccess}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-2 rounded-2 border border-line bg-surface',
                  'text-ink-2 font-semibold text-sm',
                  'hover:bg-surface-2',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
                  'transition-colors duration-hf',
                ].join(' ')}
              >
                <Icon name="shield" size={13} aria-hidden /> Minta Akses
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Bagikan dataset (salin tautan)"
              title="Bagikan dataset"
              className={iconBtnClasses}
            >
              <Icon name="share" size={13} aria-hidden />
            </button>
            <button
              type="button"
              onClick={handleBookmark}
              aria-label={bookmarked ? 'Hapus bookmark' : 'Tambahkan bookmark'}
              aria-pressed={bookmarked}
              title={bookmarked ? 'Hapus bookmark' : 'Bookmark'}
              className={[
                iconBtnClasses,
                bookmarked ? 'text-amber-700 border-amber-100 bg-amber-100' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon name="star" size={13} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content (2-col: tabs + right rail) ───────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0">
        <main className="px-6 py-5 min-w-0">
          <Tabs.Root value={tab} onValueChange={onTabChange}>
            <Tabs.List aria-label="Tab detail dataset" className="overflow-x-auto">
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="attributes">
                Atribut{' '}
                <span className="text-ink-4 font-normal">({dataset.attributes.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="lineage">Lineage</Tabs.Trigger>
              <Tabs.Trigger value="api">API</Tabs.Trigger>
              <Tabs.Trigger value="files">
                Files <span className="text-ink-4 font-normal">({dataset.files.length})</span>
              </Tabs.Trigger>
              <Tabs.Trigger value="map">Map</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview" className="py-5">
              <OverviewTab dataset={dataset} />
            </Tabs.Content>
            <Tabs.Content value="attributes" className="py-5">
              <AttributeTable attributes={dataset.attributes} />
            </Tabs.Content>
            <Tabs.Content value="lineage" className="py-5">
              <LineageTab dataset={dataset} />
            </Tabs.Content>
            <Tabs.Content value="api" className="py-5">
              <ApiSnippets datasetId={dataset.id} />
            </Tabs.Content>
            <Tabs.Content value="files" className="py-5">
              <FilesTab dataset={dataset} />
            </Tabs.Content>
            <Tabs.Content value="map" className="py-5">
              <BboxPreview bbox={dataset.metadata.bbox} datasetId={dataset.id} />
            </Tabs.Content>
          </Tabs.Root>
        </main>

        {/* Right rail */}
        <aside className="border-t xl:border-t-0 xl:border-l border-line bg-surface-2 p-5 flex flex-col gap-4">
          <AboutCard dataset={dataset} />
          <RelatedCard related={related} />
        </aside>
      </div>
    </div>
  );
}

const iconBtnClasses = [
  'inline-flex items-center justify-center w-9 h-9 rounded-2 border border-line bg-surface',
  'text-ink-3',
  'hover:bg-surface-2 hover:text-ink',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
  'transition-colors duration-hf',
].join(' ');

/* ─── Tab: Overview ───────────────────────────────────────────────────── */

function OverviewTab({ dataset }: { dataset: DatasetRecord }): JSX.Element {
  const { metadata, usage_stats: usage, tags } = dataset;
  return (
    <Stack direction="col" gap="5">
      {/* Data Quality */}
      <section
        aria-labelledby="overview-dq"
        className="bg-surface border border-line rounded-3 p-4"
      >
        <DataQualitySection dataQuality={dataset.dataQuality} variant="full" />
      </section>

      {/* Stats */}
      <section aria-labelledby="overview-usage">
        <h2 id="overview-usage" className="font-display font-semibold text-h3 text-ink m-0 mb-3">
          Statistik 30 hari
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <StatCard
            label="Unduhan"
            value={usage.downloads_30d}
            icon="download"
            tone="green"
          />
          <StatCard label="API calls" value={usage.api_calls_30d} icon="bolt" tone="blue" />
          <StatCard label="Pengguna unik" value={usage.unique_users_30d} icon="user" tone="amber" />
        </div>
      </section>

      {/* Tags */}
      <section aria-labelledby="overview-tags">
        <h2 id="overview-tags" className="font-display font-semibold text-h3 text-ink m-0 mb-2">
          Tag
        </h2>
        <ul aria-label="Daftar tag" className="flex items-center gap-2 flex-wrap m-0 p-0 list-none">
          {tags.map((t) => (
            <li key={t}>
              <span className="inline-flex items-center px-2 py-0.5 rounded-1 bg-surface-3 border border-line text-[11px] font-medium text-ink-3">
                #{t}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Key metadata */}
      <section aria-labelledby="overview-meta">
        <h2 id="overview-meta" className="font-display font-semibold text-h3 text-ink m-0 mb-2">
          Metadata teknis
        </h2>
        <dl className="grid gap-x-6 gap-y-2 grid-cols-1 sm:grid-cols-2 bg-surface border border-line rounded-3 p-4">
          <MetaRow label="CRS" value={metadata.crs} mono />
          <MetaRow
            label="Jumlah record"
            value={metadata.record_count.toLocaleString('id-ID')}
            mono
          />
          <MetaRow label="Format" value={metadata.file_format.join(', ')} />
          <MetaRow
            label="Bbox (lon, lat)"
            value={`${metadata.bbox[0]}, ${metadata.bbox[1]} → ${metadata.bbox[2]}, ${metadata.bbox[3]}`}
            mono
          />
          <MetaRow label="Lisensi" value={metadata.license} />
          <MetaRow
            label="Dibuat"
            value={new Date(metadata.created_at).toLocaleDateString('id-ID', {
              dateStyle: 'medium',
            })}
            mono
          />
          <MetaRow
            label="Terakhir diperbarui"
            value={new Date(metadata.last_updated).toLocaleDateString('id-ID', {
              dateStyle: 'medium',
            })}
            mono
          />
          <MetaRow label="Ukuran agregat" value={`${dataset.sizeMb.toLocaleString('id-ID')} MB`} mono />
        </dl>
      </section>
    </Stack>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function MetaRow({ label, value, mono = false }: MetaRowProps): JSX.Element {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <dt className="text-xs text-ink-4 font-medium uppercase tracking-cap flex-none w-32">{label}</dt>
      <dd className={['text-sm text-ink-2 truncate m-0', mono ? 'font-mono' : ''].join(' ')}>
        {value}
      </dd>
    </div>
  );
}

/* ─── Tab: Lineage ────────────────────────────────────────────────────── */

function LineageTab({ dataset }: { dataset: DatasetRecord }): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-3 max-w-3xl m-0">
        Diagram lineage menunjukkan asal-usul data ({dataset.lineage.upstream.length} sumber) dan
        turunan yang menggunakan dataset ini ({dataset.lineage.downstream.length} produk). Klik
        node untuk navigasi (akan aktif di Phase 8.10).
      </p>
      <LineageGraph
        lineage={dataset.lineage}
        currentName={dataset.title}
        currentId={dataset.id}
      />
    </div>
  );
}

/* ─── Tab: Files ──────────────────────────────────────────────────────── */

function FilesTab({ dataset }: { dataset: DatasetRecord }): JSX.Element {
  const totalBytes = useMemo(
    () => dataset.files.reduce((sum, f) => sum + f.size_bytes, 0),
    [dataset.files],
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="text-sm text-ink-3 m-0">
          <span className="num font-semibold text-ink">{dataset.files.length}</span> file ·{' '}
          <span className="num font-semibold text-ink">{formatBytes(totalBytes)}</span> total
        </p>
        <button
          type="button"
          onClick={() => toast.info('Unduh semua file', { description: 'ZIP archive akan dibuat.' })}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2 border border-line bg-surface',
            'text-sm font-semibold text-ink-2',
            'hover:bg-surface-2',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="download" size={12} aria-hidden /> Unduh semua (ZIP)
        </button>
      </div>
      <div className="border border-line rounded-3 bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr className="border-b border-line text-left">
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Nama file
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Format
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Ukuran
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3">
                Diperbarui
              </th>
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-cap font-semibold text-ink-3 text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {dataset.files.map((f) => (
              <tr key={f.name} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                <td className="px-3 py-2 font-mono text-xs text-ink truncate max-w-[20rem]">{f.name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-1 bg-surface-3 text-[10.5px] font-semibold uppercase tracking-widest leading-none text-ink-3 border border-line">
                    {f.format}
                  </span>
                </td>
                <td className="px-3 py-2 num text-ink-2">{formatBytes(f.size_bytes)}</td>
                <td className="px-3 py-2 text-ink-3 text-xs">
                  {new Date(f.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      toast.success('Unduh file', { description: f.name })
                    }
                    aria-label={`Unduh ${f.name}`}
                    className={[
                      'inline-flex items-center justify-center w-7 h-7 rounded-1 border border-line bg-surface text-ink-3',
                      'hover:bg-surface-2 hover:text-ink',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
                    ].join(' ')}
                  >
                    <Icon name="download" size={12} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/* ─── Right rail cards ────────────────────────────────────────────────── */

function AboutCard({ dataset }: { dataset: DatasetRecord }): JSX.Element {
  const citation = `${dataset.provider.name} (${dataset.year ?? '—'}). ${dataset.title}. SPEKTRUM Ghanem.one. ${dataset.metadata.license}.`;
  return (
    <section
      aria-labelledby="about-heading"
      className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-3"
    >
      <h2 id="about-heading" className="font-display font-semibold text-h3 text-ink m-0">
        Tentang dataset ini
      </h2>
      <dl className="flex flex-col gap-2 text-sm">
        <div>
          <dt className="text-xs text-ink-4 uppercase tracking-cap font-medium">Pengelola</dt>
          <dd className="text-ink-2 m-0">
            <b>{dataset.contact.name}</b>
            <br />
            <span className="text-ink-4 text-xs">{dataset.contact.organization}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-4 uppercase tracking-cap font-medium">Email kontak</dt>
          <dd className="m-0">
            <a
              href={`mailto:${dataset.contact.email}`}
              className="text-sm text-green-700 font-mono hover:text-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1"
            >
              {dataset.contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-4 uppercase tracking-cap font-medium">Lisensi</dt>
          <dd className="text-ink-2 m-0">{dataset.metadata.license}</dd>
        </div>
      </dl>
      <div className="border-t border-line pt-3">
        <p className="text-xs text-ink-4 uppercase tracking-cap font-medium mb-1.5">Sitasi</p>
        <CodeBlock language="plain" code={citation} wrap />
      </div>
    </section>
  );
}

function RelatedCard({ related }: { related: DatasetRecord[] }): JSX.Element {
  if (related.length === 0) {
    return (
      <section
        aria-labelledby="related-heading"
        className="bg-surface border border-line rounded-3 p-4"
      >
        <h2 id="related-heading" className="font-display font-semibold text-h3 text-ink m-0 mb-2">
          Dataset terkait
        </h2>
        <p className="text-sm text-ink-4 m-0">Belum ada dataset terkait.</p>
      </section>
    );
  }
  return (
    <section
      aria-labelledby="related-heading"
      className="bg-surface border border-line rounded-3 p-4 flex flex-col gap-2"
    >
      <h2 id="related-heading" className="font-display font-semibold text-h3 text-ink m-0">
        Dataset terkait
      </h2>
      <div className="flex flex-col gap-2">
        {related.map((d) => (
          <RelatedDatasetRow key={d.id} dataset={d} />
        ))}
      </div>
    </section>
  );
}

function RelatedDatasetRow({ dataset }: { dataset: DatasetRecord }): JSX.Element {
  return (
    <Link
      to={`/datasets/${dataset.id}`}
      className={[
        'flex flex-col gap-1 p-2 -mx-2 rounded-2',
        'hover:bg-surface-2',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-[9px] font-bold leading-none flex-none"
          style={{
            borderColor: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
            color: dataset.provider.color ?? 'var(--hf-green-500, #1f8a4a)',
          }}
        >
          {dataset.provider.initials}
        </span>
        <span className="text-xs text-ink-4 truncate">{dataset.provider.name}</span>
      </div>
      <p className="text-sm text-ink font-semibold m-0 line-clamp-2 leading-snug">{dataset.title}</p>
    </Link>
  );
}

/* ─── Skeleton untuk loading state ────────────────────────────────────── */

function DetailSkeleton(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Memuat detail dataset"
      className="flex flex-col h-full min-h-0 overflow-y-auto"
    >
      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-2 bg-surface border-b border-line">
        <div className="h-4 w-48 bg-surface-3 rounded-1 animate-pulse" aria-hidden />
      </div>
      {/* Header */}
      <div className="px-6 py-5 bg-surface border-b border-line flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-12 bg-surface-3 rounded-1 animate-pulse" aria-hidden />
          <div className="h-5 w-16 bg-surface-3 rounded-1 animate-pulse" aria-hidden />
          <div className="h-5 w-12 bg-surface-3 rounded-1 animate-pulse" aria-hidden />
        </div>
        <div className="h-8 w-3/4 max-w-2xl bg-surface-3 rounded-2 animate-pulse" aria-hidden />
        <div className="h-4 w-1/2 max-w-xl bg-surface-3 rounded-1 animate-pulse" aria-hidden />
      </div>
      {/* Content */}
      <div className="px-6 py-5 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-3">
          <div className="h-9 w-72 bg-surface-3 rounded-2 animate-pulse" aria-hidden />
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-surface-3 rounded-3 animate-pulse" aria-hidden />
            ))}
          </div>
          <div className="h-40 bg-surface-3 rounded-3 animate-pulse" aria-hidden />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-48 bg-surface-3 rounded-3 animate-pulse" aria-hidden />
          <div className="h-32 bg-surface-3 rounded-3 animate-pulse" aria-hidden />
        </div>
      </div>
      <span className="sr-only">Memuat detail dataset…</span>
    </div>
  );
}

export default DatasetDetailPage;
