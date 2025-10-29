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
  const [usedKeyboardNav, setUsedKeyboardNav] = useState(false);

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
    setActiveIdx(-1);
    setUsedKeyboardNav(false);
  }, [sp]);

  // Закрываем дропдаун при любом изменении пути
  useEffect(() => {
    setOpen(false);
    setItems([]);
    setActiveIdx(-1);
    setUsedKeyboardNav(false);
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

        const seen = new Set();
        const deduped = arr.filter((it) => {
          const title = (getLocalizedValue(it, 'name', locale) || '')
            .trim()
            .toLowerCase();
          if (!title || seen.has(title)) return false;
          seen.add(title);
          return true;
        });

        setItems(deduped);
        setOpen(isFocused && deduped.length > 0);
        setActiveIdx(-1);
      } catch (err) {
        if (err?.name !== 'AbortError') console.error('search error:', err);
      }
    }, DEBOUNCE_MS);

    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [query, isFocused, locale]);

  // Клик вне дропдауна
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
        setItems([]);
        setActiveIdx(-1);
        setUsedKeyboardNav(false);
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

      params.delete('page');

      const qs = params.toString();
      const targetUrl = qs ? `/${locale}/search?${qs}` : `/${locale}/search`;

      // Закрываем дропдаун и убираем фокус
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
      setUsedKeyboardNav(false);
      inputRef.current?.blur();

      if (pathname.endsWith('/search')) {
        router.replace(targetUrl, { scroll: false });
      } else {
        router.push(targetUrl, { scroll: false });
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
    if (usedKeyboardNav && activeIdx >= 0 && activeIdx < items.length) {
      onPick(items[activeIdx]);
    } else {
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
      setUsedKeyboardNav(false);
      inputRef.current?.blur();
      updateURL(query);
    }
  };

  // Навигация стрелками
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (!open || !items.length) return;
      e.preventDefault();
      setUsedKeyboardNav(true);
      setActiveIdx((i) => {
        const next = i < 0 ? 0 : (i + 1) % items.length;
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      if (!open || !items.length) return;
      e.preventDefault();
      setUsedKeyboardNav(true);
      setActiveIdx((i) => {
        if (i < 0) return items.length - 1;
        return (i - 1 + items.length) % items.length;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget.form)?.requestSubmit();
    } else if (e.key === 'Escape') {
      setOpen(false);
      setItems([]);
      setActiveIdx(-1);
      setUsedKeyboardNav(false);
    }
  };

  const onWhereAmI = () => {
    setOpen(false);
    inputRef.current?.blur();
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
              setActiveIdx(-1);
              setUsedKeyboardNav(false);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (items.length) setOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setOpen(false), 0);
              setIsFocused(false);
              setUsedKeyboardNav(false);
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
                    onMouseDown={(e) => e.preventDefault()}
                    // onMouseEnter={() => setActiveIdx(idx)}
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