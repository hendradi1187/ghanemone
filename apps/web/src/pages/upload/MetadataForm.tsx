/**
 * MetadataForm — Step 2: RHF + Zod form untuk capture dataset metadata.
 *
 * Fields:
 *   - name (3-100 char)
 *   - description (max 500)
 *   - category (Select: 6 options)
 *   - license (Select: 3 options)
 *   - tags (CSV input → array; lowercase + dedupe)
 *   - bbox: minLng, minLat, maxLng, maxLat (validate ranges + min < max)
 *
 * Provider field di-bind ke `user.organization` (read-only display).
 *
 * Pattern reference: AnalyticsPage (Save dialog) + LoginPage (full form).
 */
import { useEffect } from 'react';
import {
  Button,
  FormField,
  FormProvider,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useForm,
  useFormState,
  zodResolver,
} from '@ghanem/ui';
import { z } from 'zod';
import { useAuth } from '../../hooks/use-auth';
import {
  useUploadWizardStore,
  type WizardMetadata,
} from '../../stores/upload-wizard';
import type { DatasetCategoryId, DatasetLicense } from '../../mocks/upload';

/* ─── Options ─────────────────────────────────────────────────────────── */

const CATEGORY_OPTIONS: readonly { value: DatasetCategoryId; label: string }[] = [
  { value: 'seismic', label: 'Seismic' },
  { value: 'well-log', label: 'Well Log' },
  { value: 'production', label: 'Production' },
  { value: 'concession', label: 'Concession / WK' },
  { value: 'geology', label: 'Geology' },
  { value: 'document', label: 'Document' },
];

const LICENSE_OPTIONS: readonly { value: DatasetLicense; label: string }[] = [
  { value: 'CC-BY-4.0', label: 'CC-BY 4.0 (terbuka, atribusi)' },
  { value: 'Internal SPEKTRUM', label: 'Internal SPEKTRUM' },
  { value: 'Restricted SKK Migas', label: 'Restricted SKK Migas' },
];

/* ─── Schema ──────────────────────────────────────────────────────────── */

const bboxNumberSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'string' ? Number(v) : v))
  .refine((n) => !Number.isNaN(n), { message: 'Harus berupa angka' });

const metadataSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Nama minimal 3 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    description: z
      .string()
      .max(500, 'Deskripsi maksimal 500 karakter')
      .optional()
      .default(''),
    category: z.enum(
      ['seismic', 'well-log', 'production', 'concession', 'geology', 'document'] as const,
      { errorMap: () => ({ message: 'Pilih kategori dataset' }) },
    ),
    license: z.enum(
      ['CC-BY-4.0', 'Internal SPEKTRUM', 'Restricted SKK Migas'] as const,
      { errorMap: () => ({ message: 'Pilih lisensi data' }) },
    ),
    tagsRaw: z.string().optional().default(''),
    minLng: bboxNumberSchema,
    minLat: bboxNumberSchema,
    maxLng: bboxNumberSchema,
    maxLat: bboxNumberSchema,
  })
  .superRefine((data, ctx) => {
    if (data.minLng < -180 || data.minLng > 180) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minLng'],
        message: 'Longitude harus -180..180',
      });
    }
    if (data.maxLng < -180 || data.maxLng > 180) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxLng'],
        message: 'Longitude harus -180..180',
      });
    }
    if (data.minLat < -90 || data.minLat > 90) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['minLat'],
        message: 'Latitude harus -90..90',
      });
    }
    if (data.maxLat < -90 || data.maxLat > 90) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxLat'],
        message: 'Latitude harus -90..90',
      });
    }
    if (data.minLng >= data.maxLng) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxLng'],
        message: 'maxLng harus lebih besar dari minLng',
      });
    }
    if (data.minLat >= data.maxLat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxLat'],
        message: 'maxLat harus lebih besar dari minLat',
      });
    }
  });

type MetadataFormValues = z.infer<typeof metadataSchema>;

/* ─── Helpers ─────────────────────────────────────────────────────────── */

/** Parse CSV string → array tag (lowercase, dedupe, trim). */
function parseTags(raw: string): string[] {
  const set = new Set<string>();
  for (const part of raw.split(',')) {
    const trimmed = part.trim().toLowerCase();
    if (trimmed) set.add(trimmed);
  }
  return Array.from(set);
}

