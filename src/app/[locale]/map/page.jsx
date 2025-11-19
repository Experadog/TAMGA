import HorizontalFilters from '@/components/HorizontalFilters/HorizontalFilters';
import MapClient from '@/components/Map/MapClient';
import { setRequestLocale } from 'next-intl/server';
import clss from './page.module.scss';

export default async function MapPage({ params }) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className={clss.pageContainer}>
      <HorizontalFilters locale={locale} pageKind="map" />
      <div className={clss.mapWrapper}>
        <MapClient locale={locale} />
      </div>
    </div>
  )
}