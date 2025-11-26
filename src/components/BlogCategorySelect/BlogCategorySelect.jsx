'use client';

import { getLocalizedValue } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './BlogCategorySelect.module.scss';

export default function BlogCategorySelect({ categories, currentCategory, locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('blog');

  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(currentCategory)),
    [categories, currentCategory]
  );

  const selectedLabel =
    selectedCategory
      ? getLocalizedValue(selectedCategory, 'name', locale) ||
      selectedCategory.name_ky ||
      selectedCategory.name_ru ||
      selectedCategory.name_en
      : t('filter-categories');

  const handleSelect = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('category', value);
      params.set('page', '1');
    } else {
      params.delete('category');
      params.set('page', '1');
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    setOpen(false);
  };

  return (
    <div className={styles.selectWrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.selectButton} ${open ? styles.open : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selectedLabel}</span>
        <span className={styles.icon} aria-hidden="true" />
      </button>

      {open && (
        <ul className={styles.dropdown}>
          <li
            className={!currentCategory ? styles.activeItem : ''}
            onClick={() => handleSelect('')}
          >
            {t('filter-categories')}
          </li>

          {categories.map((cat) => {
            const label =
              getLocalizedValue(cat, 'name', locale) ||
              cat.name_ky ||
              cat.name_ru ||
              cat.name_en ||
              '';

            return (
              <li
                key={cat.id}
                className={
                  String(cat.id) === String(currentCategory)
                    ? styles.activeItem
                    : ''
                }
                onClick={() => handleSelect(cat.id)}
              >
                {label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}