/**
 * sidebar-config.ts — Konfigurasi data untuk AppShell sidebar.
 *
 * Struktur mengikuti referensi AlasBuana.com:
 *   BROWSE → item navigasi (All Data, Layers, Documents, Maps, Apps & Services)
 *   CATEGORIES → 8 kategori dataset dengan chevron expandable
 *   DATA PROVIDER → 5 provider utama dengan avatar + count
 *
 * Catatan desain:
 *   - Provider color hardcoded di sini (bukan dari theme token) karena
 *     ini adalah data bisnis (brand identity per KKKS), bukan tema UI.
 *   - Count angka adalah mock; Sprint 3 akan diganti derived dari API catalog.
 */
import type { SidebarSection } from '@ghanem/ui';

/** Sections BROWSE — navigasi utama. */
const BROWSE_SECTION: SidebarSection = {
  title: 'Browse',
  variant: 'browse',
  items: [
    { id: 'all-data', label: 'All Data', icon: 'database' },
    { id: 'layers', label: 'Layers', icon: 'layers' },
    { id: 'documents', label: 'Documents', icon: 'doc' },
    { id: 'maps', label: 'Maps', icon: 'map' },
    { id: 'apps-services', label: 'Apps & Services', icon: 'zap' },
  ],
};

/** Sections CATEGORIES — 8 kategori spasial E&P. */
const CATEGORIES_SECTION: SidebarSection = {
  title: 'Categories',
  variant: 'category',
  items: [
    { id: 'cat-administrative', label: 'Administrative', color: '#7a5cb8' },
    { id: 'cat-upstream-assets', label: 'Upstream Assets', color: '#2a5fb8' },
    { id: 'cat-wells-drilling', label: 'Wells & Drilling', color: '#1f8a4a' },
    { id: 'cat-facilities', label: 'Facilities', color: '#c2840d' },
    { id: 'cat-pipeline', label: 'Pipeline', color: '#cf3a2a' },
    { id: 'cat-environment', label: 'Environment', color: '#1f8a4a' },
    { id: 'cat-infrastructure', label: 'Infrastructure', color: '#5b667e' },
    { id: 'cat-basemap', label: 'Basemap', color: '#3a4459' },
  ],
};

/**
 * Sections DATA PROVIDER — 5 provider utama dengan avatar + count.
 * Count mock — TODO Sprint 3: derive dari GET /v1/datasets?group_by=provider.
 */
const DATA_PROVIDER_SECTION: SidebarSection = {
  title: 'Data Provider',
  variant: 'provider',
  items: [
    { id: 'provider-phm', label: 'PHM', initials: 'PHM', count: 245, color: '#2a5fb8' },
    { id: 'provider-phe-onwj', label: 'PHE ONWJ', initials: 'PHE', count: 183, color: '#1f8a4a' },
    { id: 'provider-psn', label: 'PSN', initials: 'PSN', count: 167, color: '#7a5cb8' },
    { id: 'provider-medco', label: 'Medco E&P', initials: 'ME', count: 142, color: '#c2840d' },
    { id: 'provider-harbour', label: 'Harbour Energy', initials: 'HE', count: 96, color: '#cf3a2a' },
  ],
  footer: {
    label: 'Show more',
    onClick: () => undefined, // TODO Sprint 3: navigate ke /providers
  },
};

/** Ekspor canonical sidebar sections untuk AppShell. */
export const APP_SIDEBAR_SECTIONS: SidebarSection[] = [
  BROWSE_SECTION,
  CATEGORIES_SECTION,
  DATA_PROVIDER_SECTION,
];

/**
 * Mapping dari sidebar item id ke URL path/search param.
 * Dipakai di AppShell untuk menentukan active item berdasarkan URL.
 */
export const SIDEBAR_ITEM_ROUTES: Record<string, { path: string; param?: string; value?: string }> = {
  'all-data': { path: '/explore' },
  'layers': { path: '/explore', param: 'type', value: 'layers' },
  'documents': { path: '/explore', param: 'type', value: 'documents' },
  'maps': { path: '/map' },
  'apps-services': { path: '/apps' },
  // Categories → filter di explore page
  'cat-administrative': { path: '/explore', param: 'category', value: 'administrative' },
  'cat-upstream-assets': { path: '/explore', param: 'category', value: 'upstream-assets' },
  'cat-wells-drilling': { path: '/explore', param: 'category', value: 'wells-drilling' },
  'cat-facilities': { path: '/explore', param: 'category', value: 'facilities' },
  'cat-pipeline': { path: '/explore', param: 'category', value: 'pipeline' },
  'cat-environment': { path: '/explore', param: 'category', value: 'environment' },
  'cat-infrastructure': { path: '/explore', param: 'category', value: 'infrastructure' },
  'cat-basemap': { path: '/explore', param: 'category', value: 'basemap' },
  // Providers → filter di explore page
  'provider-phm': { path: '/explore', param: 'provider', value: 'pertamina-hulu' },
  'provider-phe-onwj': { path: '/explore', param: 'provider', value: 'phe-onwj' },
  'provider-psn': { path: '/explore', param: 'provider', value: 'psn' },
  'provider-medco': { path: '/explore', param: 'provider', value: 'medco' },
  'provider-harbour': { path: '/explore', param: 'provider', value: 'harbour' },
};
