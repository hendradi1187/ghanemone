/**
 * CodeBlock — display kode dengan copy-to-clipboard + language label.
 *
 * Tidak pakai library syntax highlighting (prism-react-renderer) untuk
 * menjaga bundle kecil. Kalau Phase 9+ membutuhkan token highlighting, swap
 * children dengan komponen highlighter (dep `prism-react-renderer` ~12KB).
 *
 * Props:
 *   - `code`: string atau ReactNode untuk full kontrol layout
 *   - `language`: bash/javascript/python/typescript/sql (label visual saja)
 *   - `filename`: opsional, tampil di header
 *   - `wrap`: word-wrap long lines (default false → overflow scroll)
 *
 * A11y:
 *   - `<pre>` semantic untuk preformatted content (SR menyajikan apa adanya)
 *   - Copy button: `aria-label` + `aria-live="polite"` saat success
 *   - Language label hanya visual chip (decorative) — di-set `aria-hidden`
 */
import { useCallback, useState, type HTMLAttributes } from 'react';
import { Icon } from '../icon';

export type CodeLanguage = 'bash' | 'javascript' | 'python' | 'typescript' | 'sql' | 'json' | 'plain';

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Source code. */
  code: string;
  /** Bahasa untuk label visual (tidak melakukan tokenisasi). Default `plain`. */
  language?: CodeLanguage;
  /** Optional filename header. */
  filename?: string;
  /** Word-wrap long lines. Default false. */
  wrap?: boolean;
  /** Disable copy button. */
  hideCopy?: boolean;
}

const languageLabel: Record<CodeLanguage, string> = {
  bash: 'Bash',
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
  sql: 'SQL',
  json: 'JSON',
  plain: 'Text',
};

const languageTone: Record<CodeLanguage, string> = {
  bash: 'bg-ink text-white',
  javascript: 'bg-amber-100 text-amber-700 border-amber-100',
  python: 'bg-blue-50 text-blue-600 border-blue-100',
  typescript: 'bg-blue-50 text-blue-600 border-blue-100',
  sql: 'bg-purple-100 text-purple-700 border-purple-200',
  json: 'bg-green-50 text-green-700 border-green-200',
  plain: 'bg-surface-3 text-ink-3 border-line',
};

export function CodeBlock({
  code,
  language = 'plain',
  filename,
  wrap = false,
  hideCopy = false,
  className = '',
  ...rest
}: CodeBlockProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      },
      () => {
        // Clipboard API blocked (Safari + insecure context). Fallback no-op;
        // user can manually select all & Ctrl+C — text is selectable.
      },
    );
  }, [code]);

  const containerClasses = [
    'group relative bg-surface border border-line rounded-3 overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} {...rest}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border-b border-line">
        <span
          aria-hidden="true"
          className={[
            'inline-flex items-center px-1.5 py-0.5 rounded-1',
            'text-[10px] font-bold uppercase tracking-widest leading-none',
            languageTone[language],
            language === 'bash' ? '' : 'border',
          ].join(' ')}
        >
          {languageLabel[language]}
        </span>
        {filename ? (
          <span className="font-mono text-xs text-ink-3 truncate">{filename}</span>
        ) : null}
        {!hideCopy ? (
          <div className="ml-auto flex items-center gap-2">
            <span aria-live="polite" className="sr-only">
              {copied ? 'Kode tersalin ke clipboard' : ''}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Salin kode"
              className={[
                'inline-flex items-center gap-1 px-2 py-1 rounded-1',
                'text-[11px] font-semibold',
                copied ? 'text-green-700 bg-green-50' : 'text-ink-3 hover:text-ink hover:bg-surface-3',
                'transition-colors duration-hf',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500',
              ].join(' ')}
            >
              <Icon name={copied ? 'check' : 'doc'} size={11} aria-hidden />
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        ) : null}
      </div>
      <pre
        className={[
          'm-0 px-4 py-3 text-xs leading-relaxed text-ink-2',
          'font-mono',
          wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre',
        ].join(' ')}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
