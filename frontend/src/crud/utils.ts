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

