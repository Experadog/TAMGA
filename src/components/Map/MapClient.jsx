'use client';

import dynamic from 'next/dynamic';

const CountryMap = dynamic(() => import('./CountryMap'), {
  ssr: false, 
});

export default function MapClient({ searchParams, locale }) {
  // Проверяем, что searchParams является объектом
  const safeSearchParams = searchParams && typeof searchParams === 'object' ? searchParams : {};
  
  return <CountryMap searchParams={safeSearchParams} locale={locale} />;
}
