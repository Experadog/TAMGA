'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const CountryMap = dynamic(() => import('@/components/Map/CountryMap'), {
  ssr: false, 
});

export default function MapPage({ params }) {
  const { locale } = use(params);
  
  return (
    <CountryMap locale={locale} />
  )
}