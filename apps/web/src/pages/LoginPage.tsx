/**
 * LoginPage — public route `/login`.
 *
 * Phase 8.6 update:
 *   - Hook ke `useAuth().login(email, password)` (mock implementation di
 *     `stores/auth-store.ts`).
 *   - Pada login sukses, redirect ke `location.state.from` (jika datang dari
 *     ProtectedRoute) atau `/` sebagai default.
 *   - Saat user sudah ter-autentikasi (e.g., buka /login dengan session aktif),
 *     redirect-immediate ke `/`.
 *   - Footer hint kredensial demo.
 *
 * Integrasi yang dijaga dari Phase 8.3:
 *   - RHF + Zod (`loginSchema`)
 *   - Forgot-Password dialog
 *   - Tooltip + Toast + Checkbox + FormField
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Controller,
  Dialog,
  FormField,
  FormProvider,
  Icon,
  Input,
  Stack,
  Tooltip,
  loginSchema,
  forgotPasswordSchema,
  toast,
  useForm,
  zodResolver,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type SubmitHandler,
} from '@ghanem/ui';
import { useAuth } from '../hooks/use-auth';

/** Shape state yang AuthGuard kirim saat redirect. */
interface LoginLocationState {
  from?: { pathname: string; search?: string };
}

/** Simulate async network call (untuk ForgotPassword sub-form yang belum live). */
async function mockApiCall(ms = 600): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function LoginPage(): JSX.Element {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pre-empt: user sudah login → langsung redirect.
  // Pakai conditional element instead of useEffect untuk avoid flicker.
  const stateFrom = (location.state as LoginLocationState | null)?.from;
  const fromPath = stateFrom ? `${stateFrom.pathname}${stateFrom.search ?? ''}` : '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onBlur',
  });

  // reason: bila login berhasil di tab lain (storage event nanti / multi-tab),
  // state berubah → kita ingin auto-navigate. useEffect tetap dipakai untuk
  // sinkronisasi pasca-render.
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, fromPath, navigate]);

  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />;
  }

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toast.success('Login berhasil', {
        description: `Selamat datang, ${values.email}`,
      });
      // navigate akan triggered by useEffect once store updated; tapi panggil
      // di sini supaya UX instant.
      navigate(fromPath, { replace: true });
      form.reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login gagal — periksa kredensial';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-bg p-4">
      <div className="w-full max-w-md bg-surface border border-line rounded-3 shadow-2 p-6">
        <Stack direction="col" gap="2" className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-h2 font-semibold font-display text-ink">
              Masuk ke Ghanem.one
            </h1>
            <Tooltip content="Platform Spatial Intelligence — gunakan email SKK Migas atau KKKS.">
              <button
                type="button"
                aria-label="Bantuan login"
                className="inline-flex h-6 w-6 items-center justify-center rounded-pill text-ink-4 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              >
                <Icon name="help" size={14} aria-hidden="true" />
              </button>
            </Tooltip>
          </div>
          <p className="text-sm text-ink-4">
            Spatial Intelligence Platform untuk hulu migas Indonesia.
          </p>
        </Stack>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Stack direction="col" gap="4">
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

              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked === true);
                    }}
                    label="Ingat saya di perangkat ini"
                  />
                )}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                fullWidth
              >
                Masuk
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                  }}
                  className="text-sm text-green-700 hover:text-green-500 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 rounded-1"
                >
                  Lupa password?
                </button>
              </div>
            </Stack>
          </form>
        </FormProvider>

        <div className="mt-6 pt-4 border-t border-line text-xs text-ink-4">
          <p className="font-semibold text-ink-3 mb-1">Demo kredensial (Phase 8 mock):</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>
              Email apa saja yang valid (mis. <b>citra@skkmigas.go.id</b>)
            </li>
            <li>Password minimal 8 karakter (mis. <b>password123</b>)</li>
          </ul>
        </div>

        <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
      </div>
    </main>
  );
}

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps): JSX.Element {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (values) => {
    setSubmitting(true);
    try {
      await mockApiCall(600);
      // eslint-disable-next-line no-console
      console.info('[ForgotPassword demo] submit', values);
      toast.info('Tautan reset password telah dikirim ke email Anda (mock).', {
        description: values.email,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Reset Password</Dialog.Title>
          <Dialog.Description>
            Masukkan email Anda. Kami akan kirim tautan untuk mengatur ulang password.
          </Dialog.Description>
        </Dialog.Header>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-4">
            <FormField<ForgotPasswordFormValues>
              name="email"
              label="Email"
              required
            >
              <Input
                type="email"
                placeholder="nama@skkmigas.go.id"
                autoComplete="username"
              />
            </FormField>

            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button type="button" variant="secondary" disabled={submitting}>
                  Batal
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" loading={submitting}>
                Kirim Tautan
              </Button>
            </Dialog.Footer>
          </form>
        </FormProvider>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default LoginPage;
