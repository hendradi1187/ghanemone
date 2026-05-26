# Runbook — Secret Rotation

> **Audience:** DevOps, Security Lead
> **Cadence:** Quarterly (per 90 hari) + on-demand setelah suspected leak
> **Estimasi waktu:** 30-90 menit per secret (depending on coverage)
> **Prereq:** akses Vault (Phase 10), GitHub admin, k8s admin
> **Status:** **Placeholder — full procedure diisi di Phase 10 Security Hardening**
> **Last updated:** 2026-05-19
> **Owner:** Security Lead + DevOps

---

## 1. Konteks

Ghanem.one memakai berbagai secret untuk auth, DB, third-party API, dll. Per posture
ADR 0002 (on-prem, no cloud-managed secrets), strategy long-term:

- **HashiCorp Vault** self-hosted di k3s sebagai source of truth.
- **External Secrets Operator (ESO)** sync ke Kubernetes Secret per namespace.
- **GitHub Actions** read Vault via short-lived token (Vault JWT auth dari runner).
- **Rotation cadence:** 90 hari default, lebih cepat untuk high-sensitivity secret.

**Phase 7 status:** Vault belum di-install. Sementara, secret hidup di GitHub Actions
Environment secrets (encrypted at rest) — lihat [github-setup.md §5](./github-setup.md#5-secrets-configuration).

---

## 2. Inventory secret (current — Phase 7)

| Secret name | Env | Sensitivity | Rotation deadline | Reachable by |
|---|---|---|---|---|
| `GHANEM_DEV_KUBECONFIG` | dev | Medium | 90d | DevOps |
| `GHANEM_STAGING_KUBECONFIG` | staging | High | 90d | DevOps, Tech Lead |
| `GHANEM_PROD_KUBECONFIG` | prod | **Critical** | 90d (or immediate on suspicion) | DevOps, Tech Lead |
| `SKKMIGAS_OIDC_CLIENT_SECRET` | staging+prod | **Critical** | 90d | Tech Lead, Backend |
| `CLOUDFLARE_API_TOKEN` | staging+prod | High | 90d | DevOps |
| `SENTRY_AUTH_TOKEN` | prod | Medium | 180d | DevOps |
| `ANTHROPIC_API_KEY` | prod | High | 90d | Backend |
| `MINIO_ROOT_PASSWORD` | prod | **Critical** | 90d | DevOps |
| `POSTGRES_REPLICATION_PASSWORD` | prod | **Critical** | 90d | DevOps, DB |
| `BACKUP_ENCRYPTION_KEY` | prod | **Critical** | **365d** (rotation = re-encrypt all backup) | DevOps |

**Phase 10 addition:** semua secret di atas di-migrate ke Vault, dengan rotation policy
dikodifikasi via Vault lease + TTL.

---

## 3. Rotation procedure (per secret type)

### 3.1 Kubeconfig (kubectl client cert)

```bash
# 1. Generate new client cert + key di k3s server
ssh ghanem-prod-k8s-01.skkmigas.local
sudo k3s kubectl create serviceaccount ghanem-deploy-2026q3 -n kube-system
sudo k3s kubectl create clusterrolebinding ghanem-deploy-2026q3 \
  --clusterrole=cluster-admin \
  --serviceaccount=kube-system:ghanem-deploy-2026q3

# 2. Extract token + build kubeconfig
TOKEN=$(sudo k3s kubectl -n kube-system create token ghanem-deploy-2026q3 --duration=2160h)
# Save ke /tmp/kubeconfig-prod-2026q3.yaml (template kubeconfig dengan token diatas)

# 3. Update GitHub secret
gh secret set GHANEM_PROD_KUBECONFIG \
  --env production \
  --body "$(base64 -w0 /tmp/kubeconfig-prod-2026q3.yaml)"

# 4. Test dengan dry-run workflow
gh workflow run deploy-prod.yml --ref main \
  -f image_tag=v0.2.0 \
  -f release_branch=release/v0.2.0 \
  -f skip_smoke=true
# Cancel sebelum actual deploy

# 5. Setelah verified, revoke old service account
sudo k3s kubectl delete serviceaccount ghanem-deploy-2026q2 -n kube-system
sudo k3s kubectl delete clusterrolebinding ghanem-deploy-2026q2
```

### 3.2 OIDC client secret (SKK Migas SSO)

```
1. Email SKK Migas IT: minta regenerate client_secret untuk client_id `ghanem-one-prod`.
2. SKK Migas IT issue new secret value via secure channel (Vault, encrypted email).
3. Update GitHub secret `SKKMIGAS_OIDC_CLIENT_SECRET` di environment `production`.
4. Rolling restart pods yang baca secret:
     kubectl --kubeconfig=~/.kube/config-prod rollout restart deployment ghanem-api -n ghanem-prod
5. Verify login flow end-to-end.
6. SKK Migas IT revoke old secret 24 jam setelah verified.
```

### 3.3 DB password (Postgres replication, app user)

```bash
# 1. Generate new password
NEW_PASS=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)

# 2. Update di Postgres primary
PGPASSWORD=$OLD_PASS psql -h ghanem-prod-db-01 -U postgres -c "ALTER USER ghanem PASSWORD '$NEW_PASS';"

# 3. Update GitHub secret
gh secret set POSTGRES_PASSWORD --env production --body "$NEW_PASS"

# 4. Update Kubernetes Secret di k3s
kubectl create secret generic ghanem-db-creds \
  --from-literal=password=$NEW_PASS \
  --namespace=ghanem-prod \
  --dry-run=client -o yaml | kubectl apply -f -

# 5. Rolling restart deployment yang depend on DB
kubectl rollout restart deployment ghanem-api ghanem-workers -n ghanem-prod

# 6. Verify health
curl -fsS https://api.ghanem.one/api/v1/health
```

> **CRITICAL:** kalau menggunakan connection pooler (PgBouncer), ada extra step. Phase 10 detail.

### 3.4 Cloudflare API token

```
1. cloudflare.com → My Profile → API Tokens → Create Token
2. Template: "Edit zone DNS" untuk zone `ghanem.one`
3. Set expiry 6 bulan (matikan auto-refresh untuk audit)
4. Update GitHub secret CLOUDFLARE_API_TOKEN di environment staging + production
5. Test: trigger cert-manager renewal di staging
   kubectl annotate certificate -n ghanem-staging ghanem-tls cert-manager.io/force-renew=$(date +%s) --overwrite
6. Cek log cert-manager — pastikan tidak ada auth error
7. Revoke old token di Cloudflare dashboard
```

### 3.5 Backup encryption key (BACKUP_ENCRYPTION_KEY)

**Special handling: rotation = re-encrypt all backup. Plan carefully.**

```
1. Pre-rotation: full backup dengan KEY LAMA → verified restore di ephemeral env
2. Generate new key: openssl rand -base64 32
3. Re-encrypt seluruh backup history:
     for backup in /backups/*.sql.gz.enc; do
       decrypt $backup with KEY_OLD → encrypt with KEY_NEW → write to /backups-new/
     done
4. Verify random sample (3 backup) dapat di-decrypt + restore dengan KEY_NEW
5. Update GitHub secret + Vault
6. Swap directory: /backups-new → /backups (atomic rename)
7. Update KEY_OLD ke "frozen" storage (offline password manager, 1 jaga seandainya KEY_NEW lost)
8. Archive KEY_OLD setelah 1 tahun (audit retention)
```

Cadence: **365 hari**, bukan 90 hari, karena cost rotation tinggi.

---

## 4. Emergency rotation (suspected leak)

Jika secret suspected leaked (commit history, log file, screen-share recording, dll.):

1. **Immediate revoke** secret lama (kalau provider support):
   - GitHub PAT → Settings → PAT → Revoke
   - Cloudflare token → Roll
   - OIDC client secret → minta SKK Migas IT revoke
   - K8s SA token → `kubectl delete sa`
2. **Rotate baru** dalam < 1 jam dari detection.
3. **Audit log** akses dengan secret lama (Phase 10: Loki query `secret_id=<id>` dalam 30 hari ke belakang).
4. **Document incident** — postmortem mandatory.
5. **Notify** stakeholders (Tech Lead + Security Lead minimum; user kalau ada PII implication).

---

## 5. Future: Vault setup (Phase 10)

Outline yang akan didetailkan di Phase 10 Security:

```
1. Deploy Vault di k3s prod cluster (HA mode, 3 replica, Raft storage backend)
2. Configure auto-unseal via Transit secret engine (atau manual unseal dengan Shamir keys)
3. Enable KV v2 secret engine di path `secret/ghanem/`
4. Enable JWT auth method untuk GitHub Actions runner (audience: github-actions)
5. Policy: ghanem-deploy-prod hanya boleh baca `secret/ghanem/prod/*`
6. External Secrets Operator di k3s → sync Vault → K8s Secret per namespace
7. Migrate secrets dari GitHub Actions Environment → Vault
8. Update workflow: ganti `${{ secrets.X }}` dengan Vault lookup via vault-action
9. Audit log Vault ke Loki untuk semua read/write
10. Backup Vault snapshot harian ke MinIO + offsite
```

---

## 6. References

- [docs/runbooks/github-setup.md §5](./github-setup.md#5-secrets-configuration)
- [HashiCorp Vault docs](https://developer.hashicorp.com/vault/docs)
- [External Secrets Operator](https://external-secrets.io/)
- [OWASP — Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [.claude/agents/security-agent.md](../../.claude/agents/security-agent.md)
