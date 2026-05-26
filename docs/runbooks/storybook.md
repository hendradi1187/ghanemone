# Runbook — Storybook Workflow (@ghanem/ui)

> **Audience:** Frontend developer + designer reviewer
> **When to use:** Saat menambah komponen baru, mengubah behavior visual, atau review a11y
> **Estimasi waktu:** 5-15 menit per komponen
> **Last updated:** 2026-05-20

Storybook adalah **single source of truth** untuk visual + behavior component library. Setiap komponen yang ported ke `packages/ui` wajib punya story file. Stories di-pakai untuk:

1. **Dokumentasi visual** — designer + reviewer dapat browse variant tanpa run app.
2. **a11y regression catch** — addon-a11y (axe-core) jalan otomatis di setiap story.
3. **Interaction test** — `play()` function memvalidasi user flow (klik, ketik, navigasi keyboard).
4. **Visual regression** (deferred Phase 11) — integration point untuk Chromatic / Percy.

---

## 1. Run Storybook locally

```bash
# Dari root monorepo
cd packages/ui
npm run storybook
# atau dari root:
npm run storybook --workspace=@ghanem/ui
```

Storybook akan listen di `http://localhost:6006`. Hot-reload aktif — edit story / komponen akan refresh otomatis.

### Build static (preview / CI)

```bash
npm run build-storybook --workspace=@ghanem/ui
# output: packages/ui/storybook-static/
```

Static output dapat di-deploy ke Vercel / Netlify / S3 untuk shareable preview, atau integration dengan Chromatic untuk visual regression nanti.

---

## 2. Add a New Story

### Step 1 — Buat file `<Component>.stories.tsx` di samping source

```tsx
// packages/ui/src/<category>/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Category/MyComponent',
  component: MyComponent,
  parameters: {
    docs: {
      description: {
        component: 'Deskripsi komponen dalam Bahasa Indonesia.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
  args: { variant: 'primary' },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
```

### Step 2 — Tambahkan stories minimum

Untuk setiap komponen, minimal include:

- `Default` — render dengan args default
- Variant stories — 1 story per `variant`/`size` value
- State stories — `Disabled`, `Loading`, `WithError` kalau aplikable
- a11y edge case — mis. `IconOnly` butuh `aria-label`

### Step 3 — Tambahkan interaction story (komponen interaktif)

