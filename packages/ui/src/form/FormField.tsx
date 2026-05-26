/**
 * FormField — orchestrator yang wires label + control + hint + error.
 *
 * Read RHF context (must be inside <FormProvider>) untuk dapat error state
 * dari `useFormState`. Generate id deterministik dari `name` supaya
 * `aria-describedby` association reliable.
 *
 * Pattern dipakai:
 *   <FormProvider {...form}>
 *     <FormField name="email" label="Email" required hint="…">
 *       <Input type="email" placeholder="…" />
 *     </FormField>
 *   </FormProvider>
 *
 * Atau render-prop untuk control yang butuh Controller (Checkbox, Select, RadioGroup):
 *   <FormField name="agree" label="Saya setuju">
 *     {(field) => (
 *       <Checkbox checked={field.value} onCheckedChange={field.onChange} />
 *     )}
 *   </FormField>
 *
 * Children Input/Textarea direct: FormField pakai `register(name)` dan inject
 * id + aria-* via cloneElement. Untuk Radix control yang controlled, pakai
 * render-prop form (terima ControllerRenderProps).
 */
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  useFormContext,
  Controller,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { FormLabel } from './FormLabel';
import { FormHint } from './FormHint';
import { FormError } from './FormError';

export interface FormFieldProps<TFieldValues extends FieldValues> {
  /** RHF field name path. Generic-typed lewat caller, default permissive. */
  name: Path<TFieldValues>;
  /** Label text — wajib (untuk a11y, jangan optional). */
  label: string;
  /** Helper text di bawah field. */
  hint?: string;
  /** Mark sebagai required — menampilkan asterisk + meneruskan `aria-required`. */
  required?: boolean;
  /** ID prefix override — default `field-<name>`. */
  id?: string;
  /** ClassName untuk wrapper Stack. */
  className?: string;
  /**
   * Children:
   *   - ReactElement: di-clone dengan `register(name)` (Input, Textarea — uncontrolled native).
   *   - Render-prop: terima ControllerRenderProps untuk Radix/controlled components.
   */
  children:
    | ReactElement
    | ((field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>) => ReactNode);
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  required = false,
  id,
  className = '',
  children,
}: FormFieldProps<TFieldValues>): JSX.Element {
  const ctx = useFormContext<TFieldValues>();
  if (!ctx) {
    throw new Error(
      `FormField "${String(name)}" harus berada di dalam <FormProvider {...form}>. ` +
        'Lihat docs/component-map.md §FormField untuk contoh penggunaan RHF.',
    );
  }

  const fieldId = id ?? `field-${String(name).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = `${fieldId}-error`;

  // Subscribe error state hanya untuk field ini (perf optimization).
  // reason: errors di-key by `name` (Path<T>); akses dynamic memerlukan cast karena
  // FieldErrors<T> typing depend on T structure. Validate shape sebelum read message.
  const errorsRecord = ctx.formState.errors as Record<string, unknown>;
  const error = errorsRecord[name as string];
  const errorMessage =
    error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
      ? (error as { message: string }).message
      : undefined;
  const hasError = Boolean(errorMessage);

  // Compose aria-describedby — gabungkan hint id + error id (kalau ada).
  const describedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const wrapperClasses = ['flex flex-col gap-1.5', className].filter(Boolean).join(' ');

  // Render-prop variant — pakai Controller supaya field state synced
  if (typeof children === 'function') {
    const renderFn = children;
    return (
      <div className={wrapperClasses}>
        <FormLabel htmlFor={fieldId} required={required}>
          {label}
        </FormLabel>
        <Controller
          control={ctx.control}
          name={name}
          render={({ field }) => <>{renderFn(field)}</>}
        />
        {hint ? <FormHint id={hintId}>{hint}</FormHint> : null}
        {hasError ? <FormError id={errorId}>{errorMessage}</FormError> : null}
      </div>
    );
  }

  // Direct element variant — clone + inject register + aria
  if (!isValidElement(children)) {
    throw new Error(
      `FormField "${String(name)}" children harus ReactElement atau render function.`,
    );
  }

  // Spread RHF register props ke child. Child must accept ref + name + onChange + onBlur.
  // reason: cloneElement props typing too dynamic untuk strict generics; runtime tetap valid.
  // Children props (placeholder, autoComplete, type, dll.) di-preserve via spread `existingProps`.
  const registerProps = ctx.register(name as Path<TFieldValues>);
  const existingProps = (children.props ?? {}) as Record<string, unknown>;
  const mergedProps: Record<string, unknown> = {
    ...existingProps,
    id: fieldId,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
    invalid: hasError,
    // RHF wiring HARUS menang dari user-supplied — jangan biarkan caller pasang
    // onChange manual yang break form state. Set di akhir setelah existingProps spread.
    name: registerProps.name,
    ref: registerProps.ref,
    onChange: registerProps.onChange,
    onBlur: registerProps.onBlur,
  };
  const childWithProps = cloneElement(children, mergedProps);

  return (
    <div className={wrapperClasses}>
      <FormLabel htmlFor={fieldId} required={required}>
        {label}
      </FormLabel>
      {childWithProps}
      {hint ? <FormHint id={hintId}>{hint}</FormHint> : null}
      {hasError ? <FormError id={errorId}>{errorMessage}</FormError> : null}
    </div>
  );
}