function defaultsFromStore(meta: WizardMetadata): MetadataFormValues {
  const [minLng, minLat, maxLng, maxLat] = meta.bbox ?? [
    Number.NaN,
    Number.NaN,
    Number.NaN,
    Number.NaN,
  ];
  return {
    name: meta.name,
    description: meta.description,
    category: (meta.category || 'concession') as MetadataFormValues['category'],
    license: (meta.license || 'Internal SPEKTRUM') as MetadataFormValues['license'],
    tagsRaw: meta.tags.join(', '),
    minLng: Number.isNaN(minLng) ? (undefined as unknown as number) : minLng,
    minLat: Number.isNaN(minLat) ? (undefined as unknown as number) : minLat,
    maxLng: Number.isNaN(maxLng) ? (undefined as unknown as number) : maxLng,
    maxLat: Number.isNaN(maxLat) ? (undefined as unknown as number) : maxLat,
  };
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function MetadataForm(): JSX.Element {
  const { user } = useAuth();
  const metadata = useUploadWizardStore((s) => s.metadata);
  const setMetadata = useUploadWizardStore((s) => s.setMetadata);
  const goToStep = useUploadWizardStore((s) => s.goToStep);

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: defaultsFromStore(metadata),
    mode: 'onBlur',
  });

  // Default category/license dari store metadata (kalau kosong, biar user yang pilih).
  useEffect(() => {
    if (!metadata.category) {
      form.setValue('category', '' as MetadataFormValues['category']);
    }
    if (!metadata.license) {
      form.setValue('license', '' as MetadataFormValues['license']);
    }
    // run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = form.handleSubmit((values) => {
    setMetadata({
      name: values.name,
      description: values.description ?? '',
      category: values.category,
      license: values.license,
      tags: parseTags(values.tagsRaw ?? ''),
      bbox: [values.minLng, values.minLat, values.maxLng, values.maxLat],
    });
    goToStep(3);
  });

  const onBack = () => {
    // Persist whatever dipreserve walaupun belum valid — supaya saat back step user
    // tidak kehilangan progress.
    const values = form.getValues();
    setMetadata({
      name: values.name,
      description: values.description ?? '',
      category: (values.category || metadata.category) as WizardMetadata['category'],
      license: (values.license || metadata.license) as WizardMetadata['license'],
      tags: parseTags(values.tagsRaw ?? ''),
      bbox:
        [values.minLng, values.minLat, values.maxLng, values.maxLat].every(
          (n) => typeof n === 'number' && !Number.isNaN(n),
        )
          ? [values.minLng, values.minLat, values.maxLng, values.maxLat]
          : metadata.bbox,
    });
    goToStep(1);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(e) => {
          void onSubmit(e);
        }}
        className="flex flex-col gap-4 max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<MetadataFormValues>
            name="name"
            label="Nama dataset"
            required
            hint="Mis. 'WK ONWJ Boundary 2026'."
          >
            <Input placeholder="Nama dataset…" autoFocus />
          </FormField>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-cap text-ink-3" htmlFor="provider-display">
              Provider <span className="text-ink-4">(otomatis)</span>
            </label>
            <input
              id="provider-display"
              type="text"
              value={user?.organization ?? '—'}
              readOnly
              aria-readonly="true"
              className={[
                'w-full h-10 px-3 rounded-2 bg-surface-2 text-ink',
                'border border-line text-sm cursor-not-allowed',
              ].join(' ')}
            />
            <p className="text-xs text-ink-4">
              Berdasarkan organisasi akun yang sedang login.
            </p>
          </div>
        </div>

        <FormField<MetadataFormValues>
          name="description"
          label="Deskripsi"
          hint="Penjelasan singkat tentang sumber & cakupan data. Maksimal 500 karakter."
        >
          <Textarea placeholder="Ringkasan dataset…" rows={4} />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField<MetadataFormValues> name="category" label="Kategori" required>
            {(field) => (
              <Select
                value={(field.value as string) || undefined}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger aria-label="Pilih kategori dataset">
                  <SelectValue placeholder="Pilih kategori…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField<MetadataFormValues> name="license" label="Lisensi" required>
            {(field) => (
              <Select
                value={(field.value as string) || undefined}
                onValueChange={(v) => field.onChange(v)}
              >
                <SelectTrigger aria-label="Pilih lisensi data">
                  <SelectValue placeholder="Pilih lisensi…" />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        </div>

        <FormField<MetadataFormValues>
          name="tagsRaw"
          label="Tags"
          hint="Pisahkan dengan koma. Mis. 'offshore, jawa, 2026'."
        >
          <Input placeholder="offshore, jawa, …" />
        </FormField>

        <fieldset className="border border-line rounded-3 p-4">
          <legend className="px-2 text-xs font-semibold uppercase tracking-cap text-ink-3">
            Bounding Box <span className="text-ink-4 normal-case font-normal">(WGS84 / EPSG:4326)</span>
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField<MetadataFormValues>
              name="minLng"
              label="minLng"
              required
              hint="-180..180"
            >
              <Input type="number" step="0.0001" placeholder="-180" inputMode="decimal" />
            </FormField>
            <FormField<MetadataFormValues>
              name="minLat"
              label="minLat"
              required
              hint="-90..90"
            >
              <Input type="number" step="0.0001" placeholder="-90" inputMode="decimal" />
            </FormField>
            <FormField<MetadataFormValues>
              name="maxLng"
              label="maxLng"
              required
              hint=">minLng"
            >
              <Input type="number" step="0.0001" placeholder="180" inputMode="decimal" />
            </FormField>
            <FormField<MetadataFormValues>
              name="maxLat"
              label="maxLat"
              required
              hint=">minLat"
            >
              <Input type="number" step="0.0001" placeholder="90" inputMode="decimal" />
            </FormField>
          </div>
          <p className="text-xs text-ink-4 mt-3 m-0">
            Catatan: Indonesia ada di sekitar lng 95..141, lat -11..6.
          </p>
        </fieldset>

        <div className="flex justify-between gap-2 pt-2 flex-wrap">
          <Button type="button" variant="secondary" onClick={onBack} leftIcon="chevL">
            Kembali
          </Button>
          <Button type="submit" variant="primary" rightIcon="arrowR">
            Lanjut ke Schema
          </Button>
        </div>
      </form>
      {/* SR-only summary error count */}
      <FormErrorSummary />
    </FormProvider>
  );
}

function FormErrorSummary(): JSX.Element {
  const { errors } = useFormState();
  const count = Object.keys(errors).length;
  if (count === 0) return <span className="sr-only" />;
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {`Form memiliki ${count} kesalahan validasi.`}
    </p>
  );
}
