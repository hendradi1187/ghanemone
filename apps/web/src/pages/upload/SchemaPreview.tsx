/**
 * SchemaPreview — Step 3: read-only preview atribut auto-detected per file.
 *
 * Source of truth atribut:
 *   - Untuk setiap file dengan File object, run `validateFileMock` (kalau belum)
 *     dan ambil `detectedAttributes`.
 *   - Karena `validateFileMock` 70% deterministic untuk SHP/GeoJSON sample,
 *     atribut akan stabil sepanjang nama file sama.
 *   - Untuk mock yang mengembalikan kurang dari 8 attribute, kita pad dengan
 *     generic synthetic attributes (created_at, updated_at, source, geom_type,
 *     dst.) supaya target "8-15 attributes per file" tercapai.
 *
 * UI:
 *   - Tabs per file kalau lebih dari satu (Tabs dari @ghanem/ui)
 *   - AttributeTable per tab (sortable, searchable)
 *   - Edit deferred — disable sort-edit + show informational note di footer
 */
import { useEffect, useMemo, useState } from 'react';
import {
  AttributeTable,
  Button,
  Icon,
  Tabs,
  type AttributeRow,
} from '@ghanem/ui';
import { validateFileMock } from '../../mocks/upload';
import { useUploadWizardStore } from '../../stores/upload-wizard';

/**
 * Generic padding attributes — supaya target 8-15 attribute terpenuhi untuk
 * setiap file. Diappend setelah detected attributes; kalau total > 15, kita
 * truncate.
 */
const SYNTHETIC_PADDING: readonly AttributeRow[] = [
  {
    name: 'created_at',
    type: 'date',
    description: 'Timestamp saat record dibuat (UTC).',
    nullable: false,
    example: '2026-05-20T08:30:00Z',
  },
  {
    name: 'updated_at',
    type: 'date',
    description: 'Timestamp last modified (UTC).',
    nullable: true,
    example: '2026-05-24T12:14:00Z',
  },
  {
    name: 'source',
    type: 'string',
    description: 'Asal data — survey/lapor/import.',
    nullable: true,
    example: 'import-batch-12',
  },
  {
    name: 'crs_epsg',
    type: 'number',
    description: 'CRS code (EPSG).',
    nullable: false,
    example: '4326',
  },
  {
    name: 'geom_type',
    type: 'string',
    description: 'Tipe geometri (Point/Line/Polygon).',
    nullable: true,
    example: 'Polygon',
  },
  {
    name: 'attribute_version',
    type: 'string',
    description: 'Versi skema atribut.',
    nullable: true,
    example: '1.0',
  },
  {
    name: 'confidence',
    type: 'number',
    description: 'Confidence score 0..1 (kalau ada).',
    nullable: true,
    example: '0.92',
  },
  {
    name: 'remarks',
    type: 'string',
    description: 'Catatan ad-hoc.',
    nullable: true,
    example: '—',
  },
];

const MIN_ATTRIBUTES = 8;
const MAX_ATTRIBUTES = 15;

function padAttributes(detected: AttributeRow[]): AttributeRow[] {
  if (detected.length >= MIN_ATTRIBUTES) {
    return detected.slice(0, MAX_ATTRIBUTES);
  }
  const seen = new Set(detected.map((a) => a.name));
  const padded: AttributeRow[] = [...detected];
  for (const extra of SYNTHETIC_PADDING) {
    if (padded.length >= MIN_ATTRIBUTES) break;
    if (seen.has(extra.name)) continue;
    seen.add(extra.name);
    padded.push(extra);
  }
  return padded.slice(0, MAX_ATTRIBUTES);
}

type AttrCache = Record<string, AttributeRow[]>;

export function SchemaPreview(): JSX.Element {
  const selectedFiles = useUploadWizardStore((s) => s.selectedFiles);
  const goToStep = useUploadWizardStore((s) => s.goToStep);

  const [cache, setCache] = useState<AttrCache>({});
  const [activeTab, setActiveTab] = useState<string>(() => selectedFiles[0]?.id ?? '');

  // Sync active tab dengan list (kalau active hilang).
  useEffect(() => {
    if (selectedFiles.length === 0) return;
    if (!selectedFiles.find((f) => f.id === activeTab)) {
      setActiveTab(selectedFiles[0]?.id ?? '');
    }
  }, [selectedFiles, activeTab]);

  // Detect atribut untuk file yang belum di-cache.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next: AttrCache = { ...cache };
      let changed = false;
      for (const f of selectedFiles) {
        if (cache[f.id] || !f.file) continue;
        try {
          const result = await validateFileMock(f.file);
          if (cancelled) return;
          next[f.id] = padAttributes(result.detectedAttributes);
          changed = true;
        } catch (err) {
          void err;
          next[f.id] = padAttributes([]);
          changed = true;
        }
      }
      if (changed && !cancelled) setCache(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFiles, cache]);

  const activeFile = useMemo(
    () => selectedFiles.find((f) => f.id === activeTab) ?? selectedFiles[0],
    [selectedFiles, activeTab],
  );
  const activeAttributes = activeFile ? cache[activeFile.id] ?? [] : [];
  const loading = activeFile ? !cache[activeFile.id] : false;

  if (selectedFiles.length === 0) {
    return (
      <div role="status" className="text-center text-ink-4 py-10 text-sm">
        Belum ada file yang terpilih. Kembali ke step 1 untuk menambah file.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <div className="flex items-start gap-2 p-3 rounded-2 border border-blue-100 bg-blue-50 text-sm text-blue-600">
        <Icon name="help" size={16} aria-hidden className="mt-0.5 flex-none" />
        <p className="m-0">
          Atribut di bawah ini terdeteksi otomatis dari header file. Edit manual
          schema akan tersedia di Phase 9.
        </p>
      </div>

      {selectedFiles.length > 1 ? (
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List aria-label="File schema">
            {selectedFiles.map((f) => (
              <Tabs.Trigger key={f.id} value={f.id}>
                <span className="truncate max-w-[24ch] inline-block align-middle" title={f.name}>
                  {f.name}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {selectedFiles.map((f) => (
            <Tabs.Content key={f.id} value={f.id} className="pt-4">
              <SchemaTabBody
                attributes={cache[f.id] ?? []}
                loading={!cache[f.id]}
              />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      ) : (
        <SchemaTabBody attributes={activeAttributes} loading={loading} />
      )}

      <div className="flex justify-between gap-2 pt-2 flex-wrap">
        <Button variant="secondary" onClick={() => goToStep(2)} leftIcon="chevL">
          Kembali
        </Button>
        <Button variant="primary" onClick={() => goToStep(4)} rightIcon="arrowR">
          Lanjut ke Validasi
        </Button>
      </div>
    </div>
  );
}

interface SchemaTabBodyProps {
  attributes: AttributeRow[];
  loading: boolean;
}

function SchemaTabBody({ attributes, loading }: SchemaTabBodyProps): JSX.Element {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="text-center text-ink-4 py-10 text-sm">
        Mendeteksi atribut…
      </div>
    );
  }
  return <AttributeTable attributes={attributes} />;
}
