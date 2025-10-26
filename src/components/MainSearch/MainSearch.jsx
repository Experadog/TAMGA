'use client';

import human from '@/assets/icons/human.svg';
import search from '@/assets/icons/search.svg';
import { getLocalizedValue } from '@/lib/utils';
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './MainSearch.module.scss';

const DEBOUNCE_MS = 100;

export const MainSearch = ({ locale: localeProp }) => {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const params = useParams();

  const locale = localeProp || params?.locale || 'ky';

  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  // Подхватываем значение из URL
  useEffect(() => {
    const qParam = sp.get('search') || '';
    setQuery(qParam);
    setOpen(false);
    setItems([]);
  }, [sp]);

  // Закрываем дропдаун при любом изменении пути
  useEffect(() => {
    setOpen(false);
    setItems([]);
  }, [pathname]);

  // Поиск по API (дебаунс)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abortRef.current?.abort();
      setItems([]);
      setOpen(false);
      setActiveIdx(-1);
      return;
    }

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const url = `/api/toponyms/toponym/list/maps?search=${encodeURIComponent(`"${trimmed}"`)}`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setItems(arr);
        setActiveIdx(arr.length ? 0 : -1);
        setOpen(isFocused && arr.length > 0);
      } catch (err) {
        if (err?.name !== 'AbortError') console.error('search error:', err);
      }
    }, DEBOUNCE_MS);

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [query, isFocused]);

  // Клик вне дропдауна
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
        setItems([]);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Обновление URL
  const updateURL = useCallback(
    (newSearchValue) => {
      const params = new URLSearchParams(sp);
      const value = (newSearchValue || '').trim();

      if (value) params.set('search', value);
      else params.delete('search');

      const qs = params.toString();
      const targetUrl = qs ? `/${locale}/search?${qs}` : `/${locale}/search`;

      // Закрываем дропдаун и убираем фокус
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
      inputRef.current?.blur();

      if (pathname.endsWith('/search')) {
        router.replace(targetUrl);
      } else {
        router.push(targetUrl);
      }
    },
    [router, pathname, sp, locale]
  );

  // Выбор из списка
  const onPick = (item) => {
    const title = getLocalizedValue(item, 'name', locale);
    setQuery(title);
    setOpen(false);
    setItems([]);
    setActiveIdx(-1);
    inputRef.current?.blur();
    updateURL(title);
  };

  // Сабмит (Enter)
  const onSubmit = (e) => {
    e.preventDefault();
    const chosen = activeIdx >= 0 ? items[activeIdx] : undefined;
    if (chosen) onPick(chosen);
    else {
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
      inputRef.current?.blur();
      updateURL(query);
    }
  };

  // Навигация стрелками
  const onKeyDown = (e) => {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = items[activeIdx];
      if (chosen) onPick(chosen);
      else updateURL(query);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
    }
  };

  const onWhereAmI = () => {
    // закрываем дропдаун и снимаем фокус
    setOpen(false);
    inputRef.current?.blur();

    // идём на карту с флажком авто-геолокации
    router.push(`/${locale}/map?locate=1`);
  };

  return (
    <div className={styles.mainSearch} ref={wrapRef}>
      <form className={styles.card} onSubmit={onSubmit} role="search" aria-label="Главный поиск">
        <div className={styles.field}>
          <span className={styles.iconSearch} aria-hidden="true">
            {/* Лупа (SVG) */}
            <Image className={styles.labelSearch} src={search} width={24} height={24} alt="" />
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            name="search"
            autoComplete="off"
            placeholder={'Поиск топонимов'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (items.length) setOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setOpen(false), 0);
              setIsFocused(false);
            }}
            onKeyDown={onKeyDown}
          />

          {/* Выпадающий список */}
          {open && items.length > 0 && (
            <ul className={styles.dropdown} role="listbox">
              {items.map((it, idx) => {
                const title = getLocalizedValue(it, 'name', locale);
                return (
                  <li
                    key={`${it.id}-${idx}`}
                    role="option"
                    aria-selected={idx === activeIdx}
                    className={`${styles.item} ${idx === activeIdx ? styles.active : ''}`}
                    onMouseDown={(e) => e.preventDefault()} // чтобы не терять фокус перед кликом
                    onClick={() => onPick(it)}
                  >
                    {title}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          className={styles.whereBtn}
          onClick={onWhereAmI}
        >
          <span className={styles.iconAnchor} aria-hidden="true">
            {/* Якорь (SVG) */}
            <Image className={styles.labelHuman} src={human} width={24} height={24} alt="" />
          </span>
          Где я?
        </button>
      </form>
    </div>
  );
};