import React, { createContext, useContext, useMemo, useState } from 'react';

export type PublicLang = 'en' | 'ro' | 'ru';

const STORAGE_KEY = 'mdfilm-lang';

function normalizeLang(value: string | null): PublicLang {
  if (value === 'ro' || value === 'ru' || value === 'en') return value;
  return 'en';
}

type PublicLangCtx = {
  lang: PublicLang;
  setLang: (next: PublicLang) => void;
};

const Ctx = createContext<PublicLangCtx | null>(null);

export function PublicLangProvider(props: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<PublicLang>(() => normalizeLang(localStorage.getItem(STORAGE_KEY)));

  function setLang(next: PublicLang) {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo(() => ({ lang, setLang }), [lang]);

  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>;
}

export function usePublicLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePublicLang must be used within PublicLangProvider');
  return v;
}
