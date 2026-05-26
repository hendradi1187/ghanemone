// Shared TypeScript types untuk Ghanem.one.
//
// Placeholder — types asli akan di-generate dari OpenAPI spec (apps/api → openapi.json)
// menggunakan openapi-typescript di Phase 9. Sementara, hand-written types yang stable
// (User, Organization, Role) bisa ditambahkan di sini supaya FE+BE share kontrak yang sama.

/**
 * RBAC roles yang dikenali sistem. Lihat docs/auth-flow.md untuk full permission matrix.
 */
export type UserRole = 'regulator' | 'kkks_operator' | 'analyst' | 'admin';

/**
 * Provisioning status untuk SSO JIT flow (ADR 0003).
 */
export type ProvisioningStatus = 'active' | 'pending_provisioning' | 'suspended';

export interface User {
  id: string;
  sub: string;
  email: string;
  fullName: string | null;
  organization: string | null;
  role: UserRole | null;
  provisioningStatus: ProvisioningStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  shortCode: string;
  kind: 'regulator' | 'kkks' | 'partner' | 'public';
}

// TODO(Phase 9): Replace exports above dengan generated types dari OpenAPI spec.
// export * from './generated/api.gen';
