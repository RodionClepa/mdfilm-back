import type { Request } from 'express';

export const SUPPORTED_LOCALES = ['en', 'ro', 'ru'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function parseLocale(raw: unknown): Locale {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return (SUPPORTED_LOCALES as readonly string[]).includes(s) ? (s as Locale) : 'en';
}

export function parseLocaleStrict(raw: unknown): Locale | undefined {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  return (SUPPORTED_LOCALES as readonly string[]).includes(s) ? (s as Locale) : undefined;
}

export function getReqLocale(req: Request): Locale {
  return parseLocale((req.query as any)?.lang);
}

export function pickTranslation(
  rows: Array<{ locale: string; [k: string]: any }> | null | undefined,
  locale: Locale,
): { locale: string; [k: string]: any } | undefined {
  if (!rows?.length) return undefined;
  const exact = rows.find((r) => r.locale === locale);
  if (exact) return exact;
  const fallback = rows.find((r) => r.locale === 'en');
  return fallback ?? rows[0];
}
