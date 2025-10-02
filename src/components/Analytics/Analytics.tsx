'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';


export default function Analytics({ gaId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const page_path = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', gaId, { page_path });
    }
  }, [gaId, pathname, searchParams]);

  return null;
}