'use client';

import dynamic from 'next/dynamic';

const CountryMap = dynamic(() => import('./CountryMap'), {
  ssr: false,
});

export default function MapClient({ locale, glossaryToponyms }) {

  return <CountryMap locale={locale} glossaryToponyms={glossaryToponyms} />
}