```tsx
import { expect, userEvent, within, fn } from '@storybook/test';

export const ClickInteraction: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /submit/i });
    await userEvent.click(btn);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

### Step 4 — Validasi

1. Buka Storybook lokal (`npm run storybook`)
2. Navigasi ke story baru — render benar?
3. **Buka panel "Accessibility" (bawah)** — 0 violations? Kalau ada, fix sebelum commit.
4. **Buka panel "Interactions"** — kalau ada `play()`, klik "Re-run interactions" — semua step pass?
5. Coba viewport (mobile/tablet/desktop) via toolbar — masih render benar?
6. Coba background switcher (surface-bg / surface / ink) — kontras text masih AA?

---

## 3. a11y Check Workflow

### Panel a11y di Storybook

Setiap story otomatis di-evaluasi oleh axe-core. Panel "Accessibility" menampilkan:

- **Violations** (merah) — wajib fix sebelum merge
- **Passes** (hijau) — rule yang lulus
- **Incomplete** (kuning) — axe tidak yakin; investigate manual
- **Inapplicable** — rule tidak relevan untuk komponen ini

### Common violations + remediasi

| Rule | Penyebab umum | Fix |
|------|---------------|-----|
| `color-contrast` | text < 4.5:1 vs background | Pakai token `text-ink-2` di atas `bg-surface` (4.5:1+). Hindari `text-ink-5` di atas `bg-surface-2` (gagal AA). |
| `button-name` | `<button>` tanpa text + aria-label | Untuk icon-only button, pass `aria-label="..."` |
| `aria-required-attr` | RadioGroup/Combobox tanpa `aria-required` | Pakai FormField (auto) atau pass manual |
| `label` | input tanpa label | Pakai FormField, atau native `<label htmlFor={id}>` |
| `landmark-one-main` | page tanpa `<main>` | Render landmark via `Container as="main"` |
| `region` | content di luar landmark | Wrap dengan `Container as="section" aria-label="..."` |

### Cek manual yang TIDAK ter-cover axe

axe-core menangkap ~30-40% issue WCAG. Cek manual yang masih perlu:

- **Keyboard nav** — Tab through komponen, semua focusable? Focus visible (ring)?
- **Screen reader** — Pakai NVDA (Windows) / VoiceOver (Mac). Cek announce label + state.
- **Reduced motion** — Toggle "prefers-reduced-motion" di OS, animation di-skip?
- **Zoom 200%** — Layout tetap usable?

Untuk komponen kritis (Dialog, FormField), cek manual sebelum merge.

---

## 4. Visual Regression Integration (Deferred Phase 11)

Saat ini visual regression manual via Storybook preview. Phase 11 akan integrate Chromatic atau Percy:

```bash
# Future workflow (Phase 11)
npm run chromatic --workspace=@ghanem/ui
# Chromatic upload + diff vs baseline; PR comment dengan link review
```

Integration point sudah siap:

- `build-storybook` script produces static output di `packages/ui/storybook-static/`
- Story title format (`Category/Component`) consistent untuk grouping
- a11y addon sudah aktif — Chromatic dapat fail PR kalau ada new violation

---

## 5. Troubleshooting

### "Cannot find module '@ghanem/config/tailwind-base'"

Pastikan `npm install` sudah jalan di root monorepo. `@ghanem/config` adalah workspace package — symlink via npm workspaces.

### Tailwind classes tidak ter-apply di Storybook canvas

1. Cek `packages/ui/tailwind.config.ts` — `content` glob include `./src/**/*.{ts,tsx}`?
2. Cek `packages/ui/postcss.config.cjs` ada (postcss harus pickup tailwind plugin)
3. Restart Storybook (`npm run storybook`) — cache PostCSS kadang stale.

### Stories tidak muncul di sidebar

Cek glob di `.storybook/main.ts`: `stories: ['../src/**/*.stories.@(ts|tsx|mdx)']`. File baru harus match pattern + extension.

### Radix component (Dialog/Tooltip) crash di story

TooltipProvider sudah di-mount global via `preview.ts`. Tapi beberapa Radix Tooltip butuh provider di setiap subtree. Kalau crash, wrap story manual:

```tsx
import { TooltipProvider } from '../overlay/Tooltip';
decorators: [(Story) => <TooltipProvider><Story /></TooltipProvider>]
```

### a11y panel kosong / "no violations" tapi tahu ada issue

axe-core skip rule kalau elemen di-hidden via `display:none`. Pastikan story render visible state — jangan wrap dengan `hidden` attribute.

---

## 6. Story Quality Bar (Reviewer Checklist)

Saat review PR yang menambah/ubah story, cek:

- [ ] Story title pakai format `Category/Component`
- [ ] Description komponen dalam Bahasa Indonesia
- [ ] Minimal punya `Default` story
- [ ] Setiap `variant`/`size` value punya story dedicated atau ada `Sizes`/`Variants` composite story
- [ ] State stories: `Disabled`, `Loading`, `WithError` kalau prop ada
- [ ] Komponen interaktif (form, button, dialog): minimal 1 interaction story dengan `play()`
- [ ] Setiap story render tanpa axe violation (cek panel a11y)
- [ ] Setiap story render benar di 3 background (surface-bg / surface / ink)
- [ ] Setiap story render benar di mobile (375) viewport
- [ ] `argTypes` di-define untuk prop yang controllable (variant, size, boolean)
- [ ] Tidak ada hardcoded color hex — semua via Tailwind token class

---

## Related

- `packages/ui/README.md` — component index + conventions
- `packages/ui/.storybook/` — config (main.ts, preview.ts, preview.css)
- `docs/component-map.md` — prototype HTML → React component mapping
- `docs/decisions/` — ADR untuk design system decisions
