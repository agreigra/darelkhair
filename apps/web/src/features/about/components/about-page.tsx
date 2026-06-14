import { AboutHero } from './about-hero';
import { OurStory } from './our-story';
import { Stats } from './stats';
import { MissionVision } from './mission-vision';
import { CoreValues } from './core-values';
import { AboutCta } from './about-cta';

/**
 * Feature 11 — About page, inspired by darelkhair.xyz/about.
 * Sections top to bottom: heading → our story → key stats → mission & vision →
 * core values → closing CTA.
 */
export function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <Stats />
      <MissionVision />
      <CoreValues />
      <AboutCta />
    </>
  );
}
