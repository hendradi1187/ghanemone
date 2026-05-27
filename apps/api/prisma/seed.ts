/**
 * Prisma seed script — Ghanem.one development seed data.
 * Run: npx prisma db seed
 *
 * Seeds:
 *   - 9 organizations (1 REGULATOR + 8 KKKS + 1 contractor)
 *   - 4 users (admin, regulator, kkks_operator, analyst)
 *
 * All passwords: "Demo123!" (bcrypt-hashed)
 *
 * IMPORTANT: This script is IDEMPOTENT — re-running will not create duplicates.
 * It uses upsert on unique fields (email, slug, name).
 */

import { OrganizationType, PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo123!';
const BCRYPT_ROUNDS = 10;

interface OrgSeed {
  name: string;
  slug: string;
  type: OrganizationType;
}

const ORGANIZATIONS: OrgSeed[] = [
  { name: 'SKK Migas', slug: 'skk-migas', type: OrganizationType.REGULATOR },
  { name: 'PHE ONWJ', slug: 'phe-onwj', type: OrganizationType.KKKS },
  { name: 'Pertamina Hulu Mahakam', slug: 'pertamina-hulu-mahakam', type: OrganizationType.KKKS },
  { name: 'Medco E&P', slug: 'medco-ep', type: OrganizationType.KKKS },
  { name: 'PT Pertamina Hulu Saka (PSN)', slug: 'psn', type: OrganizationType.KKKS },
  { name: 'Harbour Energy Indonesia', slug: 'harbour-energy', type: OrganizationType.KKKS },
  { name: 'Premier Oil Indonesia', slug: 'premier-oil', type: OrganizationType.KKKS },
  { name: 'Pertamina Hulu Rokan', slug: 'pertamina-hulu-rokan', type: OrganizationType.KKKS },
  { name: 'VICO Indonesia', slug: 'vico-indonesia', type: OrganizationType.KKKS },
  { name: 'Ghanem Tech', slug: 'ghanemtech', type: OrganizationType.CONTRACTOR },
];

interface UserSeed {
  email: string;
  name: string;
  role: UserRole;
  orgSlug: string;
}

const USERS: UserSeed[] = [
  {
    email: 'admin@ghanemtech.co.id',
    name: 'Admin Ghanem',
    role: UserRole.ADMIN,
    orgSlug: 'ghanemtech',
  },
  {
    email: 'regulator@skkmigas.go.id',
    name: 'Regulator SKK Migas',
    role: UserRole.REGULATOR,
    orgSlug: 'skk-migas',
  },
  {
    email: 'operator@phe-onwj.co.id',
    name: 'Operator PHE ONWJ',
    role: UserRole.KKKS_OPERATOR,
    orgSlug: 'phe-onwj',
  },
  {
    email: 'analyst@ghanemtech.co.id',
    name: 'Analyst Ghanem',
    role: UserRole.ANALYST,
    orgSlug: 'ghanemtech',
  },
];

async function main(): Promise<void> {
  console.log('Seeding organizations...');
  const orgMap = new Map<string, string>(); // slug -> id

  for (const org of ORGANIZATIONS) {
    const upserted = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: { name: org.name, type: org.type },
      create: { name: org.name, slug: org.slug, type: org.type },
    });
    orgMap.set(upserted.slug, upserted.id);
    console.log(`  org: ${upserted.name} [${upserted.id}]`);
  }

  console.log('\nSeeding users...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

  for (const user of USERS) {
    const orgId = orgMap.get(user.orgSlug);
    if (!orgId) {
      throw new Error(`Organization slug '${user.orgSlug}' not found in seed`);
    }

    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, organizationId: orgId },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
        organizationId: orgId,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`  user: ${upserted.email} [${upserted.role}] [${upserted.id}]`);
  }

  console.log('\nSeed completed.');
  console.log(`  Organizations: ${ORGANIZATIONS.length}`);
  console.log(`  Users: ${USERS.length}`);
  console.log(`  Demo password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
