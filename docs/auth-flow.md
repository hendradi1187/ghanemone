# Authentication & Authorization — Ghanem.one

> **Status:** PROPOSED — koordinasi dengan tim SSO SKK Migas dibutuhkan untuk
> ratifikasi endpoint IdP, scopes, dan claim mapping.

Dokumen ini menjelaskan flow login (OIDC SSO), session lifecycle, RBAC matrix
per role, dan kebijakan row-level security. Diturunkan dari `hifi-auxiliary.jsx:6-154`
(HfLogin) dan refernces user/role di `hifi-components.jsx:77`,
`hifi-auxiliary.jsx:162`, `:397`.

---

## 1. Authentication providers

Login page menampilkan tiga SSO buttons (`hifi-auxiliary.jsx:88-92`):

| Provider | Audience | Status |
|---|---|---|
| **SKK Migas SSO** | Regulator + Compliance Officer | Recommended (Disarankan) |
| **Pertamina SSO** | Pertamina-affiliated KKKS (PHE, PHM, Pertamina Subsurface) | Standard |
| **Microsoft Azure AD** | Non-Pertamina KKKS (Medco, Harbour, Premier, dst) | Standard |
| **Email + Password** | Fallback untuk Public/Analyst (read-only public datasets) | Phase 9 |

Semua SSO flow pakai **OIDC Authorization Code + PKCE**. Tidak ada implicit flow,
tidak ada client_secret di browser.

Email/password flow (jika ada): **Argon2id** password hash, **TOTP** 2FA mandatory.

---

## 2. OIDC parameters

| Param | Value |
|---|---|
| `response_type` | `code` |
| `code_challenge_method` | `S256` |
| `scope` | `openid profile email organization role` |
| `redirect_uri` | `https://ghanem.one/auth/callback` (web), `https://api.ghanem.one/v1/auth/oidc/callback` (server-side exchange) |
| `prompt` | `select_account` (saat user klik logout-and-relogin) |

Custom claims yang **dibutuhkan dari IdP**:

| Claim | Type | Purpose |
|---|---|---|
| `sub` | string | Stable user ID di IdP |
| `email` | string | Login + audit trail |
| `name` | string | Display name |
| `organization` | string | Map ke `organizations.slug` |
| `role` | string | One of: `regulator`, `compliance_officer`, `kkks_operator`, `public_analyst` |

**Open question untuk SKK Migas SSO team:** Apakah claim `organization` dan `role`
sudah tersedia di token? Kalau tidak, butuh **claim mapping** di Ghanem.one backend
(JIT provisioning lookup ke directory) — drives extra latency 1 RPC.

---

## 3. Login flow (sequence)

```mermaid
sequenceDiagram
    autonumber
    participant U as User Browser
    participant W as Web (ghanem.one)
    participant API as API (api.ghanem.one)
    participant IdP as SKK Migas IdP
    participant DB as Postgres

    U->>W: Click "Lanjut dengan SKK Migas SSO"
    W->>U: Generate PKCE verifier (S256), store in sessionStorage
    W->>U: Redirect → IdP /authorize?client_id=…&code_challenge=…&state=…
    U->>IdP: GET /authorize
    IdP->>U: Login form (corp credentials + MFA)
    U->>IdP: Submit credentials
    IdP->>U: Redirect → ghanem.one/auth/callback?code=…&state=…
    U->>W: GET /auth/callback?code=…&state=…
    W->>API: POST /v1/auth/oidc/callback { code, state, code_verifier, provider }
    API->>IdP: POST /token (code + code_verifier + client_secret)
    IdP-->>API: id_token + access_token + refresh_token
    API->>API: Verify id_token signature (JWKS), check iss, aud, exp, nonce
    API->>DB: SELECT user WHERE oidc_identities.issuer=… AND subject=sub
    alt User exists
        API->>DB: UPDATE users SET last_login_at=now()
    else First time (JIT provision)
        API->>DB: INSERT user + oidc_identity (FK org_id derived from 'organization' claim)
    end
    API->>API: Issue Ghanem session JWT (RS256, 1h exp) + refresh token (30d, opaque, in Redis)
    API-->>W: Set-Cookie: ghanem_session=<JWT>; HttpOnly; Secure; SameSite=Lax<br/>{ user, expiresAt }
    W->>U: Redirect → /explore (or originally-requested URL)
    U->>W: Subsequent requests carry cookie
    W->>API: GET /v1/datasets (Cookie attached)
    API->>API: Verify JWT, extract { user_id, org_id, role }
    API->>DB: SET LOCAL ghanem.user_id=…, ghanem.org_id=…, ghanem.role=…
    API->>DB: SELECT … (RLS policies enforce visibility)
    API-->>W: 200 OK { items }
```

