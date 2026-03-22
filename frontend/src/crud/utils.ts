export function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function numOrUndefined(value: string) {
  const v = value.trim();
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function strOrUndefined(value: string) {
  const v = value.trim();
  return v ? v : undefined;
}

export function buildTranslationsPayload(
  enabled: { ro: boolean; ru: boolean },
  values: {
    ro: Record<string, string>;
    ru: Record<string, string>;
  },
) {
  const items: any[] = [];
  if (enabled.ro) {
    items.push({ locale: 'ro', ...values.ro });
  }
  if (enabled.ru) {
    items.push({ locale: 'ru', ...values.ru });
  }
  return items.length ? items : undefined;
}

