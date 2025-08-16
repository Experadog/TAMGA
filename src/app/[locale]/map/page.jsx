'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';
import clss from './page.module.scss';

const CountryMap = dynamic(() => import('@/components/Map/CountryMap'), {
  ssr: false, 
});

export default function MapPage({ params }) {
  const { locale } = use(params);
  
  return (
    <div className={clss.mapWrapper}>
      <CountryMap locale={locale} />
    </div>
  )
}