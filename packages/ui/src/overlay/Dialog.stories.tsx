/**
 * Dialog.stories — Radix Dialog wrapper dengan focus trap + ESC + click-outside.
 *
 * Compound API: Dialog.Root / Dialog.Trigger / Dialog.Content / Dialog.Header /
 * Dialog.Title / Dialog.Description / Dialog.Footer / Dialog.Close.
 */
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import { Dialog } from './Dialog';
import { Button } from '../form/Button';
import { Input } from '../form/Input';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '../form/FormField';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../form/schemas/login-schema';

const meta = {
  title: 'Overlay/Dialog',
  component: Dialog.Content,
  parameters: {
    docs: {
      description: {
        component:
          'Dialog — modal Radix dengan focus trap, restore-focus-on-close, ESC, dan ' +
          'click-outside. Backdrop blur + animasi fade. Size: sm / md / lg / xl. ' +
          '`showClose=false` untuk dialog tanpa X button (mis. destructive confirm).',
      },
    },
  },
} satisfies Meta<typeof Dialog.Content>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — size md, dengan close button. */
export const Default: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Buka Dialog</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="md">
              <Dialog.Header>
                <Dialog.Title>Selamat datang di Ghanem.one</Dialog.Title>
                <Dialog.Description>
                  Platform Spatial Intelligence untuk hulu migas Indonesia.
                  Lanjut setup profil organisasi Anda.
                </Dialog.Description>
              </Dialog.Header>
              <p className="mt-3 text-sm text-ink-3">
                Tekan ESC, klik backdrop, atau tombol X untuk menutup.
              </p>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Nanti saja</Button>
                </Dialog.Close>
                <Button variant="primary">Lanjut</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Small — max-w-sm. Cocok untuk confirm pendek. */
export const Small: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Dialog Small</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="sm">
              <Dialog.Header>
                <Dialog.Title>Konfirmasi</Dialog.Title>
                <Dialog.Description>Lanjut?</Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Batal</Button>
                </Dialog.Close>
                <Button variant="primary">Ya</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Large — max-w-lg. Untuk konten yang lebih kompleks. */
export const Large: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Dialog Large</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="lg">
              <Dialog.Header>
                <Dialog.Title>Setup MoU Sharing</Dialog.Title>
                <Dialog.Description>
                  Atur permission sharing dataset dengan operator lain.
                </Dialog.Description>
              </Dialog.Header>
              <div className="mt-4 space-y-3">
                <p className="text-sm text-ink-3">
                  Pilih dataset yang ingin di-share + level akses (read /
                  download / annotate). Sharing tunduk pada MoU yang sudah
                  ditandatangani oleh kedua belah pihak.
                </p>
                <ul className="text-sm text-ink-3 list-disc pl-5 space-y-1">
                  <li>Read — view metadata + preview saja</li>
                  <li>Download — full file access</li>
                  <li>Annotate — comment + create derived dataset</li>
                </ul>
              </div>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Batal</Button>
                </Dialog.Close>
                <Button variant="primary">Buat MoU</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Dialog dengan form (Forgot password pattern). */
export const WithForm: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
        mode: 'onBlur',
      });

      return (
        <>
          <Button onClick={() => setOpen(true)}>Lupa password?</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="sm">
              <Dialog.Header>
                <Dialog.Title>Reset Password</Dialog.Title>
                <Dialog.Description>
                  Masukkan email Anda. Kami akan kirim tautan untuk mengatur
                  ulang password.
                </Dialog.Description>
              </Dialog.Header>

              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit((v) => {
                    // eslint-disable-next-line no-console
                    console.info('[Dialog WithForm story]', v);
                    setOpen(false);
                  })}
                  noValidate
                  className="mt-4"
                >
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
                      <Button type="button" variant="secondary">
                        Batal
                      </Button>
                    </Dialog.Close>
                    <Button type="submit" variant="primary">
                      Kirim Tautan
                    </Button>
                  </Dialog.Footer>
                </form>
              </FormProvider>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Destructive — confirm delete pattern, primary button merah, no close X. */
export const Destructive: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button variant="danger" onClick={() => setOpen(true)}>
            Hapus Dataset
          </Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="sm" showClose={false}>
              <Dialog.Header>
                <Dialog.Title>Hapus dataset secara permanen?</Dialog.Title>
                <Dialog.Description>
                  Aksi ini tidak dapat dibatalkan. Semua metadata, file, dan
                  riwayat akses akan hilang.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Batal</Button>
                </Dialog.Close>
                <Button
                  variant="danger"
                  onClick={fn(() => {
                    setOpen(false);
                  })}
                >
                  Hapus permanen
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Scrollable — content panjang dengan internal scroll. */
export const Scrollable: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Baca Syarat & Ketentuan</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content size="lg">
              <Dialog.Header>
                <Dialog.Title>Syarat & Ketentuan Penggunaan</Dialog.Title>
                <Dialog.Description>Versi 2026.1</Dialog.Description>
              </Dialog.Header>
              <div className="mt-4 max-h-72 overflow-y-auto pr-2 text-sm text-ink-3 space-y-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <p key={i}>
                    Pasal {String(i + 1)} — Pengguna setuju bahwa semua dataset
                    yang di-upload tunduk pada regulasi BPMIGAS/SKK Migas dan
                    klasifikasi confidentiality yang berlaku. Pelanggaran dapat
                    menyebabkan revoke akses dan tindakan hukum sesuai UU Migas.
                  </p>
                ))}
              </div>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="primary">Saya Setuju</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};

/** Tanpa close X — caller harus provide explicit close action. */
export const NoCloseButton: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Dialog Tanpa X</Button>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Content showClose={false}>
              <Dialog.Header>
                <Dialog.Title>Penting</Dialog.Title>
                <Dialog.Description>
                  Anda harus memilih salah satu opsi untuk melanjutkan.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="secondary">Opsi A</Button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <Button variant="primary">Opsi B</Button>
                </Dialog.Close>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </>
      );
    };
    return <Demo />;
  },
};
