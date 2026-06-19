import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/common/i18n/localized-text';

/** Subject + text + html, ready to hand to MailService.send (minus `to`). */
export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/** Coerce an arbitrary header/value to a supported locale, with fallback. */
export function normalizeLocale(value: string | undefined): SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? (value as SupportedLocale)
    : DEFAULT_LOCALE;
}

interface VerificationCopy {
  subject: string;
  intro: string;
  action: string; // link text
  validity: string;
  ignore: string;
}

const VERIFICATION: Record<SupportedLocale, VerificationCopy> = {
  fr: {
    subject: 'Confirmez votre adresse e-mail DarElKhair',
    intro:
      'Bienvenue sur DarElKhair ! Veuillez confirmer votre adresse e-mail.',
    action: 'Vérifier mon compte',
    validity: 'Ce lien est valable 24 heures.',
    ignore:
      "Si vous n'avez pas créé de compte, vous pouvez ignorer cet e-mail.",
  },
  ar: {
    subject: 'أكّد بريدك الإلكتروني في DarElKhair',
    intro: 'مرحبًا بك في DarElKhair! يرجى تأكيد عنوان بريدك الإلكتروني.',
    action: 'تأكيد حسابي',
    validity: 'هذا الرابط صالح لمدة 24 ساعة.',
    ignore: 'إذا لم تُنشئ حسابًا، يمكنك تجاهل هذا البريد الإلكتروني.',
  },
  en: {
    subject: 'Confirm your DarElKhair email',
    intro: 'Welcome to DarElKhair! Please confirm your email address.',
    action: 'Verify your account',
    validity: 'This link is valid for 24 hours.',
    ignore: "If you didn't create an account, you can safely ignore this email.",
  },
};

interface ResetCopy {
  subject: string;
  intro: string;
  action: string;
  validity: string;
  ignore: string;
}

const PASSWORD_RESET: Record<SupportedLocale, ResetCopy> = {
  fr: {
    subject: 'Réinitialisez votre mot de passe DarElKhair',
    intro:
      'Nous avons reçu une demande de réinitialisation de votre mot de passe.',
    action: 'Choisir un nouveau mot de passe',
    validity: 'Ce lien est valable 1 heure.',
    ignore:
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
  },
  ar: {
    subject: 'إعادة تعيين كلمة مرور DarElKhair',
    intro: 'تلقّينا طلبًا لإعادة تعيين كلمة مرورك.',
    action: 'اختيار كلمة مرور جديدة',
    validity: 'هذا الرابط صالح لمدة ساعة واحدة.',
    ignore: 'إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد الإلكتروني بأمان.',
  },
  en: {
    subject: 'Reset your DarElKhair password',
    intro: 'We received a request to reset your password.',
    action: 'Choose a new password',
    validity: 'This link is valid for 1 hour.',
    ignore: "If you didn't request this, you can safely ignore this email.",
  },
};

export function verificationEmail(
  locale: SupportedLocale,
  url: string,
): EmailContent {
  const c = VERIFICATION[locale];
  return {
    subject: c.subject,
    text: `${c.intro}\n\n${c.action}: ${url}\n${c.validity}\n\n${c.ignore}`,
    html:
      `<p>${c.intro}</p>` +
      `<p><a href="${url}">${c.action}</a> — ${c.validity}</p>` +
      `<p>${c.ignore}</p>`,
  };
}

export function passwordResetEmail(
  locale: SupportedLocale,
  url: string,
): EmailContent {
  const c = PASSWORD_RESET[locale];
  return {
    subject: c.subject,
    text: `${c.intro}\n\n${c.action}: ${url}\n${c.validity}\n\n${c.ignore}`,
    html:
      `<p>${c.intro}</p>` +
      `<p><a href="${url}">${c.action}</a> — ${c.validity}</p>` +
      `<p>${c.ignore}</p>`,
  };
}
