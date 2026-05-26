/**
 * ReviewSummary — Step 5: review-before-submit screen.
 *
 * Card grid:
 *   - Files (count + total size + list nama+size)
 *   - Metadata (name, description, category, license, provider, tags)
 *   - Bounding Box (4 angka + Indonesia inline check)
 *   - Validation (4 check status + ringkasan)
 *
 * Setiap card punya tombol "Edit" → goToStep(target).
 *
 * Submit:
 *   - Loading state ~3 detik (`submitDatasetMock` di-call dari `api/upload.ts`)
 *   - Sukses → toast + reset() + navigate('/explore')
 *   - Gagal → toast.error
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Icon, toast } from '@ghanem/ui';
import { useAuth } from '../../hooks/use-auth';
import { formatBytes, type UploadFormData } from '../../mocks/upload';
import { submitDataset } from '../../api/upload';
import {
  useUploadWizardStore,
  type ValidationCheckResult,
  type WizardMetadata,
} from '../../stores/upload-wizard';

const CATEGORY_LABELS: Record<string, string> = {
  seismic: 'Seismic',
  'well-log': 'Well Log',
  production: 'Production',
  concession: 'Concession / WK',
  geology: 'Geology',
  document: 'Document',
};

export function ReviewSummary(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const metadata = useUploadWizardStore((s) => s.metadata);
  const selectedFiles = useUploadWizardStore((s) => s.selectedFiles);
  const validationResults = useUploadWizardStore((s) => s.validationResults);
  const goToStep = useUploadWizardStore((s) => s.goToStep);
  const reset = useUploadWizardStore((s) => s.reset);

  const [submitting, setSubmitting] = useState(false);

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

  const handleSubmit = useCallback(async () => {
    if (!metadata.category || !metadata.license || !metadata.bbox) {
      toast.warning('Metadata belum lengkap', {
        description: 'Kembali ke step 2 untuk melengkapi.',
      });
      return;
    }
    setSubmitting(true);
    const payload: UploadFormData = {
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      provider: user?.organization ?? 'Unknown',
      license: metadata.license,
      tags: metadata.tags,
      bbox: metadata.bbox,
      files: selectedFiles.map((f) => ({ name: f.name, size: f.size })),
      attributes: [],
    };
    try {
      const result = await submitDataset(payload);
      toast.success('Dataset berhasil diunggah', {
        description: `ID: ${result.id}`,
      });
      reset();
      navigate('/explore');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah dataset';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [metadata, selectedFiles, user, reset, navigate]);

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="File"
          stepTarget={1}
          onEdit={() => goToStep(1)}
          icon="upload"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink-3 m-0">
              <span className="num font-semibold text-ink">{selectedFiles.length}</span>{' '}
              file ·{' '}
              <span className="num font-semibold text-ink">{formatBytes(totalSize)}</span> total
            </p>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {selectedFiles.map((f) => (
                <li
                  key={f.id}
                  className="flex items-baseline gap-2 text-xs text-ink-3 truncate"
                >
                  <Icon name="doc" size={11} aria-hidden className="text-ink-4 flex-none" />
                  <span className="font-mono truncate" title={f.name}>
                    {f.name}
                  </span>
                  <span className="num text-ink-4">{formatBytes(f.size)}</span>
                </li>
              ))}
              {selectedFiles.length === 0 ? (
                <li className="text-xs text-red-500">Tidak ada file.</li>
              ) : null}
            </ul>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Metadata"
          stepTarget={2}
          onEdit={() => goToStep(2)}
          icon="doc"
        >
          <MetadataSummary metadata={metadata} organization={user?.organization ?? '—'} />
        </SummaryCard>

        <SummaryCard
          title="Bounding Box"
          stepTarget={2}
          onEdit={() => goToStep(2)}
          icon="map"
        >
          <BboxSummary bbox={metadata.bbox} />
        </SummaryCard>

        <SummaryCard
          title="Validasi"
          stepTarget={4}
          onEdit={() => goToStep(4)}
          icon="shield"
        >
          <ValidationSummary validation={validationResults} />
        </SummaryCard>
      </div>

      <div className="flex justify-between gap-2 pt-2 flex-wrap items-center">
        <Button variant="secondary" onClick={() => goToStep(4)} leftIcon="chevL">
          Kembali
        </Button>
        <Button
          variant="primary"
          size="lg"
          leftIcon="upload"
          loading={submitting}
          onClick={() => void handleSubmit()}
        >
          Submit Dataset
        </Button>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

interface SummaryCardProps {
  title: string;
  stepTarget: number;
  onEdit: () => void;
  icon: 'upload' | 'doc' | 'map' | 'shield';
  children: React.ReactNode;
}

function SummaryCard({
  title,
  stepTarget,
  onEdit,
  icon,
  children,
}: SummaryCardProps): JSX.Element {
  return (
    <Card padding="4" elevation="1">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-8 h-8 rounded-2 bg-green-50 text-green-600 flex-none"
          >
            <Icon name={icon} size={14} aria-hidden />
          </span>
          <h3 className="font-display font-semibold text-h3 text-ink m-0">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}, kembali ke langkah ${stepTarget}`}
          className={[
            'inline-flex items-center gap-1 px-2 h-7 rounded-2',
            'text-xs font-medium text-green-700 hover:bg-green-50',
            'transition-colors duration-hf',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="settings" size={12} aria-hidden />
          Edit
        </button>
      </div>
      {children}
    </Card>
  );
}

function MetadataSummary({
  metadata,
  organization,
}: {
  metadata: WizardMetadata;
  organization: string;
}): JSX.Element {
  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: 'Nama', value: metadata.name || <Missing /> },
    { label: 'Provider', value: organization },
    {
      label: 'Kategori',
      value: metadata.category ? CATEGORY_LABELS[metadata.category] ?? metadata.category : <Missing />,
    },
    { label: 'Lisensi', value: metadata.license || <Missing /> },
    {
      label: 'Tags',
      value:
        metadata.tags.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {metadata.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center px-1.5 py-0.5 rounded-1 border border-blue-100 bg-blue-50 text-blue-600 text-[10.5px] font-semibold uppercase tracking-widest leading-none"
              >
                {t}
              </span>
            ))}
          </span>
        ) : (
          <span className="text-ink-4">—</span>
        ),
    },
  ];
  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm m-0">
      {rows.map((row) => (
        <Row key={row.label} label={row.label} value={row.value} />
      ))}
      {metadata.description ? (
        <Row label="Deskripsi" value={<p className="m-0 text-ink-3">{metadata.description}</p>} />
      ) : null}
    </dl>
  );
}

function BboxSummary({ bbox }: { bbox: WizardMetadata['bbox'] }): JSX.Element {
  if (!bbox) {
    return <p className="text-sm text-red-500 m-0">Bounding box belum diisi.</p>;
  }
  const [minLng, minLat, maxLng, maxLat] = bbox;
  // Indonesia approx: lng 95..141, lat -11..6
  const inIndonesia =
    minLng >= 94 && maxLng <= 142 && minLat >= -12 && maxLat <= 7;
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-2 gap-2 text-sm m-0">
        <Row label="minLng" value={<Num value={minLng} />} />
        <Row label="minLat" value={<Num value={minLat} />} />
        <Row label="maxLng" value={<Num value={maxLng} />} />
        <Row label="maxLat" value={<Num value={maxLat} />} />
      </dl>
      <p
        className={[
          'text-xs m-0',
          inIndonesia ? 'text-green-700' : 'text-amber-700',
        ].join(' ')}
      >
        {inIndonesia
          ? 'Cakupan berada di dalam wilayah Indonesia.'
          : 'Cakupan tampak di luar Indonesia — pastikan koordinat benar.'}
      </p>
    </div>
  );
}

function ValidationSummary({ validation }: { validation: ValidationCheckResult | null }): JSX.Element {
  if (!validation) {
    return <p className="text-sm text-amber-700 m-0">Validasi belum dijalankan.</p>;
  }
  const items: Array<{ label: string; severity: 'pass' | 'warning' | 'fail' }> = [
    { label: 'Topology', severity: validation.topology },
    { label: 'Schema', severity: validation.schema },
    { label: 'Attribute', severity: validation.attributes },
    { label: 'Integrity', severity: validation.integrity },
  ];
  return (
    <ul className="flex flex-col gap-1 list-none p-0 m-0">
      {items.map((it) => {
        const iconName = it.severity === 'pass' ? 'check' : it.severity === 'warning' ? 'warn' : 'x';
        const tone =
          it.severity === 'pass'
            ? 'text-green-700'
            : it.severity === 'warning'
              ? 'text-amber-700'
              : 'text-red-500';
        return (
          <li key={it.label} className="flex items-center gap-2 text-sm">
            <Icon name={iconName} size={12} aria-hidden className={tone} />
            <span className="text-ink">{it.label}</span>
            <span className={['text-xs', tone].join(' ')}>
              {it.severity === 'pass' ? 'Lulus' : it.severity === 'warning' ? 'Peringatan' : 'Gagal'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <>
      <dt className="text-ink-4 text-xs uppercase tracking-cap font-semibold pt-1">{label}</dt>
      <dd className="text-ink m-0">{value}</dd>
    </>
  );
}

function Missing(): JSX.Element {
  return <span className="text-red-500 italic">belum diisi</span>;
}

function Num({ value }: { value: number }): JSX.Element {
  return <span className="num font-mono">{value.toFixed(4)}</span>;
}
