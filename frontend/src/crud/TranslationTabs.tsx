import { useMemo, useState } from 'react';

export type CrudLocale = 'en' | 'ro' | 'ru';

export type TranslationValues = Record<string, string>;

export type TranslationEnabled = {
  ro: boolean;
  ru: boolean;
};

export type TranslationFieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  placeholder?: string;
};

export function TranslationTabs(props: {
  title: string;
  fields: TranslationFieldDef[];
  requiredKeys?: string[];
  en: TranslationValues;
  ro: TranslationValues;
  ru: TranslationValues;
  enabled: TranslationEnabled;
  onChangeEn: (next: TranslationValues) => void;
  onChangeRo: (next: TranslationValues) => void;
  onChangeRu: (next: TranslationValues) => void;
  onChangeEnabled: (next: TranslationEnabled) => void;
}) {
  const {
    title,
    fields,
    requiredKeys,
    en,
    ro,
    ru,
    enabled,
    onChangeEn,
    onChangeRo,
    onChangeRu,
    onChangeEnabled,
  } = props;

  const [tab, setTab] = useState<CrudLocale>('en');

  const active = useMemo(() => {
    if (tab === 'ro') return ro;
    if (tab === 'ru') return ru;
    return en;
  }, [tab, en, ro, ru]);

  function setActive(next: TranslationValues) {
    if (tab === 'ro') return onChangeRo(next);
    if (tab === 'ru') return onChangeRu(next);
    return onChangeEn(next);
  }

  function isLocaleEnabled(locale: CrudLocale) {
    if (locale === 'en') return true;
    if (locale === 'ro') return enabled.ro;
    return enabled.ru;
  }

  function setLocaleEnabled(locale: 'ro' | 'ru', value: boolean) {
    onChangeEnabled({ ...enabled, [locale]: value });
  }

  function isRequiredKey(key: string) {
    return Boolean(requiredKeys?.includes(key));
  }

  function hasMissingRequired(locale: 'ro' | 'ru') {
    const isEnabled = locale === 'ro' ? enabled.ro : enabled.ru;
    if (!isEnabled) return false;

    const values = locale === 'ro' ? ro : ru;
    for (const key of requiredKeys ?? []) {
      const v = String(values[key] ?? '').trim();
      if (!v) return true;
    }
    return false;
  }

  function copyFromEn(locale: 'ro' | 'ru') {
    const source = en;
    if (locale === 'ro') onChangeRo({ ...ro, ...source });
    else onChangeRu({ ...ru, ...source });
    onChangeEnabled({ ...enabled, [locale]: true });
    setTab(locale);
  }

  function fillEmptyFromEn(locale: 'ro' | 'ru') {
    const source = en;
    const target = locale === 'ro' ? ro : ru;
    const next: TranslationValues = { ...target };
    for (const f of fields) {
      const current = String(target[f.key] ?? '').trim();
      const value = String(source[f.key] ?? '').trim();
      if (!current && value) next[f.key] = value;
    }
    if (locale === 'ro') onChangeRo(next);
    else onChangeRu(next);
    onChangeEnabled({ ...enabled, [locale]: true });
    setTab(locale);
  }

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div className="actions" style={{ marginTop: 0 }}>
          <button type="button" onClick={() => setTab('en')} className={tab === 'en' ? 'active' : ''}>
            EN
          </button>
          <button
            type="button"
            onClick={() => setTab('ro')}
            className={tab === 'ro' ? 'active' : ''}
            title={!enabled.ro ? 'Enable RO below to edit (tab is still viewable)' : undefined}
          >
            RO{hasMissingRequired('ro') ? ' *' : ''}
          </button>
          <button
            type="button"
            onClick={() => setTab('ru')}
            className={tab === 'ru' ? 'active' : ''}
            title={!enabled.ru ? 'Enable RU below to edit (tab is still viewable)' : undefined}
          >
            RU{hasMissingRequired('ru') ? ' *' : ''}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={enabled.ro}
            onChange={(e) => setLocaleEnabled('ro', e.target.checked)}
          />
          <span className="muted">Enable RO</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={enabled.ru}
            onChange={(e) => setLocaleEnabled('ru', e.target.checked)}
          />
          <span className="muted">Enable RU</span>
        </label>

        <div style={{ flex: 1 }} />

        <div className="actions" style={{ marginTop: 0 }}>
          <button type="button" onClick={() => copyFromEn('ro')}>
            Copy EN → RO
          </button>
          <button type="button" onClick={() => fillEmptyFromEn('ro')}>
            Fill empty EN → RO
          </button>
          <button type="button" onClick={() => copyFromEn('ru')}>
            Copy EN → RU
          </button>
          <button type="button" onClick={() => fillEmptyFromEn('ru')}>
            Fill empty EN → RU
          </button>
        </div>
      </div>

      {!isLocaleEnabled(tab) && tab !== 'en' && (
        <div className="muted" style={{ marginTop: 10 }}>
          Enable {tab.toUpperCase()} to edit these fields.
        </div>
      )}

      <div style={{ marginTop: 12, opacity: isLocaleEnabled(tab) ? 1 : 0.5 }}>
        {fields.map((f) => (
          <div className="row" key={f.key}>
            <div className="muted">{f.label}</div>
            {f.multiline ? (
              <div>
                <textarea
                  value={active[f.key] ?? ''}
                  onChange={(e) => setActive({ ...active, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  disabled={!isLocaleEnabled(tab)}
                  rows={6}
                />
                {tab !== 'en' &&
                  isLocaleEnabled(tab) &&
                  isRequiredKey(f.key) &&
                  !String(active[f.key] ?? '').trim() && <div className="error">Required</div>}
              </div>
            ) : (
              <div>
                <input
                  value={active[f.key] ?? ''}
                  onChange={(e) => setActive({ ...active, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  disabled={!isLocaleEnabled(tab)}
                />
                {tab !== 'en' &&
                  isLocaleEnabled(tab) &&
                  isRequiredKey(f.key) &&
                  !String(active[f.key] ?? '').trim() && <div className="error">Required</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
