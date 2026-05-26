# ADR 0003 — SSO Strategy: JIT Provisioning sebagai Primary, Claims sebagai Optimization

**Status:** Accepted
**Date:** 2026-05-19
**Decision maker:** Hendra Dinata (hendra@pm.ghanemtech.co.id)
**Context:** Phase 7 — Auth design, Phase 9 — Auth service implementation

## Konteks

Ghanem.one mengintegrasikan SKK Migas SSO (OIDC). Sebelum implementation dimulai, kita perlu tahu apakah `organization` dan `role` claims tersedia di token IdP SKK Migas atau backend perlu fetch dari source lain.

Status saat ini: **claims di IdP SKK Migas BELUM dikonfirmasi**. Menunggu jawaban dari SKK Migas IT = blocking Phase 7 dan Phase 9 Auth service development.

## Keputusan

**Defensive design: JIT (Just-In-Time) provisioning sebagai primary path, claims sebagai optimization.**

Backend `UserProvisioningService` di NestJS handle both scenarios:

```
On first login (OIDC callback):
  1. Extract `sub` (always required) + `email` (standard claim) dari JWT
  2. Attempt to read `organization` + `role` claims
     - If present → populate User record langsung
     - If absent → leave fields NULL, mark user as 'pending_provisioning'
  3. Create User record in PostgreSQL
  4. If 'pending_provisioning': notify admin via in-app + email
  5. Admin UI: assign role + org untuk user dengan NULL fields

On subsequent logins:
  - If User exists + active → issue session token langsung
  - If User exists + pending → show "menunggu admin provisioning" screen
```

## Alternatif yang Dipertimbangkan

| Alternatif | Pro | Kontra | Kenapa Tidak |
|---|---|---|---|
| **Assume claims exist** | Simplest implementation, no admin overhead | Breaks completely jika claims tidak ada di IdP — perlu rework di Phase 9 | Risk terlalu besar tanpa konfirmasi |
| **Wait for SKK Migas IT** | Design tepat sesuai realitas IdP | Blocking Phase 7 dan Phase 9 — bisa berminggu-minggu | Cannot afford schedule slip |
| **JIT + optimization** ✅ | Works regardless of IdP, no blocking | Sedikit overhead untuk admin assign role (untuk first-login users) | Acceptable cost — overhead hanya di onboarding, tidak ongoing |

## Konsekuensi

### Positive
- **No blocking** — Phase 7 dan Phase 9 jalan tanpa menunggu IdP confirmation
- **Future-proof** — kalau ternyata claims ada, kita tinggal aktifkan fast path (populate from JWT)
- **Defensive** — sistem tetap berfungsi jika SKK Migas IdP berubah behavior atau ada outage claims tertentu
- **Admin override capability** — bisa fix role assignment errors manual, useful untuk edge cases (cross-org collaboration)
- **Decouples auth dari user data** — IdP authoritative untuk identity, ghanem.one authoritative untuk authorization

### Negative
- Admin overhead untuk first-login users (assign role manual). Mitigasi: bulk assignment UI + CSV import dari SKK Migas HR list
- Login flow lebih kompleks (3 states: new user pending, new user provisioned, existing user)
- Need separate "pending_provisioning" UI state di frontend

## Implementation Notes

### Database Schema (additions to `users` table)

```sql
ALTER TABLE users ADD COLUMN provisioning_status text NOT NULL DEFAULT 'active'
  CHECK (provisioning_status IN ('active', 'pending_provisioning', 'suspended'));
ALTER TABLE users ADD COLUMN provisioned_at timestamptz;
ALTER TABLE users ADD COLUMN provisioned_by uuid REFERENCES users(id);
```

### NestJS Service Sketch

```typescript
// apps/api/src/modules/auth/user-provisioning.service.ts
@Injectable()
export class UserProvisioningService {
  async handleFirstLogin(jwt: OidcJwtPayload): Promise<User> {
    const existing = await this.userRepo.findBySub(jwt.sub);
    if (existing) return existing;

    return this.userRepo.create({
      sub: jwt.sub,
      email: jwt.email,
      organization: jwt.organization ?? null,
      role: jwt.role ?? null,
      provisioning_status: (jwt.organization && jwt.role) ? 'active' : 'pending_provisioning',
    });
  }
}
```

### Admin UI (Phase 8 — Frontend)

- New page `/admin/users` dengan filter `provisioning_status = 'pending_provisioning'`
- Bulk action: assign role + org untuk multiple users sekaligus
- Audit log entry untuk setiap assignment

### Parallel Action — Tidak Blocking, tapi Tetap Penting

**Tetap eskalasi ke SKK Migas IT** untuk dapat actual IdP claims documentation. Kalau ternyata claims ada, kita aktifkan fast path dan reduce admin overhead. Bisa diskalasi di Phase 7 Week 1 paralel dengan implementasi defensive design.

Draft email/checklist ke SKK Migas IT:
- [ ] OIDC discovery URL untuk IdP
- [ ] List standard + custom claims di access token + ID token
- [ ] Apakah `organization`/`org`, `role`/`groups` claims tersedia?
- [ ] Format role values (e.g., "KKKS_OPERATOR" vs "kkks_operator" vs UUID)
- [ ] Token expiry + refresh policy
- [ ] PKCE support (untuk SPA frontend)
- [ ] Logout URL untuk Single Logout (SLO)

## Migration Path

- **Phase 9 Week 1:** Implement JIT provisioning + admin UI (4 SP / ~3 hari)
- **Phase 9 Week 2:** If SKK Migas IT confirms claims exist → tambah fast path (1 SP / ~half day)
- **Post-launch:** Monitor: % users `pending_provisioning` di first 30 hari. Kalau > 50%, follow up dengan SKK Migas IT untuk add claims ke IdP

## References

- Backend agent: [.claude/agents/backend-agent.md](../../.claude/agents/backend-agent.md)
- Auth flow doc: [docs/auth-flow.md](../auth-flow.md)
- Data model (users table): [docs/data-model.md](../data-model.md)
