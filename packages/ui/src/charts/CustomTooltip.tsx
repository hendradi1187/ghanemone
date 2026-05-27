/**
 * CustomTooltip — branded Recharts tooltip component.
 *
 * Menggantikan default Recharts tooltip box dengan tampilan yang sesuai dengan
 * design system Ghanem.one:
 *   - Background surface putih dengan border line token
 *   - Font Inter (bukan browser default)
 *   - Spacing dan radius dari design tokens
 *   - Color-coded dot per series (match series color)
 *
 * Dipakai via: `<Tooltip content={<CustomTooltip />} />`
 *
 * Recharts memanggil komponen ini dengan props `active`, `payload`, `label` —
 * semua di-receive via spread oleh Recharts internally.
 */
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { colorTokens, fontFamilyTokens } from '../tokens';

export type CustomTooltipProps = TooltipProps<ValueType, NameType>;

export function CustomTooltip({ active, payload, label }: CustomTooltipProps): JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      role="tooltip"
      style={{
        backgroundColor: colorTokens.surface.DEFAULT,
        border: `1px solid ${colorTokens.line.DEFAULT}`,
        borderRadius: 8,
        padding: '8px 12px',
        boxShadow: '0 4px 14px rgba(14,23,38,.08)',
        fontFamily: fontFamilyTokens.sans,
        minWidth: 120,
      }}
    >
      {label !== undefined && label !== '' ? (
        <p
          style={{
            color: colorTokens.ink[3],
            fontSize: 11,
            fontWeight: 600,
            margin: '0 0 6px',
            letterSpacing: '-0.005em',
          }}
        >
          {String(label)}
        </p>
      ) : null}
      {payload.map((entry, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 0',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: entry.color ?? colorTokens.green[500],
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: colorTokens.ink[3],
              fontSize: 11,
              flexShrink: 0,
            }}
          >
            {entry.name}
          </span>
          <span
            style={{
              color: colorTokens.ink.DEFAULT,
              fontSize: 12,
              fontWeight: 600,
              marginLeft: 'auto',
              paddingLeft: 8,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('id-ID')
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}
