/**
 * AnalyticsPage — `/analytics` route.
 *
 * Layout (Phase 8.11):
 *   - Left rail (w-72, flex-none): SavedQueryList — built-in + user-saved
 *   - Main area (flex-1): QueryBuilder + ChartPreview + action toolbar
 *
 * State strategy:
 *   - URL search params adalah single source of truth untuk current draft
 *     (dataset, chartType, xAxis, yAxis, aggregation). Shareable + history-friendly.
 *   - TanStack Query mengelola async hits (savedQueries, runQuery).
 *   - localStorage di-encapsulate di `api/analytics.ts` (consumer tidak tahu).
 *
 * Validation gate: tombol "Jalankan" disabled sampai semua required field terisi.
 *
 * A11y:
 *   - Heading hierarchy: h1 page > h2 builder/preview > h3 dst.
 *   - Toast feedback untuk save/export/delete.
 *   - Confirm dialog untuk delete (mencegah accidental).
 */
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  FormField,
  FormProvider,
  Icon,
  Input,
  toast,
  useForm,
  zodResolver,
} from '@ghanem/ui';
import { z } from 'zod';
import {
  createSavedQuery,
  deleteSavedQuery,
  getSavedQueries,
  runAnalyticsQuery,
} from '../api/analytics';
import type {
  AnalyticsAggregation,
  AnalyticsChartType,
  AnalyticsQuery,
  SavedQuery,
} from '../mocks/analytics';
import { useAuth } from '../hooks/use-auth';
import { SavedQueryList } from './analytics/SavedQueryList';
import { QueryBuilder } from './analytics/QueryBuilder';
import { ChartPreview, exportResultAsCsv } from './analytics/ChartPreview';

const VALID_CHART_TYPES: ReadonlyArray<AnalyticsChartType> = ['line', 'bar', 'pie', 'donut'];
const VALID_AGGREGATIONS: ReadonlyArray<AnalyticsAggregation> = ['count', 'sum', 'avg', 'min', 'max'];

function parseChartType(raw: string | null): AnalyticsChartType | undefined {
  if (!raw) return undefined;
  return (VALID_CHART_TYPES as readonly string[]).includes(raw)
    ? (raw as AnalyticsChartType)
    : undefined;
}

function parseAggregation(raw: string | null): AnalyticsAggregation | undefined {
  if (!raw) return undefined;
  return (VALID_AGGREGATIONS as readonly string[]).includes(raw)
    ? (raw as AnalyticsAggregation)
    : undefined;
}

const saveQuerySchema = z.object({
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(80, 'Nama maksimal 80 karakter'),
});

type SaveQueryFormValues = z.infer<typeof saveQuerySchema>;

