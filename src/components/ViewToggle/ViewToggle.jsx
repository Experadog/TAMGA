'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import cls from './ViewToggle.module.scss';

export default function ViewToggle({ modes = ['horizontal', 'vertical'] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const isGlossary = pathname?.includes('/glossary');
  const defaultMode = isGlossary && modes.includes('list') ? 'list' : 'horizontal';

  const getInitial = () => {
    const v = sp.get('view');
    if (v && modes.includes(v)) return v;
    return defaultMode;
  };
  const [mode, setMode] = useState(getInitial);

  useEffect(() => {
    const v = sp.get('view');
    setMode(v && modes.includes(v) ? v : defaultMode);
  }, [sp, modes, defaultMode]);

  const pushMode = (m) => {
    if (m === mode) return;
    const params = new URLSearchParams(sp.toString());

    if (m === defaultMode) params.delete('view');
    else params.set('view', m);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setMode(m);
  };

  const has = useMemo(() => ({
    horizontal: modes.includes('horizontal'),
    vertical: modes.includes('vertical'),
    list: modes.includes('list'),
  }), [modes]);

  return (
    <div
      className={cls.toggleWrap}
      data-glossary={isGlossary ? 'true' : 'false'}
      role="group"
      aria-label="Режим отображения"
    >
      {has.list && (
        <button
          type="button"
          className={`${cls.btn} ${mode === 'list' ? cls.active : ''}`}
          aria-pressed={mode === 'list'}
          aria-label="Показать по алфавиту"
          onClick={() => pushMode('list')}
        >
          <ListIcon />
        </button>
      )}
      {has.horizontal && (
        <button
          type="button"
          className={`${cls.btn} ${cls.btnHorizontal} ${mode === 'horizontal' ? cls.active : ''}`}
          aria-pressed={mode === 'horizontal'}
          aria-label="Показать горизонтальные карточки"
          onClick={() => pushMode('horizontal')}
        >
          <HorizontalIcon />
        </button>
      )}
      {has.vertical && (
        <button
          type="button"
          className={`${cls.btn} ${mode === 'vertical' ? cls.active : ''}`}
          aria-pressed={mode === 'vertical'}
          aria-label="Показать вертикальные карточки"
          onClick={() => pushMode('vertical')}
        >
          <VerticalIcon />
        </button>
      )}
    </div>
  );
}

function HorizontalIcon({ size = 18 }) {
  return (
    <svg
      viewBox="0 0 20 18"
      width={size}
      height={size}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="0.5" y="0" width="19" height="7" rx="2" fill="#fff" stroke="currentColor" />
      <rect x="0.5" y="10" width="19" height="7" rx="2" fill="#fff" stroke="currentColor" />
    </svg>
  );
}

function VerticalIcon({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="1" y="1" width="8" height="8" rx="2" fill="#fff" stroke="currentColor" />
      <rect x="11" y="1" width="8" height="8" rx="2" fill="#fff" stroke="currentColor" />
      <rect x="1" y="11" width="8" height="8" rx="2" fill="#fff" stroke="currentColor" />
      <rect x="11" y="11" width="8" height="8" rx="2" fill="#fff" stroke="currentColor" />
    </svg>
  );
}

function ListIcon({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="1" y="1" width="17.5" height="2" rx="2" fill="currentColor" stroke="currentColor" />
      <rect x="1" y="6" width="17.5" height="2" rx="2" fill="currentColor" stroke="currentColor" />
      <rect x="1" y="11" width="17.5" height="2" rx="2" fill="currentColor" stroke="currentColor" />
      <rect x="1" y="16" width="17.5" height="2" rx="2" fill="currentColor" stroke="currentColor" />
    </svg>
  );
}