'use client';

import dynamic from 'next/dynamic';

const SearchableMapComponent = dynamic(() => import('./SearchableMapComponent'), {
  ssr: false, 
});

export default function SearchableMapClient({ searchTerm, searchType, locale }) {
  return <SearchableMapComponent searchTerm={searchTerm} searchType={searchType} locale={locale} />;
}
