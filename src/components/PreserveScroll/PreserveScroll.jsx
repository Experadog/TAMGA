'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PreserveScroll() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams(); // триггерится на любые изменения query

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ключ — на уровень пути, чтобы не плодить по каждому query.
    // Если хочешь отдельную позицию под каждый набор фильтров — раскомментируй следующую строку.
    const key = `scroll:${pathname}`;
    // const key = `scroll:${pathname}?${searchParams?.toString() || ''}`;

    // Не даём браузеру самовольно таскать скролл
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Сохраняем позицию (дёшево)
    let ticking = false;
    const save = () => {
      sessionStorage.setItem(key, String(window.scrollY || 0));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(save);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Восстановление — специально позже, чем автоскролл Next.
    const restore = () => {
      const raw = sessionStorage.getItem(key);
      const y = raw ? parseInt(raw, 10) : 0;
      if (!Number.isFinite(y) || y <= 0) return;

      // Двойной rAF + короткий таймаут — надёжно позже скролла Next
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo(0, y);
          }, 30);
        });
      });
    };

    // 1) при первом маунте
    restore();

    // 2) при каждом изменении query (фильтры/поиск/вид карточек/пагинация)
    //    Next сначала скроллит вверх, потом мы — назад.
    const unsubscribe = () => { }; // просто, чтобы было что вернуть
    restore();

    // подстраховка: при скрытии/покидании страницы — сохранить
    const onHide = () => save();
    window.addEventListener('beforeunload', onHide);
    window.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', onHide);
      window.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
      unsubscribe();
    };
    // Важно: зависим именно от pathname и от строки query (через searchParams)
  }, [pathname, searchParams]);

  return null;
}