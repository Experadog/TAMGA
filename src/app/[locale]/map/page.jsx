import HorizontalFilters from '@/components/HorizontalFilters/HorizontalFilters';
import MapClient from '@/components/Map/MapClient';
import clss from './page.module.scss';

export default async function MapPage({ params }) {
  const { locale } = await params;

  return (
    <div className={clss.pageContainer}>
      <HorizontalFilters locale={locale} />
      <div className={clss.mapWrapper}>
        <MapClient locale={locale} />
      </div>
    </div>
  )
}