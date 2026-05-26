/**
 * Login form schema — Zod.
 *
 * Contoh canonical pattern: text input (email), password input, boolean checkbox.
 * Aktual login form di apps/web/src/features/auth/ akan re-define di sana
 * (mungkin dengan tambahan TOTP code) — ini hanya reference shape untuk Storybook
 * + LoginPage demo.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter'),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/** Schema untuk Forgot-Password sub-form (di Dialog di LoginPage demo). */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
