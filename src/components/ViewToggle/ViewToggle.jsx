'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import cls from './ViewToggle.module.scss';

export default function ViewToggle() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const initial = sp.get('view') === 'grid' ? 'grid' : 'list';
  const [mode, setMode] = useState(initial);

  useEffect(() => {
    const v = sp.get('view') === 'grid' ? 'grid' : 'list';
    setMode(v);
  }, [sp]);

  const pushMode = (m) => {
    if (m === mode) return;

    const params = new URLSearchParams(sp.toString());
    if (m === 'list') params.delete('view');
    else params.set('view', m);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); // ← вот это важно
    setMode(m);
  };

  return (
    <div
      className={cls.toggleWrap}
      role="group"
      aria-label="Режим отображения"
    >
      <button
        type="button"
        className={`${cls.btn} ${mode === 'list' ? cls.active : ''}`}
        aria-pressed={mode === 'list'}
        aria-label="Показать списком"
        onClick={() => pushMode('list')}
      >
        <ListIcon />
      </button>

      <button
        type="button"
        className={`${cls.btn} ${mode === 'grid' ? cls.active : ''}`}
        aria-pressed={mode === 'grid'}
        aria-label="Показать сеткой"
        onClick={() => pushMode('grid')}
      >
        <GridIcon />
      </button>
    </div>
  );
}

ViewToggle.propTypes = {
  className: PropTypes.string,
};

function ListIcon({ size = 18 }) {
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

function GridIcon({ size = 20 }) {
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