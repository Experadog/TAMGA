'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash?.slice(1);
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    // Можно без smooth, если не нужно анимировать
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pathname]); // срабатывает при переходе на /[locale]/about#...

  return null;
}