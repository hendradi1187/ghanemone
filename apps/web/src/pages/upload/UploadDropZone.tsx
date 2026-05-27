/**
 * UploadDropZone — Step 1: HTML5 drag/drop + browse input.
 *
 * Fitur:
 *   - Dropzone besar dengan icon + instruksi
 *   - State `dragOver` mengubah border + bg (visual feedback)
 *   - Browse button → hidden `<input type="file" multiple>` trigger
 *   - Accept filter: `.shp,.zip,.kml,.geojson,.json,.csv,.segy,.sgy`
 *   - Per file inline validation pakai `validateFileMock` (async, run on add)
 *   - List file dengan: nama, size, format badge, remove (X)
 *   - Banner reminder kalau ada file ter-restore dari sessionStorage tanpa File object
 *
 * A11y:
 *   - Drop area `<div role="button" tabindex>` + keyboard activation (Enter/Space)
 *   - Live region untuk announce file added/removed
 *   - File list: `<ul>` semantic, remove button labeled
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, toast } from '@ghanem/ui';
import {
  ALLOWED_EXTENSIONS,
  formatBytes,
  getExtension,
  validateFileMock,
  type ValidationResult,
} from '../../mocks/upload';
import {
  useUploadWizardStore,
  type SelectedFileInfo,
} from '../../stores/upload-wizard';

/** Build `accept` attribute string dari ALLOWED_EXTENSIONS. */
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',');

interface PerFileState {
  validating: boolean;
  result: ValidationResult | null;
}

