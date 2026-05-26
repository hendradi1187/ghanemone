# @ghanem/ui

Shared React component library (design system) untuk Ghanem.one web + admin apps. Stories-driven (Storybook 8) dengan a11y panel (axe-core) di setiap component.

> **Status:** Phase 8 Foundation — final piece (Storybook setup). Komponen ported lengkap; integrasi feature-level (PageMap, Seismic, AI Chat) hidup di `apps/web` (Phase 8.5).

---

## Quick Start

```bash
# Dari root monorepo
npm install            # install dependencies (sekali)
npm run storybook --workspace=@ghanem/ui   # buka di http://localhost:6006

# Atau dari packages/ui langsung
cd packages/ui
npm run storybook
```

Build static Storybook (untuk preview / Chromatic later):

```bash
npm run build-storybook  # output ke packages/ui/storybook-static/
```

---

## Component Index

Setiap komponen punya story file co-located (`*.stories.tsx`). Klik judul untuk lihat source.

### Form (RHF + Zod + Radix)

| Component | Path | Stories |
|-----------|------|---------|
| Button | `src/form/Button.tsx` | Primary / Secondary / Ghost / Danger / WithLeftIcon / WithRightIcon / Loading / Disabled / Sizes / FullWidth / IconOnly / ClickInteraction |
| Input | `src/form/Input.tsx` | Default / WithLabel / WithHint / WithError / WithLeftSlot / WithRightSlot / Sizes / Disabled / ReadOnly / Password / Email / TypingInteraction |
| Textarea | `src/form/Textarea.tsx` | Default / WithLabel / WithError / Sizes / Disabled / LongContent / TypingInteraction |
| Checkbox | `src/form/Checkbox.tsx` | Default / Checked / Indeterminate / Disabled / WithError / Sizes / ToggleInteraction |
| RadioGroup | `src/form/RadioGroup.tsx` | Vertical / Horizontal / WithError / Disabled / KeyboardInteraction |
| Select | `src/form/Select.tsx` | Default / WithGroups / WithError / Disabled / LongList / WithSeparator / OpenAndSelect |
| FormField | `src/form/FormField.tsx` | WithRHF (integrasi RHF + Zod) / RenderPropPattern |

### Primitives

| Component | Path | Stories |
|-----------|------|---------|
| Stack | `src/primitives/Stack.tsx` | Vertical / Horizontal / Gap / AlignItems / JustifyContent / Wrap / Polymorphic |
| Card | `src/primitives/Card.tsx` | Flat / Elevation1 / Elevation2 / Elevation3 / WithHeader / Interactive |
| Container | `src/primitives/Container.tsx` | Default / Narrow / Wide |
| Page | `src/primitives/Page.tsx` | Default / WithScroll |
| Divider | `src/primitives/Divider.tsx` | Horizontal / Vertical / WithLabel |

### Icon

| Component | Path | Stories |
|-----------|------|---------|
| Icon | `src/icon/Icon.tsx` | AllIcons (catalog 41) / Sizes / Colors / WithTitle |

### Nav

| Component | Path | Stories |
|-----------|------|---------|
| TopNav | `src/nav/TopNav.tsx` | Default / WithActiveRoute / WithNotifications / WithSearch |
| Sidebar | `src/nav/Sidebar.tsx` | Browse / Categories / Providers / Combined / WithActiveItem |

### Overlays (Radix)

| Component | Path | Stories |
|-----------|------|---------|
| Dialog | `src/overlay/Dialog.tsx` | Default / Small / Large / WithForm / Destructive / Scrollable / NoCloseButton |
| Popover | `src/overlay/Popover.tsx` | Default / Positioned / WithArrow |
| DropdownMenu | `src/overlay/DropdownMenu.tsx` | Default / WithCheckbox / WithRadio / WithSubmenu / WithSeparators / Destructive |
| Tooltip | `src/overlay/Tooltip.tsx` | Default / LongDelay / MultiLine / OnIconButton |

### Feedback

| Component | Path | Stories |
|-----------|------|---------|
| Toast | `src/feedback/Toast.tsx` | Success / Error / Warning / Info / WithDescription / WithAction / Persistent |

---

## Conventions

### File structure

```
packages/ui/src/
  <category>/
    Component.tsx              ← source
    Component.stories.tsx      ← stories (co-located)
    index.ts                   ← barrel export
```

Aturan keras:
- **Story file di samping source** (Storybook 8 convention). Memudahkan locating + commit hygiene (perubahan komponen + story update dalam satu PR).
- **TypeScript strict** — `any` hanya boleh dengan `// reason:` comment yang menjelaskan.
- **No deep imports** dari consumer apps — selalu via `import { ... } from '@ghanem/ui'`.

### Naming

- Komponen + types: PascalCase (`Button`, `ButtonProps`, `ButtonVariant`).
- Story identifier: PascalCase (`Primary`, `WithError`, `IconOnly`).
- Story description (di `parameters.docs.description`): **Bahasa Indonesia**.
- Story title: `Category/Component` (e.g. `Form/Button`, `Overlay/Dialog`).

### a11y requirements

- **Setiap story wajib lulus axe-core WCAG 2.1 AA** (panel "Accessibility" di Storybook). Color contrast aktif.
- Icon-only buttons: pass `aria-label`. Story `IconOnly` di Button.stories adalah reference.
- Form fields: gunakan `FormField` wrapper supaya `aria-describedby` auto-wired. Untuk standalone, pass `aria-describedby` manual.
- Error messages: `role="alert"` + `aria-live="polite"` — sudah otomatis di `FormError`.

### Tailwind tokens

Semua color / spacing / radius / shadow di-derive dari `@ghanem/config/tailwind-base`. **Jangan hardcode hex / rem values** di komponen atau stories — selalu via token class (mis. `bg-surface-bg`, bukan `bg-[#f7f5f0]`).

---

## Adding a New Component

1. Buat `Component.tsx` di kategori yang sesuai (`form/`, `primitives/`, `overlay/`, dll.).
2. Buat `Component.stories.tsx` co-located. Minimal:
   - Default story
   - Variant stories (kalau ada `variant`/`size` prop)
   - Error/disabled state (kalau aplikable)
   - At least 1 interaction story (`play()` function) untuk komponen interaktif
3. Update barrel `index.ts` di kategori + root `src/index.ts`.
4. Cek a11y panel — 0 violations.
5. Update README di atas (tabel index).

Lihat `docs/runbooks/storybook.md` untuk full workflow.

---

## Related Docs

- `docs/runbooks/storybook.md` — workflow Storybook + a11y check
- `docs/component-map.md` — mapping prototype HTML → React components
- `docs/decisions/` — ADR untuk design system decisions
- `packages/config/tailwind-base.ts` — design tokens single-source-of-truth
