/**
 * AboutSection — intro platform untuk international visitor.
 *
 * Memberikan konteks tentang industri hulu migas Indonesia, SKK Migas,
 * KKKS, dan kenapa Ghanem.one ada — dalam Bahasa Inggris agar accessible
 * untuk tamu internasional.
 *
 * Posisi di HomePage: setelah StatsStrip, sebelum FeaturesGrid.
 */
import { Container } from '@ghanem/ui';

export function AboutSection(): JSX.Element {
  return (
    <section
      aria-label="About the platform"
      className="bg-surface py-16 lg:py-20"
    >
      <Container size="lg" paddingX="4">
        <div className="max-w-3xl mx-auto text-center">

          {/* Eyebrow */}
          <span className="inline-block text-cap text-green-700 font-semibold tracking-cap uppercase mb-3">
            About the Platform
          </span>

          {/* Heading */}
          <h2 className="font-display font-bold text-ink text-h1 lg:text-display tracking-display mb-6">
            What is Ghanem.one?
          </h2>

          {/* Body paragraphs */}
          <div className="space-y-4 text-ink-3 text-body leading-relaxed">
            <p>
              Indonesia's upstream oil &amp; gas sector is one of the largest in
              Southeast Asia, with 38+ active concession blocks (Wilayah Kerja /
              WK) operated by over 100 Production Sharing Contractors (KKKS)
              under the supervision of <strong className="text-ink">SKK Migas</strong>,
              the national upstream regulatory authority.
            </p>
            <p>
              <strong className="text-ink">Ghanem.one</strong> is the official spatial
              intelligence platform that unifies geospatial data, well information,
              seismic coverage, and compliance workflows across this ecosystem —
              giving regulators, operators, and analysts a single source of truth
              powered by the <strong className="text-ink">SPEKTRUM Dataspace</strong>{' '}
              federation infrastructure.
            </p>
            <p>
              Built for SKK Migas and trusted by leading KKKS partners including
              PHE ONWJ, Medco E&amp;P, and Harbour Energy, Ghanem.one combines
              interactive mapping, AI-powered analytics, real-time monitoring, and
              government-grade governance into one platform — replacing fragmented
              spreadsheets, legacy GIS tools, and manual approval workflows.
            </p>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default AboutSection;
