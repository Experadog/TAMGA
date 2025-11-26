'use client';

import dynamic from 'next/dynamic';

const CoordsMapClientComponent = dynamic(() => import('./CoordsMapClientComponent'), {
  ssr: false,
});

export default function CoordsMapClient({ searchTerm, searchType, locale }) {
  return <CoordsMapClientComponent searchTerm={searchTerm} searchType={searchType} locale={locale} />;
}
