# Phase 8 Foundation — Smoke Test Runbook

**Tujuan:** Verify ~9K LOC dari Phase 8 Foundation (Tasks #12-16) actually compile + run sebelum lanjut port 11 pages.

**Waktu estimasi:** 20-30 menit (kalau lancar). Plus 1-2 jam kalau ada error yang perlu debug.

**Prerequisites:**
- Node.js 20.x (lihat `.nvmrc`) — install via `nvm install 20 && nvm use 20`
- Git access ke workspace
- ~2GB disk untuk `node_modules`
- Browser modern (Chrome/Firefox/Safari)

---

## Step 1 — Install Dependencies

```powershell
cd D:\app\ghanemone\workspace
node --version    # confirm 20.x
npm --version     # confirm 10.x atau 9.x

npm install
```

**Expected output:**
- Process berjalan 2-5 menit tergantung koneksi
- Warning OK, tapi NO ERROR
- `node_modules/` muncul di root + apps/* + packages/*
- `package-lock.json` ter-generate atau ter-update di root

**Common failures:**

| Error | Likely cause | Fix |
|---|---|---|
| `npm ERR! ERESOLVE could not resolve` | Peer dep conflict (Radix vs React 18) | `npm install --legacy-peer-deps` |
| `EACCES` permission denied | Windows file permission | Run PowerShell as Administrator |
| `Network timeout` | Firewall blocking npm registry | Confirm `registry.npmjs.org` accessible |
| `Cannot find module '@ghanem/config'` | Workspace symlink failed | `rm -rf node_modules apps/*/node_modules packages/*/node_modules && npm install` |

**Stop here jika install fail.** Report error message + last 20 lines log ke Claude.

---

## Step 2 — TypeScript Strict Check

```powershell
# Check apps/web compiles dengan strict TS
cd D:\app\ghanemone\workspace\apps\web
npx tsc --noEmit

# Check apps/admin
cd D:\app\ghanemone\workspace\apps\admin
npx tsc --noEmit

# Check packages/ui
cd D:\app\ghanemone\workspace\packages\ui
npx tsc --noEmit
```

**Expected output:**
- Zero errors per command
- Process exits dengan code 0

**Common failures:**

| Error | Likely cause | Action |
|---|---|---|
| `Cannot find module '@ghanem/ui'` | Path alias di tsconfig missing | Confirm `paths` di `tsconfig.json` per app references `../../packages/ui/src` |
| `Type 'X' is not assignable` | Strict mode catching agent mistake | Report ke Claude — saya akan fix |
| `Cannot find name 'process'` | Missing `@types/node` | Add to devDeps |
| `'aria-relevant' does not exist on type` | React types version mismatch | Confirm `@types/react ^18.x` |

Catat semua TS errors → report ke Claude.

---

## Step 3 — Web Dev Server

```powershell
cd D:\app\ghanemone\workspace\apps\web
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Buka `http://localhost:5173/` di browser.

### Visual Smoke Tests — LoginPage

**Test 3.1 — Page renders:**
- ✅ LoginPage muncul dengan logo + form
- ✅ Fonts loaded correctly (Inter UI, Inter Tight untuk heading)
- ❌ Kalau font fallback (Times New Roman/Arial), font bundling gagal → check browser DevTools Network tab untuk fontsource CSS imports

**Test 3.2 — Tailwind tokens:**
- ✅ Primary green color (`#1f8a4a` ish) di submit button
- ❌ Kalau plain blue/grey button, Tailwind preset tidak load → check `tailwind.config.ts` di apps/web extends `@ghanem/config/tailwind-base`

**Test 3.3 — Form validation (RHF + Zod):**
- Klik "Login" tanpa isi field → error messages muncul: "Format email tidak valid", "Password minimal 8 karakter"
- ✅ Error messages dengan `role="alert"` (test: turn on screen reader)
- ✅ `aria-invalid="true"` pada input yang error (test: inspect element)

**Test 3.4 — Dialog (Radix):**
- Klik "Lupa password?" link
- ✅ Modal muncul dengan focus trap (Tab cycles within dialog)
- ✅ ESC closes dialog
- ✅ Click outside closes dialog
- ✅ Focus restored ke "Lupa password?" link setelah close

**Test 3.5 — Toast (Sonner):**
- Isi email + password valid, klik Login
- ✅ Toast "Login berhasil (mock)" muncul top-right
- ✅ Auto-dismiss setelah ~4 detik
- ✅ Brand colors (green untuk success)

**Test 3.6 — Tooltip:**
- Hover icon "?" di sebelah field
- ✅ Tooltip muncul setelah ~500ms delay
- ✅ Disappears saat hover-out

**Test 3.7 — Keyboard a11y:**
- Tab through entire page
- ✅ Setiap interactive element fokus visible (ring outline)
- ✅ Tab order logical (top to bottom, left to right)

Failure di tests above → screenshot + report ke Claude.

---

## Step 4 — Admin Dev Server

```powershell
cd D:\app\ghanemone\workspace\apps\admin
npm run dev
```

**Expected:** Server starts di port 5174 (kalau 5173 sudah dipakai web).

Buka `http://localhost:5174/`.

**Visual smoke:**
- ✅ Admin app renders (placeholder content OK — belum ada page real)
- ✅ Same fonts loaded (Inter, Inter Tight)
- ❌ Tidak ada Toaster/TooltipProvider di admin (per agent's note di Open Question — that's expected, akan diisi nanti)

---

## Step 5 — Storybook

```powershell
cd D:\app\ghanemone\workspace\packages\ui
npm run storybook
```

**Expected output:**
```
╭─────────────────────────────────────────────────────╮
│                                                     │
│   Storybook 8.x.x for react-vite started            │
│   xxx ms for manager and xxx ms for preview         │
│                                                     │
│   Local:            http://localhost:6006/          │
│   On your network:  http://192.168.x.x:6006/        │
│                                                     │
╰─────────────────────────────────────────────────────╯
```

Buka `http://localhost:6006/`.

### Storybook Smoke Tests

**Test 5.1 — Sidebar tree:**
- ✅ Semua 6 categories muncul: Form, Primitives, Icon, Nav, Overlay, Feedback
- ✅ Setiap category expand → multiple components dengan multiple stories per component
- ✅ Click Form > Button > Primary → button renders di canvas

**Test 5.2 — Controls panel:**
- Buka any story (e.g., Form > Button > Primary)
- ✅ Right panel "Controls" muncul dengan editable args (variant, size, loading, disabled)
- ✅ Change variant: primary → danger, button color updates di canvas

**Test 5.3 — a11y addon:**
- Buka any story
- ✅ Right panel "Accessibility" tab present
- ✅ Run "Re-run audits" → "0 violations" untuk most stories
- ❌ Kalau violations muncul: catat component + violation type → report ke Claude

**Test 5.4 — Viewports:**
- Top toolbar → viewport selector
- Switch antara mobile (375), tablet (768), desktop (1280)
- ✅ Components scale responsively, no horizontal overflow

**Test 5.5 — Icon catalog:**
- Buka Icon > Icon > AllIcons
- ✅ Grid showing 41 icons dengan name labels
- ✅ Semua icons render (no broken SVGs)

**Test 5.6 — FormField integration:**
- Buka Form > FormField > WithRHF
- ✅ Form interactive dengan RHF + Zod
- ✅ Submit button trigger validation, errors rendered correctly

Failure di tests above → screenshot + console errors → report ke Claude.

---

## Step 6 — Build Production Bundles

```powershell
# Test that production builds succeed
cd D:\app\ghanemone\workspace\apps\web
npm run build

cd D:\app\ghanemone\workspace\apps\admin
npm run build

cd D:\app\ghanemone\workspace\packages\ui
npm run build-storybook
```

**Expected output:**
- Build completes tanpa error
- `dist/` folder muncul di setiap app
- Bundle size reported (web initial bundle < 300KB gzip target — termasuk @fontsource +150KB)

**Watch for:**
- ❌ Build errors yang `npm run dev` tidak catch (tree-shaking issues, unused imports flagged sebagai error di production mode)
- ❌ Warning "Bundle size > 500KB" → optimization needed nanti
- ✅ `storybook-static/` folder muncul di `packages/ui/` setelah build-storybook

---

## Step 7 — Lint (optional but recommended)

```powershell
cd D:\app\ghanemone\workspace
npm run lint
```

**Expected:** Zero errors.

**Common findings:**
- Unused imports (warning level — easy fix)
- Missing return types (strict eslint rule)
- a11y violations (jsx-a11y rules)

Report findings ke Claude untuk batch fix kalau banyak.

---

## ✅ Pass Criteria

Foundation considered verified kalau:
- [ ] `npm install` succeed di root
- [ ] `tsc --noEmit` zero errors di apps/web + apps/admin + packages/ui
- [ ] `apps/web` dev server boots, LoginPage 7 visual tests pass
- [ ] `apps/admin` dev server boots
- [ ] `packages/ui` Storybook boots, 6 smoke tests pass
- [ ] Production builds (web, admin, storybook) all succeed

## ❌ Fail Criteria

Stop dan report ke Claude kalau:
- npm install fails
- More than 5 TypeScript errors per app
- LoginPage renders but core feature broken (forms tidak validate, Dialog tidak open, Toast tidak fire)
- Storybook tidak boot atau lebih dari 20% stories error

## 📋 Report Template (untuk Claude)

```
Smoke test Phase 8 Foundation — [PASS / FAIL]

Environment:
- Node version: [output of node --version]
- npm version: [output of npm --version]
- OS: Windows 11

Step 1 — npm install: [PASS / FAIL]
[Error log kalau fail]

Step 2 — tsc --noEmit:
- apps/web: [PASS / N errors]
- apps/admin: [PASS / N errors]
- packages/ui: [PASS / N errors]
[List error messages]

Step 3 — Web dev server LoginPage:
- 3.1 renders: [✅/❌]
- 3.2 tokens: [✅/❌]
- 3.3 RHF validation: [✅/❌]
- 3.4 Dialog: [✅/❌]
- 3.5 Toast: [✅/❌]
- 3.6 Tooltip: [✅/❌]
- 3.7 keyboard a11y: [✅/❌]

Step 4 — Admin dev server: [PASS / FAIL]

Step 5 — Storybook: [PASS / FAIL]
- 5.1 sidebar tree: [✅/❌]
- 5.2 controls: [✅/❌]
- 5.3 a11y addon: [✅/❌ — list violations kalau ada]
- 5.4 viewports: [✅/❌]
- 5.5 icons: [✅/❌]
- 5.6 FormField: [✅/❌]

Step 6 — Production builds:
- apps/web: [PASS / FAIL, bundle size]
- apps/admin: [PASS / FAIL, bundle size]
- packages/ui storybook: [PASS / FAIL]

Step 7 — Lint: [N errors / N warnings]

Screenshots/console logs:
[attach kalau ada visual issue]

Open questions / surprises:
[anything yang weird tapi tidak block]
```

---

## 🧹 Cleanup (kalau perlu rollback)

```powershell
# Remove all node_modules tanpa hapus source
cd D:\app\ghanemone\workspace
Remove-Item -Recurse -Force node_modules, apps\*\node_modules, packages\*\node_modules

# Reset package-lock.json (kalau ter-corrupt)
Remove-Item package-lock.json

# Re-install fresh
npm install
```

---

## Catatan

- Smoke test ini **tidak menjamin** semua bugs ke-catch — actual production quality requires automated tests (deferred ke Phase 11) + manual UAT (Phase 11)
- Focus di sini: **konfigurasi correct + integrations work**. Visual/UX polish dilakukan di phase berikutnya.
- Foundation diharapkan reasonably solid — kalau lebih dari 30% tests fail, mungkin perlu Claude full review (bukan incremental fix)

**Setelah test pass:** report singkat ke Claude → kita lanjut Phase 8 Pages (port 11 pages).
**Kalau ada fail:** report detail → Claude fix → re-run test sampai green.
