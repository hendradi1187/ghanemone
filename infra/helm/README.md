# infra/helm

Helm charts untuk deploy aplikasi Ghanem.one ke k3s cluster (dev/staging/prod).

**Status:** Placeholder. Diisi di **Task #5 — Helm Charts** (Phase 7 Week 2-4).

## Rencana isi folder

```
infra/helm/
├── ghanem-web/              Chart untuk apps/web (Vite static via nginx pod)
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-staging.yaml
│   ├── values-prod.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── ingress.yaml
│       └── configmap.yaml
├── ghanem-admin/            Chart untuk apps/admin
├── ghanem-api/              Chart untuk apps/api (NestJS, HPA enabled)
├── ghanem-workers/          Chart untuk apps/workers (Python, DaemonSet di worker VMs)
├── ghanem-martin/           Chart untuk Martin tile server
├── ghanem-meilisearch/      Chart untuk Meilisearch
├── ghanem-monitoring/       Umbrella chart (Prometheus, Grafana, Loki, Sentry)
└── ghanem-shared/           Library chart (helpers, labels, image pull secrets)
```

## Convention

- Image registry: `ghcr.io/ghanem-tech/<app>:<sha>`
- Pull secret name: `ghcr-pull-secret` (created via Ansible saat bootstrap)
- Ingress class: `traefik` (k3s default) atau `nginx` jika di-swap
- TLS: Let's Encrypt via cert-manager + Cloudflare DNS-01 ([ADR 0002](../../docs/decisions/0002-hosting-on-prem-skk-migas.md))
- Resource requests/limits **wajib di-set** untuk semua container

## CI/CD integration

GH Actions workflow `deploy-{env}.yml` jalankan `helm upgrade --install` dengan
`values-<env>.yaml` + image tag dari commit SHA.

## References

- [ADR 0004 — Tech Stack Finalize](../../docs/decisions/0004-tech-stack-finalize.md) (k3s + Longhorn)
- [Promotion runbook](../../docs/runbooks/promotion.md)
- [Rollback runbook](../../docs/runbooks/rollback.md)