function generateId(): string {
  return `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function UploadDropZone(): JSX.Element {
  const selectedFiles = useUploadWizardStore((s) => s.selectedFiles);
  const setSelectedFiles = useUploadWizardStore((s) => s.setSelectedFiles);
  const goToStep = useUploadWizardStore((s) => s.goToStep);

  const [dragOver, setDragOver] = useState(false);
  const [perFile, setPerFile] = useState<Record<string, PerFileState>>({});
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  /** Files yang ter-restore dari sessionStorage tanpa File object. */
  const orphanedFiles = useMemo(
    () => selectedFiles.filter((f) => f.file === null),
    [selectedFiles],
  );

  /* ── Validate file saat di-add ─────────────────────────────────────── */
  const validateAndStore = useCallback(
    async (fileInfo: SelectedFileInfo): Promise<void> => {
      if (!fileInfo.file) return;
      setPerFile((prev) => ({ ...prev, [fileInfo.id]: { validating: true, result: null } }));
      try {
        const result = await validateFileMock(fileInfo.file);
        setPerFile((prev) => ({
          ...prev,
          [fileInfo.id]: { validating: false, result },
        }));
      } catch (err) {
        void err;
        setPerFile((prev) => ({
          ...prev,
          [fileInfo.id]: { validating: false, result: null },
        }));
      }
    },
    [],
  );

  /** Re-validate apapun yang sudah ada File-nya tapi belum di-validate (saat first mount). */
  useEffect(() => {
    for (const f of selectedFiles) {
      if (f.file && !perFile[f.id]) {
        void validateAndStore(f);
      }
    }
    // sengaja jalan hanya saat mount + selectedFiles berubah dari luar.
  }, [selectedFiles, perFile, validateAndStore]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;
      const existingNames = new Set(selectedFiles.map((f) => `${f.name}:${f.size}`));
      const newItems: SelectedFileInfo[] = [];
      for (const file of incoming) {
        const key = `${file.name}:${file.size}`;
        if (existingNames.has(key)) {
          toast.info('File sudah ada di daftar', { description: file.name });
          continue;
        }
        existingNames.add(key);
        newItems.push({
          id: generateId(),
          name: file.name,
          size: file.size,
          ext: getExtension(file.name),
          file,
        });
      }
      if (newItems.length === 0) return;
      const merged = [...selectedFiles, ...newItems];
      setSelectedFiles(merged);
      setAnnouncement(`${newItems.length} file ditambahkan.`);
      for (const item of newItems) {
        void validateAndStore(item);
      }
    },
    [selectedFiles, setSelectedFiles, validateAndStore],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const next = selectedFiles.filter((f) => f.id !== id);
      setSelectedFiles(next);
      setPerFile((prev) => {
        // Construct a new object excluding the removed file's entry.
        const { [id]: _omitted, ...rest } = prev;
        void _omitted;
        return rest;
      });
      setAnnouncement('File dihapus.');
    },
    [selectedFiles, setSelectedFiles],
  );

  /* ── Drag-drop handlers ──────────────────────────────────────────── */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    },
    [addFiles],
  );

  const handleBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      addFiles(files);
      // Reset supaya user bisa pilih file yang sama lagi setelah remove.
      if (inputRef.current) inputRef.current.value = '';
    },
    [addFiles],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBrowse();
      }
    },
    [handleBrowse],
  );

  /* ── Continue gate ────────────────────────────────────────────────── */
  const validFilesCount = useMemo(() => {
    return selectedFiles.filter((f) => {
      const s = perFile[f.id];
      return f.file && s?.result && s.result.severity !== 'fail';
    }).length;
  }, [selectedFiles, perFile]);

  const canContinue = validFilesCount >= 1 && orphanedFiles.length === 0;

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-4">
      {orphanedFiles.length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-2 border border-amber-300 bg-amber-100 text-sm text-amber-700"
        >
          <Icon name="warn" size={16} aria-hidden className="mt-0.5 flex-none" />
          <div className="min-w-0">
            <p className="font-semibold text-amber-700 m-0">File perlu dipilih ulang</p>
            <p className="text-amber-700 m-0 mt-0.5">
              Karena halaman di-refresh, browser tidak menyimpan file. Hapus entri di bawah
              lalu pilih file lagi untuk melanjutkan.
            </p>
          </div>
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowse}
        onKeyDown={handleKey}
        aria-label="Area drop file. Tekan Enter untuk membuka dialog pilih file."
        className={[
          'flex flex-col items-center justify-center gap-3',
          'rounded-3 border-2 border-dashed p-10 cursor-pointer',
          'transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          dragOver ? 'border-green-500 bg-green-50' : 'border-line bg-surface hover:bg-surface-2',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className="inline-flex items-center justify-center w-14 h-14 rounded-pill bg-green-50 text-green-600"
        >
          <Icon name="upload" size={26} aria-hidden />
        </span>
        <div className="text-center">
          <p className="font-display font-semibold text-h3 text-ink m-0">
            Tarik & lepaskan file di sini
          </p>
          <p className="text-sm text-ink-4 mt-1">
            atau klik untuk telusuri. Format yang didukung:{' '}
            <span className="font-mono text-ink-3">
              .shp .zip .kml .geojson .csv .segy .sgy
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowse();
          }}
          className={[
            'inline-flex items-center gap-2 px-4 h-9 rounded-2',
            'bg-green-500 text-white border border-green-600 font-medium text-sm',
            'hover:bg-green-600 active:bg-green-700 transition-colors duration-hf',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          <Icon name="plus" size={14} aria-hidden />
          Pilih File
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* SR announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {selectedFiles.length > 0 ? (
        <section aria-label="Daftar file terpilih" className="flex flex-col gap-2">
          <header className="flex items-baseline justify-between flex-wrap gap-1">
            <h2 className="text-h3 font-display font-semibold text-ink m-0">
              File terpilih ({selectedFiles.length})
            </h2>
            <p className="text-xs text-ink-4 m-0">
              <span className="num font-medium">{validFilesCount}</span> siap diunggah
            </p>
          </header>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {selectedFiles.map((f) => (
              <FileRow
                key={f.id}
                fileInfo={f}
                state={perFile[f.id]}
                onRemove={() => handleRemove(f.id)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => goToStep(2)}
          className={[
            'inline-flex items-center gap-2 px-4 h-10 rounded-2',
            'bg-green-500 text-white border border-green-600 font-medium text-sm',
            'hover:bg-green-600 active:bg-green-700 transition-colors duration-hf',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          ].join(' ')}
        >
          Lanjut ke Metadata
          <Icon name="arrowR" size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ─── FileRow ──────────────────────────────────────────────────────── */

interface FileRowProps {
  fileInfo: SelectedFileInfo;
  state: PerFileState | undefined;
  onRemove: () => void;
}

function FileRow({ fileInfo, state, onRemove }: FileRowProps): JSX.Element {
  const orphaned = fileInfo.file === null;
  const result = state?.result ?? null;
  const validating = state?.validating ?? false;
  const severity = result?.severity ?? (orphaned ? 'fail' : null);

  const sevConfig =
    severity === 'pass'
      ? { icon: 'check' as const, bg: 'bg-green-50', fg: 'text-green-700', border: 'border-green-200' }
      : severity === 'warning'
        ? { icon: 'warn' as const, bg: 'bg-amber-100', fg: 'text-amber-700', border: 'border-amber-300' }
        : severity === 'fail'
          ? { icon: 'x' as const, bg: 'bg-red-100', fg: 'text-red-500', border: 'border-red-100' }
          : { icon: 'clock' as const, bg: 'bg-surface-2', fg: 'text-ink-4', border: 'border-line' };

  const message = orphaned
    ? 'File tidak tersimpan saat refresh — hapus & pilih ulang.'
    : validating
      ? 'Memvalidasi file…'
      : result?.issues[0]?.message ?? '';

  return (
    <li
      className={[
        'flex items-start gap-3 p-3 rounded-2 border bg-surface',
        sevConfig.border,
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'inline-flex items-center justify-center w-9 h-9 rounded-2 flex-none',
          sevConfig.bg,
          sevConfig.fg,
        ].join(' ')}
      >
        <Icon name={sevConfig.icon} size={16} aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-sm text-ink truncate max-w-[28ch]" title={fileInfo.name}>
            {fileInfo.name}
          </span>
          <span
            className={[
              'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
              'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
              'bg-blue-50 text-blue-600 border-blue-100',
            ].join(' ')}
          >
            {fileInfo.ext || '???'}
          </span>
          <span className="text-xs text-ink-4 num">{formatBytes(fileInfo.size)}</span>
        </div>
        {message ? (
          <p className={['text-xs mt-1 m-0', sevConfig.fg].join(' ')}>{message}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus file ${fileInfo.name}`}
        className={[
          'inline-flex items-center justify-center w-8 h-8 rounded-2',
          'text-ink-4 hover:bg-surface-2 hover:text-ink',
          'transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500',
          'flex-none',
        ].join(' ')}
      >
        <Icon name="x" size={14} aria-hidden />
      </button>
    </li>
  );
}