---

## 4. Session lifecycle

| Token | Lifetime | Storage | Refresh |
|---|---|---|---|
| **Access JWT** (`ghanem_session` cookie) | 1 hour | HttpOnly + Secure cookie | Auto-refresh via refresh token before expiry |
| **Refresh token** | 30 days, sliding | Opaque, stored in Redis `session:<sid>` | Rotated on every refresh (one-time use) |
| **PKCE verifier** | 5 min | `sessionStorage` (browser) | N/A (single use) |
| **IdP id_token** | per IdP policy | Not stored client-side — used only for verification at callback | N/A |

### Refresh flow

```http
POST /v1/auth/refresh
Cookie: ghanem_refresh=<opaque>

→ 200 OK
Set-Cookie: ghanem_session=<new JWT>; …
Set-Cookie: ghanem_refresh=<new opaque>; …
```

### Logout flow

```http
POST /v1/auth/logout
Cookie: ghanem_session=…

→ 204
Set-Cookie: ghanem_session=; Max-Age=0; …
Set-Cookie: ghanem_refresh=; Max-Age=0; …
```

Server-side: invalidate refresh token in Redis (LPUSH ke deny-list TTL = original
expiry). Optionally call IdP `end_session_endpoint` untuk SLO (Single Logout).

### "Remember me 30 days" checkbox (`hifi-auxiliary.jsx:135`)

Checkbox checked → use 30d refresh token. Unchecked → 24h refresh token only.

---

## 5. RBAC matrix

| Endpoint pattern | Regulator | Compliance Officer | KKKS Operator | Public Analyst |
|---|---|---|---|---|
| `GET /datasets` (sensitivity=public) | ✓ | ✓ | ✓ | ✓ |
| `GET /datasets` (sensitivity=internal) | ✓ | ✓ | ✓ own org | ✗ |
| `GET /datasets` (sensitivity=confidential) | ✓ | ✓ | ✓ own org | ✗ |
| `POST /datasets` | ✗ | ✗ | ✓ | ✗ |
| `PATCH /datasets/:id` | ✓ | ✗ | ✓ own org, not after approve | ✗ |
| `DELETE /datasets/:id` | ✓ | ✗ | ✗ | ✗ |
| `POST /uploads/*` | ✗ | ✗ | ✓ | ✗ |
| `GET /approvals` | ✓ | ✓ | ✓ own org submissions | ✗ |
| `POST /approvals/:id/approve` | ✓ | ✓ | ✗ | ✗ |
| `POST /approvals/:id/reject` | ✓ | ✓ | ✗ | ✗ |
| `GET /monitoring/*` | ✓ | ✓ | ✓ own org pipelines | ✗ |
| `GET /audit` | ✓ | ✓ | ✓ own org actions | ✗ |
| `POST /ai/ask` | ✓ | ✓ | ✓ | ✓ rate-limited |
| `GET /workspace/projects` | ✓ own + shared | ✓ own + shared | ✓ own + shared | ✗ |
| `POST /workspace/projects` | ✓ | ✓ | ✓ | ✗ |
| `GET /apps` | ✓ | ✓ | ✓ | ✓ |
| `POST /apps/:id/install` | ✓ | ✗ | ✓ | ✗ |

Legend: ✓ = allowed unconditionally · ✓ own org = RLS-filtered to user's `org_id` · ✗ = 403

### Enforcement layers (defense in depth)