export function AnalyticsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userLabel = user?.fullName ?? user?.email ?? 'Anonymous';

  /* ── Draft state (URL-backed) ──────────────────────────────────────── */
  const draft = useMemo<Partial<AnalyticsQuery>>(
    () => ({
      datasetId: searchParams.get('dataset') ?? undefined,
      chartType: parseChartType(searchParams.get('chartType')) ?? 'bar',
      xAxis: searchParams.get('xAxis') ?? undefined,
      yAxis: searchParams.get('yAxis') ?? undefined,
      aggregation: parseAggregation(searchParams.get('agg')) ?? 'count',
    }),
    [searchParams],
  );

  const updateDraft = useCallback(
    (next: Partial<AnalyticsQuery>) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if ('datasetId' in next) {
            if (next.datasetId) params.set('dataset', next.datasetId);
            else params.delete('dataset');
          }
          if ('chartType' in next) {
            if (next.chartType) params.set('chartType', next.chartType);
            else params.delete('chartType');
          }
          if ('xAxis' in next) {
            if (next.xAxis) params.set('xAxis', next.xAxis);
            else params.delete('xAxis');
          }
          if ('yAxis' in next) {
            if (next.yAxis) params.set('yAxis', next.yAxis);
            else params.delete('yAxis');
          }
          if ('aggregation' in next) {
            if (next.aggregation) params.set('agg', next.aggregation);
            else params.delete('agg');
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleReset = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setActiveSavedId(null);
    setLastRunQuery(null);
  }, [setSearchParams]);

  /* ── Saved queries ──────────────────────────────────────────────────── */
  const savedQueriesQuery = useQuery({
    queryKey: ['analytics', 'saved'],
    queryFn: getSavedQueries,
    staleTime: 60_000,
  });
  const [activeSavedId, setActiveSavedId] = useState<string | null>(null);

  const handleSelectSaved = useCallback(
    (q: SavedQuery) => {
      setActiveSavedId(q.id);
      updateDraft({
        datasetId: q.datasetId,
        chartType: q.chartType,
        xAxis: q.xAxis,
        yAxis: q.yAxis,
        aggregation: q.aggregation,
      });
    },
    [updateDraft],
  );

  /* ── Delete saved query (with confirm) ─────────────────────────────── */
  const [deleteTarget, setDeleteTarget] = useState<SavedQuery | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedQuery(id),
    onSuccess: (res, id) => {
      setDeleteTarget(null);
      if (res.ok) {
        toast.success('Saved query dihapus');
        if (activeSavedId === id) setActiveSavedId(null);
        void queryClient.invalidateQueries({ queryKey: ['analytics', 'saved'] });
      } else {
        toast.error('Tidak dapat menghapus built-in query');
      }
    },
    onError: () => {
      toast.error('Gagal menghapus saved query');
    },
  });

  /* ── Run query (manual trigger) ────────────────────────────────────── */
  const [lastRunQuery, setLastRunQuery] = useState<AnalyticsQuery | null>(null);
  const runQueryMutation = useMutation({
    mutationFn: runAnalyticsQuery,
    onError: () => {
      toast.error('Gagal menjalankan query');
    },
  });

  const isDraftComplete =
    !!draft.datasetId &&
    !!draft.xAxis &&
    !!draft.yAxis &&
    !!draft.chartType &&
    !!draft.aggregation;

  const handleRun = useCallback(() => {
    if (!isDraftComplete) {
      toast.warning('Lengkapi semua field terlebih dahulu');
      return;
    }
    const full = draft as AnalyticsQuery;
    setLastRunQuery(full);
    runQueryMutation.mutate(full);
  }, [draft, isDraftComplete, runQueryMutation]);

  /* ── Save dialog ───────────────────────────────────────────────────── */
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const saveForm = useForm<SaveQueryFormValues>({
    resolver: zodResolver(saveQuerySchema),
    defaultValues: { name: '' },
  });

  const handleOpenSaveDialog = useCallback(() => {
    if (!isDraftComplete) {
      toast.warning('Lengkapi query sebelum menyimpan');
      return;
    }
    saveForm.reset({ name: '' });
    setSaveDialogOpen(true);
  }, [isDraftComplete, saveForm]);

  const handleSubmitSave = saveForm.handleSubmit(async (values) => {
    if (!isDraftComplete) return;
    const full = draft as AnalyticsQuery;
    try {
      const saved = await createSavedQuery({
        name: values.name,
        query: full,
        createdBy: userLabel,
      });
      toast.success('Saved query ditambahkan', { description: saved.name });
      setSaveDialogOpen(false);
      setActiveSavedId(saved.id);
      void queryClient.invalidateQueries({ queryKey: ['analytics', 'saved'] });
    } catch {
      toast.error('Gagal menyimpan query');
    }
  });

  /* ── Export handlers ───────────────────────────────────────────────── */
  const handleExportCsv = useCallback(() => {
    const result = runQueryMutation.data;
    if (!result || !result.valid) {
      toast.warning('Jalankan query terlebih dahulu');
      return;
    }
    const filename = `analytics-${draft.datasetId ?? 'export'}-${Date.now()}`;
    exportResultAsCsv(filename, result);
    toast.success('CSV diunduh', { description: filename });
  }, [draft.datasetId, runQueryMutation.data]);

  const handleExportPng = useCallback(() => {
    // PNG export butuh canvas serialization dari Recharts SVG — defer ke
    // implementasi nyata (Phase 9). Untuk sekarang berikan UX hint via toast.
    toast.info('Export PNG — segera hadir', {
      description: 'Fitur ini akan tersedia pada Phase 9 (server-side render Recharts).',
    });
  }, []);

  return (
    <div className="flex h-full min-h-0">
      <SavedQueryList
        items={savedQueriesQuery.data ?? []}
        activeId={activeSavedId}
        onSelect={handleSelectSaved}
        onRequestDelete={(q) => setDeleteTarget(q)}
        onNew={handleReset}
        loading={savedQueriesQuery.isLoading}
      />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="px-6 pt-6 pb-3 border-b border-line bg-surface">
          <p className="text-cap text-green-700 uppercase tracking-cap mb-1">
            SPEKTRUM · Analytics
          </p>
          <h1 className="font-display font-bold text-h1 text-ink m-0">Chart Builder</h1>
          <p className="text-sm text-ink-4 mt-1 max-w-2xl">
            Susun visualisasi lintas atribut dataset tanpa SQL. Hasil bisa disimpan
            sebagai saved query untuk dibagikan ke tim.
          </p>
        </header>

        <div className="px-6 py-5 flex flex-col gap-4 max-w-6xl mx-auto">
          <QueryBuilder value={draft} onChange={updateDraft} />

          {/* Action toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              leftIcon="bolt"
              onClick={handleRun}
              disabled={!isDraftComplete}
              loading={runQueryMutation.isPending}
            >
              Jalankan
            </Button>
            <Button variant="secondary" size="md" leftIcon="check" onClick={handleOpenSaveDialog}>
              Simpan query
            </Button>
            <Button variant="secondary" size="md" leftIcon="download" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="secondary" size="md" leftIcon="download" onClick={handleExportPng}>
              Export PNG
            </Button>
            <Button variant="ghost" size="md" leftIcon="refresh" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <section aria-label="Preview chart">
            <ChartPreview
              result={runQueryMutation.data ?? null}
              query={lastRunQuery}
              loading={runQueryMutation.isPending}
            />
          </section>
        </div>
      </div>

      {/* ── Save dialog ────────────────────────────────────────────────── */}
      <Dialog.Root open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <Dialog.Content size="md">
          <Dialog.Header>
            <Dialog.Title>Simpan query</Dialog.Title>
            <Dialog.Description>
              Saved query akan tersimpan di browser ini (localStorage). Berikan nama
              deskriptif untuk memudahkan pencarian.
            </Dialog.Description>
          </Dialog.Header>
          <FormProvider {...saveForm}>
            <form
              onSubmit={(e) => {
                void handleSubmitSave(e);
              }}
              className="mt-4 flex flex-col gap-3"
            >
              <FormField<SaveQueryFormValues>
                name="name"
                label="Nama query"
                required
                hint="Mis. 'Produksi per lapangan Mei 2026'."
              >
                <Input placeholder="Nama query…" autoFocus />
              </FormField>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary" type="button">
                    Batal
                  </Button>
                </Dialog.Close>
                <Button variant="primary" type="submit" loading={saveForm.formState.isSubmitting}>
                  Simpan
                </Button>
              </Dialog.Footer>
            </form>
          </FormProvider>
        </Dialog.Content>
      </Dialog.Root>

      {/* ── Delete confirm dialog ─────────────────────────────────────── */}
      <Dialog.Root
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <Dialog.Content size="sm">
          <Dialog.Header>
            <Dialog.Title>Hapus saved query</Dialog.Title>
            <Dialog.Description>
              <span className="inline-flex items-center gap-1.5 text-amber-700 mt-1">
                <Icon name="warn" size={14} aria-hidden />
                Tindakan ini tidak bisa dibatalkan.
              </span>
            </Dialog.Description>
          </Dialog.Header>
          <p className="mt-3 text-sm text-ink-3">
            Hapus <b className="text-ink">{deleteTarget?.name ?? ''}</b>?
          </p>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                Batal
              </Button>
            </Dialog.Close>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              loading={deleteMutation.isPending}
            >
              Hapus
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default AnalyticsPage;
