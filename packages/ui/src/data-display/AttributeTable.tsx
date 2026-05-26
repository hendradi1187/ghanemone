/**
 * AttributeTable — schema table untuk menampilkan kolom/atribut dataset.
 *
 * Fitur:
 *   - Sort by `name` atau `type` (toggle asc/desc via click header)
 *   - Filter realtime via search input (cocok nama atau deskripsi)
 *   - Empty state inline ketika filter tidak match / array kosong
 *   - Type chip dengan warna per tipe (string/number/date/geometry)
 *   - Nullable badge "Nullable" untuk kolom yang boleh null
 *
 * A11y:
 *   - Tabel pakai `<table>` semantic dengan `<thead>` / `<tbody>` proper
 *   - Header sortable: `<button aria-sort="ascending|descending|none">`
 *   - Empty state pakai `role="status"`
 *   - Search input punya `<label>` (visually-hidden untuk kompak)
 */
import { useId, useMemo, useState, type HTMLAttributes } from 'react';
import { Icon } from '../icon';

export type AttributeFieldType = 'string' | 'number' | 'date' | 'geometry';

export interface AttributeRow {
  name: string;
  type: AttributeFieldType;
  description: string;
  nullable: boolean;
  example: string;
}

export interface AttributeTableProps extends HTMLAttributes<HTMLDivElement> {
  /** Array atribut/kolom yang akan dirender. */
  attributes: AttributeRow[];
  /** Optional initial sort field. Default `name`. */
  defaultSortBy?: 'name' | 'type';
  /** Hide search row (untuk tabel pendek). Default false. */
  hideSearch?: boolean;
}

const typeTone: Record<AttributeFieldType, string> = {
  string: 'bg-blue-50 text-blue-600 border-blue-100',
  number: 'bg-green-50 text-green-700 border-green-200',
  date: 'bg-amber-100 text-amber-700 border-amber-100',
  geometry: 'bg-purple-100 text-purple-700 border-purple-200',
};

type SortField = 'name' | 'type';
type SortDir = 'asc' | 'desc';

export function AttributeTable({
  attributes,
  defaultSortBy = 'name',
  hideSearch = false,
  className = '',
  ...rest
}: AttributeTableProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>(defaultSortBy);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const searchId = useId();

  const rows = useMemo(() => {
    const needle = query.toLowerCase().trim();
    let filtered = needle
      ? attributes.filter(
          (a) =>
            a.name.toLowerCase().includes(needle) ||
            a.description.toLowerCase().includes(needle) ||
            a.type.toLowerCase().includes(needle),
        )
      : [...attributes];
    filtered.sort((a, b) => {
      const cmp = sortBy === 'name' ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return filtered;
  }, [attributes, query, sortBy, sortDir]);

  const toggleSort = (field: SortField): void => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const containerClasses = ['flex flex-col gap-3', className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...rest}>
      {!hideSearch ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-line-2 rounded-2 focus-within:border-green-500 focus-within:shadow-focus transition-colors duration-hf max-w-md">
          <Icon name="search" size={13} className="text-ink-4" aria-hidden />
          <label htmlFor={searchId} className="sr-only">
            Cari atribut
          </label>
          <input
            id={searchId}
            type="search"
            placeholder="Cari atribut atau deskripsi…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-0 border-0 text-sm text-ink placeholder:text-ink-5"
          />
        </div>
      ) : null}

      <div className="overflow-x-auto border border-line rounded-3 bg-surface">
        <table className="w-full text-sm border-collapse" role="table">
          <thead className="bg-surface-2 text-left">
            <tr className="border-b border-line">
              <SortHeader
                label="Nama"
                field="name"
                activeField={sortBy}
                dir={sortDir}
                onToggle={toggleSort}
              />
              <SortHeader
                label="Tipe"
                field="type"
                activeField={sortBy}
                dir={sortDir}
                onToggle={toggleSort}
              />
              <th scope="col" className="px-3 py-2 font-semibold text-ink-3 text-xs uppercase tracking-cap">
                Deskripsi
              </th>
              <th scope="col" className="px-3 py-2 font-semibold text-ink-3 text-xs uppercase tracking-cap whitespace-nowrap">
                Nullable
              </th>
              <th scope="col" className="px-3 py-2 font-semibold text-ink-3 text-xs uppercase tracking-cap">
                Contoh
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div
                    role="status"
                    className="flex flex-col items-center justify-center gap-2 py-10 text-ink-4 text-sm"
                  >
                    <Icon name="database" size={28} className="text-ink-5" aria-hidden />
                    <span>
                      {attributes.length === 0
                        ? 'Belum ada atribut yang didefinisikan.'
                        : `Tidak ada atribut cocok untuk "${query}".`}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.name} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                  <td className="px-3 py-2 font-mono text-xs text-ink whitespace-nowrap">{row.name}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        'inline-flex items-center px-1.5 py-0.5 rounded-1 border',
                        'text-[10.5px] font-semibold uppercase tracking-widest leading-none',
                        typeTone[row.type],
                      ].join(' ')}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-2">{row.description}</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {row.nullable ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Icon name="check" size={11} aria-hidden /> Ya
                      </span>
                    ) : (
                      <span className="text-ink-4">Tidak</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-ink-3 truncate max-w-[14rem]">
                    {row.example}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-4">
        Menampilkan{' '}
        <span className="num font-medium">{rows.length.toLocaleString('id-ID')}</span> dari{' '}
        <span className="num font-medium">{attributes.length.toLocaleString('id-ID')}</span> atribut.
      </p>
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  activeField: SortField;
  dir: SortDir;
  onToggle: (field: SortField) => void;
}

function SortHeader({ label, field, activeField, dir, onToggle }: SortHeaderProps): JSX.Element {
  const isActive = activeField === field;
  const ariaSort: 'ascending' | 'descending' | 'none' = isActive
    ? dir === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  return (
    <th scope="col" aria-sort={ariaSort} className="px-3 py-2 font-semibold text-ink-3 text-xs uppercase tracking-cap whitespace-nowrap">
      <button
        type="button"
        onClick={() => onToggle(field)}
        className={[
          'inline-flex items-center gap-1 cursor-pointer',
          'hover:text-ink transition-colors duration-hf',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1 px-0.5',
          isActive ? 'text-ink' : 'text-ink-3',
        ].join(' ')}
      >
        {label}
        <Icon
          name={isActive ? (dir === 'asc' ? 'arrowUp' : 'arrowDown') : 'chevron'}
          size={10}
          aria-hidden
          className={isActive ? '' : 'opacity-40'}
        />
      </button>
    </th>
  );
}
