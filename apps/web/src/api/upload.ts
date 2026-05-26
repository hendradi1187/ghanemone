/**
 * Upload API — mock client untuk Upload wizard (Phase 8.15).
 *
 * Phase 9 ganti dengan presigned-URL flow (S3-compatible). Per file:
 *   1. POST /v1/datasets/uploads → { uploadId, presignedUrl }
 *   2. PUT presignedUrl (multipart) dengan progress event
 *   3. POST /v1/datasets/uploads/:id/complete
 */
import { validateFileMock, submitDatasetMock, type UploadFormData, type ValidationResult } from '../mocks/upload';

export type UploadProgressCallback = (progressPct: number) => void;

export interface UploadResult {
  uploadId: string;
  fileName: string;
}

/**
 * Simulasi chunked upload — emit progress 0-100 dalam 3-8 detik random.
 * Cancellation via AbortSignal — caller boleh batalkan mid-upload.
 *
 * Returns Promise yang resolve ketika selesai (atau reject saat abort).
 */
export function uploadFileMock(
  file: File,
  onProgress: UploadProgressCallback,
  signal?: AbortSignal,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload dibatalkan', 'AbortError'));
      return;
    }

    const totalDurationMs = 3000 + Math.floor(Math.random() * 5000);
    const intervalMs = 200;
    const totalTicks = Math.max(1, Math.floor(totalDurationMs / intervalMs));
    let tick = 0;
    let progress = 0;

    const interval = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(interval);
        reject(new DOMException('Upload dibatalkan', 'AbortError'));
        return;
      }
      tick += 1;
      // Non-linear curve — awal lambat, tengah cepat, akhir lambat (S-curve).
      const t = tick / totalTicks;
      const eased = t * t * (3 - 2 * t); // smoothstep
      progress = Math.min(100, Math.round(eased * 100));
      onProgress(progress);
      if (tick >= totalTicks || progress >= 100) {
        clearInterval(interval);
        onProgress(100);
        resolve({
          uploadId: `up-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
        });
      }
    }, intervalMs);

    // reason: AbortSignal `addEventListener` — supaya consumer bisa cancel
    // sebelum tick selesai (mis. user remove file dari list).
    signal?.addEventListener(
      'abort',
      () => {
        clearInterval(interval);
        reject(new DOMException('Upload dibatalkan', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function validateFile(file: File): Promise<ValidationResult> {
  return validateFileMock(file);
}

export async function submitDataset(data: UploadFormData): Promise<{ id: string }> {
  return submitDatasetMock(data);
}
