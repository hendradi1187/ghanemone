/**
 * FormField.stories — story integrasi RHF + Zod.
 *
 * FormField butuh `<FormProvider>` di parent. Story `WithRHF` mendemonstrasikan
 * full stack: zodResolver → useForm → FormProvider → FormField → Input.
 * Panel "form state" di samping menampilkan errors + values realtime supaya
 * reviewer dapat melihat efek validasi onBlur.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { FormField } from './FormField';
import { FormProvider, useForm, useFormState, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './Input';
import { Button } from './Button';
import { loginSchema, type LoginFormValues } from './schemas/login-schema';

const meta = {
  title: 'Form/FormField',
  component: FormField,
  parameters: {
    docs: {
      description: {
        component:
          'FormField — orchestrator yang wires label + control + hint + error. Auto-generate ' +
          'id, `aria-describedby`, dan `aria-invalid`. Harus di-dalam `<FormProvider>`. ' +
          'Untuk Input/Textarea: pass element langsung sebagai child. Untuk Radix controlled ' +
          'components (Checkbox/Select/RadioGroup): pakai render-prop yang menerima ControllerRenderProps.',
      },
    },
  },
} satisfies Meta<typeof FormField>;

export default meta;
// reason: render-only stories tidak butuh args dari meta (FormField requires name/label/children
// yang di-supply via render function). StoryObj<typeof FormField> loosens args requirement.
type Story = StoryObj<typeof FormField>;

/**
 * Story canonical — login form via Zod + RHF. Onblur validation aktif.
 * Side panel tampilkan errors + values supaya reviewer dapat mengevaluasi
 * a11y wiring (aria-describedby, aria-invalid, role=alert).
 */
export const WithRHF: Story = {
  render: () => {
    function Demo(): JSX.Element {
      const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
        mode: 'onBlur',
      });

      return (
        <div className="flex gap-6">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit((v) => {
                // reason: log values untuk verifikasi via Action panel; tidak
                // ada side-effect lain.
                // eslint-disable-next-line no-console
                console.info('[FormField story] submit', v);
              })}
              noValidate
              className="flex flex-col gap-4 w-80"
            >
              <FormField<LoginFormValues>
                name="email"
                label="Email"
                hint="Pakai email organisasi (mis. user@skkmigas.go.id)"
                required
              >
                <Input
                  type="email"
                  placeholder="nama@skkmigas.go.id"
                  autoComplete="username"
                />
              </FormField>

              <FormField<LoginFormValues>
                name="password"
                label="Password"
                hint="Minimal 8 karakter"
                required
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </FormField>

              <Button type="submit" variant="primary">
                Submit
              </Button>
            </form>
          </FormProvider>

          <FormStatePanel form={form} />
        </div>
      );
    }
    return <Demo />;
  },
  /**
   * Interaction — type invalid email, blur, expect error muncul dengan
   * `role=alert` (di-pickup screen reader live region).
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText(
      'nama@skkmigas.go.id',
    ) as HTMLInputElement;
    await userEvent.type(emailInput, 'invalid');
    await userEvent.tab(); // blur

    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent(/email tidak valid/i);
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  },
};

/**
 * Render-prop variant — FormField dengan children sebagai function. Untuk
 * Radix controlled components (Checkbox/RadioGroup/Select) yang butuh
 * Controller wiring.
 */
export const RenderPropPattern: Story = {
  render: () => {
    function Demo(): JSX.Element {
      const form = useForm<{ agree: boolean }>({
        defaultValues: { agree: false },
      });
      return (
        <FormProvider {...form}>
          <form className="w-80">
            <FormField<{ agree: boolean }>
              name="agree"
              label="Saya menyetujui Syarat & Ketentuan"
              required
            >
              {(field) => (
                <input
                  type="checkbox"
                  id="agree-cb"
                  checked={field.value as boolean}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4"
                />
              )}
            </FormField>
          </form>
        </FormProvider>
      );
    }
    return <Demo />;
  },
};

/* ─── Helpers ──────────────────────────────────────────────────────────── */

interface FormStatePanelProps {
  form: ReturnType<typeof useForm<LoginFormValues>>;
}

/**
 * Panel debug — menampilkan form state realtime via useFormState + useWatch.
 * Hanya untuk story; jangan dipakai di production.
 */
function FormStatePanel({ form }: FormStatePanelProps): JSX.Element {
  const { errors, isDirty, isValid } = useFormState({ control: form.control });
  const values = useWatch({ control: form.control });

  return (
    <aside className="w-72 p-3 bg-surface-2 border border-line rounded-2 text-xs font-mono">
      <p className="font-semibold text-ink mb-2">Form State</p>
      <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
        <dt className="text-ink-4">isDirty</dt>
        <dd>{String(isDirty)}</dd>
        <dt className="text-ink-4">isValid</dt>
        <dd>{String(isValid)}</dd>
      </dl>
      <p className="mt-3 font-semibold text-ink">Values</p>
      <pre className="text-[10px] text-ink-3 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(values, null, 2)}
      </pre>
      <p className="mt-3 font-semibold text-ink">Errors</p>
      <pre className="text-[10px] text-red-700 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(errors).map(([k, v]) => [
              k,
              (v as { message?: string })?.message ?? '—',
            ]),
          ),
          null,
          2,
        )}
      </pre>
    </aside>
  );
}
