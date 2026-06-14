import { ContactHero } from './contact-hero';
import { ContactForm } from './contact-form';
import { ContactInfo } from './contact-info';

/**
 * Feature 12 — public Contact page, inspired by darelkhair.xyz/contact.
 * Heading band, then a two-column "Send us a message" form + contact details.
 */
export function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <ContactForm />
          <ContactInfo />
        </div>
      </section>
    </>
  );
}
