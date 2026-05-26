/**
 * Dataset upload form schema — Zod.
 *
 * Demonstrates: text constraint range, enum, File array, boolean.
 * Aktual upload form di apps/web/src/features/upload/ akan extend dengan
 * step-wise validation (chunked upload progress) — schema ini hanya
 * lever step "Metadata" (nama, kategori, dst.).
 */
import { z } from 'zod';

export const datasetCategoryEnum = z.enum([
  'seismic',
  'well-log',
  'production',
  'concession',
  'other',
]);

export type DatasetCategory = z.infer<typeof datasetCategoryEnum>;

export const datasetUploadSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama dataset minimal 3 karakter')
    .max(100, 'Nama dataset maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  category: datasetCategoryEnum,
  files: z
    .array(z.instanceof(File))
    .min(1, 'Pilih minimal 1 file'),
  isPublic: z.boolean().default(false),
});

export type DatasetUploadFormValues = z.infer<typeof datasetUploadSchema>;
