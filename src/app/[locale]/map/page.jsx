'use client';

import dynamic from 'next/dynamic';

const CountryMap = dynamic(() => import('@/components/Map/CountryMap'), {
  ssr: false, 
});

export default function MapPage() {
  return (
    <CountryMap />
  )
}