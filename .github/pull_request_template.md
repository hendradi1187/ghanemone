<!--
Terima kasih sudah berkontribusi ke Ghanem.one!
Isi template ini supaya reviewer cepat paham konteks PR-mu.
-->

## Ringkasan

<!-- 1-3 kalimat: apa yang berubah + kenapa. -->

## Tipe perubahan

- [ ] Bug fix (non-breaking change yang fix issue)
- [ ] Feature baru (non-breaking change yang tambah functionality)
- [ ] Breaking change (fix atau feature yang mengubah behavior lama)
- [ ] Refactor / internal cleanup (no functional change)
- [ ] Dokumentasi
- [ ] Infrastruktur / CI / build tooling
- [ ] Hotfix prod (cherry-pick from main → release)

## Scope (centang yang relevan)

- [ ] `apps/web`
- [ ] `apps/admin`
- [ ] `apps/api`
- [ ] `apps/workers`
- [ ] `packages/ui`
- [ ] `packages/types`
- [ ] `packages/config`
- [ ] `infra/` (Ansible / Helm / scripts)
- [ ] `.github/workflows`
- [ ] `docs/`

## Issue terkait

<!-- Tutup issue dengan kata kunci: closes #123, fixes #456 -->

## Cara test

<!-- Langkah reproducible: command, URL, fixture yang dipakai. -->

```bash
# contoh:
npm run test --filter=@ghanem/api
```

## Checklist sebelum minta review

- [ ] Commit message ikuti Conventional Commits (`feat:`, `fix:`, `chore:`, dll. — lihat [docs/branch-strategy.md](../docs/branch-strategy.md))
- [ ] `npm run lint` + `npm run type-check` + `npm run test` lokal pass
- [ ] Tidak ada `any` di TypeScript code
- [ ] Tidak ada secret / credential yang tertinggal di diff
- [ ] Jika ada DB migration: ikuti [docs/runbooks/db-migration-safety.md](../docs/runbooks/db-migration-safety.md) (additive first)
- [ ] Jika ada perubahan API contract: update `docs/api-contract.md`
- [ ] Jika ada perubahan infra: update runbook terkait
- [ ] Jika a11y-impacting change: tested dengan keyboard + screen reader (target WCAG 2.2 AA)

## Risiko deployment

<!-- Singkat: "Low — backend additive endpoint, no breaking change" atau "High — DB column drop, perlu 2-phase deploy". -->

## Plan rollback

<!-- Apa yang dilakukan kalau PR ini gagal di prod? Default: helm rollback. -->

## Screenshots / video (kalau ada UI change)

<!-- Drag drop di sini. -->
