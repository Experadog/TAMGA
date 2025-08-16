import clss from './page.module.scss';
import HorizontalFilters from '@/components/HorizontalFilters/HorizontalFilters';
import MapClient from '@/components/Map/MapClient';

export default async function MapPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className={clss.pageContainer}>
      <HorizontalFilters locale={locale} directories={{}} />
      <div className={clss.mapWrapper}>
        <MapClient searchParams={resolvedSearchParams} locale={locale} />
      </div>
    </div>
  )
}