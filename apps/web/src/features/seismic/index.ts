/**
 * Seismic feature barrel.
 *
 * Fix bug #2 (prototype): Centralized exports untuk `SeismicCrossSection` +
 * `SeismicWellDetails`. Di prototype dua komponen ini hidup sebagai global
 * symbols di `hifi-pages-2.jsx` dan di-reference dari `prototype-app.jsx`
 * lewat window-global (bekerja di HTML harness karena both scripts loaded
 * sebelum render). Di bundler / ESM real, itu break — sekarang consumer
 * (MapPage) mengimpor dari sini sebagai modul real.
 */
export {
  SeismicCrossSection,
  type SeismicCrossSectionProps,
} from './SeismicCrossSection';

export {
  SeismicWellDetails,
  type SeismicWellDetailsProps,
  type WellSummary,
} from './SeismicWellDetails';
