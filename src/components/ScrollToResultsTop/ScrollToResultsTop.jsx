'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ScrollToResultsTop() {
  const params = useSearchParams();

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    const page = params.get('page');

    if (!page) {
      return;
    }

    const el = document.getElementById('results-top');
    if (!el) return;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    setTimeout(() => {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 40);
  }, [params]);

  return null;
}
