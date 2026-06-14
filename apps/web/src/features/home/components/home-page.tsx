import { Hero } from './hero';
import { FeaturedApartments } from './featured-apartments';
import { ValueProps } from './value-props';
import { HowItWorks } from './how-it-works';
import { Testimonials } from './testimonials';
import { CtaBanner } from './cta-banner';

/**
 * Feature 10 — public landing page, inspired by darelkhair.xyz.
 * Composes the brand sections top to bottom: hero → featured inventory →
 * value props → how it works → testimonials → closing CTA.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedApartments />
      <ValueProps />
      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