1. **Frontend**: hide UI affordances (don't show "Approve" button to KKKS) — UX only, NOT security.
2. **API controller (NestJS Guard / FastAPI dependency)**: check `role` from JWT before invoking handler.
3. **PostgreSQL RLS**: `SET LOCAL ghanem.role` per-connection, policies on `datasets`, `upload_sessions`, `approval_items` (lihat data-model.md §4).

**Audit:** Every 403 logs to `audit_log` with `category='security_denied'`. Spike → page on-call.

---

## 6. JWT claims (Ghanem session token, not IdP token)

```json
{
  "iss": "https://api.ghanem.one",
  "aud": "ghanem.one",
  "sub": "<users.id UUID>",
  "iat": 1716120000,
  "exp": 1716123600,
  "jti": "<unique session-instance id>",

  "email": "citra@skkmigas.go.id",
  "name": "Citra R.",
  "initials": "CR",

  "org_id": "<organizations.id UUID>",
  "org_slug": "skkmigas",
  "org_name": "SKK Migas",
  "role": "regulator"
}
```

Signing: **RS256** with rotating keys (kid in header). JWKS endpoint:
`GET /v1/.well-known/jwks.json`. Rotate every 90 days.

---

## 7. Security headers (mandatory on all responses)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.basemaps.cartocdn.com; connect-src 'self' https://api.ghanem.one wss://api.ghanem.one; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

CSP `connect-src` includes `wss://api.ghanem.one` for the Monitoring WebSocket.
`img-src` includes `*.basemaps.cartocdn.com` for the Carto Positron map tiles.

---

## 8. CSRF protection

Cookie-based session → CSRF risk. Mitigations:

- **SameSite=Lax** on session cookies (default for browsers).
- **Double-submit token** for state-changing requests: API issues `X-CSRF-Token`
  header on login; client must echo it back in `X-CSRF-Token` request header.
- **POST/PATCH/DELETE without `X-CSRF-Token` → 403**.
- For pure API clients (mobile, server-to-server), use `Authorization: Bearer <JWT>`
  instead of cookie — CSRF token not required.

---

## 9. SSO mappings (organization → role default)

JIT-provisioning needs a deterministic map from IdP `organization` claim → Ghanem
`org_id` + default role:

| IdP `organization` claim | Ghanem `org_slug` | Default `role` |
|---|---|---|
| `skk-migas` / `skkmigas.go.id` | `skkmigas` | `regulator` |
| `phe-onwj` / `phe.id` | `phe-onwj` | `kkks_operator` |
| `phm` / `pertaminahulumahakam.id` | `phm` | `kkks_operator` |
| `pertamina-subsurface` | `pertamina-sub` | `kkks_operator` |
| `medco-e&p` | `medco` | `kkks_operator` |
| `harbourenergy.com` | `harbour` | `kkks_operator` |
| `premier-oil.id` | `premier` | `kkks_operator` |

Special case **promotion**: someone with `org=skkmigas` can be promoted to
`compliance_officer` (subset of regulator capabilities) via admin tool — that's a
manual `UPDATE users SET role = 'compliance_officer'` for now. Phase 9 considers
an in-app admin page.

**Open question:** Should role come from IdP token (each IdP team manages it) or
from Ghanem's local mapping table? Recommendation: **start with local mapping**
(simpler, faster iteration), promote to IdP-driven once role taxonomy stable.

---

## 10. Failed-login & lockout

- 5 failed password attempts in 10 min → 15-min lockout per email + IP.
- All failures logged to `audit_log` with `category='security_login_failed'`.
- After 20 failures from same IP across multiple emails → IP blocked at WAF for 1h.

OIDC SSO failures are tracked but **not lockout-able** (IdP has its own throttling).

---

## 11. Token revocation

- **User-initiated logout**: invalidate refresh token (Redis deny-list).
- **Admin force-logout** (e.g., security incident): `POST /admin/users/{id}/revoke-sessions` invalidates **all** refresh tokens for that user; access JWTs expire naturally within 1h.
- **Compromised key rotation**: rotate JWKS signing key → old JWTs fail signature verification immediately. Acceptable downtime: ~1h (one access token lifetime).

---

## 12. Account provisioning (regulator vs KKKS)

| Path | Trigger | Who | Notes |
|---|---|---|---|
| **Regulator** | SKK Migas SSO first login | Auto (JIT) | role defaults to `regulator` per §9 mapping |
| **Compliance Officer** | Manual promotion in admin tool | Existing regulator with admin permission | Audit-logged |
| **KKKS Operator** | KKKS SSO first login | Auto (JIT) | Org auto-mapped per §9; manual fallback if org claim missing |
| **Public Analyst** | `POST /auth/register` (email + password) | Self-service | Email verification required (24h token); rate-limited 3/day per IP |

The login page CTA "Daftar sebagai KKKS" (`hifi-auxiliary.jsx:144`) opens
`/register/kkks` — a contact-sales flow, NOT self-service. New KKKS onboarding
is offline (legal + technical setup with SKK Migas), then SSO provisioned.

---

## 13. Phase 7 implementation checklist

- [ ] Choose OIDC client library: **`openid-client`** (Node), or **`authlib`** (Python).
- [ ] Procure SKK Migas IdP credentials (client_id, client_secret) — coordination with SKK IT.
- [ ] Set up JWKS rotation cron (90-day cadence).
- [ ] Configure Redis for refresh token store + deny-list.
- [ ] Implement PgBouncer with `RESET ALL` after each transaction (to avoid `SET LOCAL` leaking — use **session pinning** in transaction mode, or use **session mode**).
- [ ] Build admin panel for promoting users to `compliance_officer`.
- [ ] Document SSO setup steps for each KKKS in onboarding kit.
- [ ] Penetration test focused on auth (Phase 10).
