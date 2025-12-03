import HorizontalFilters from '@/components/HorizontalFilters/HorizontalFilters';
import MapClient from '@/components/Map/MapClient';
import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import clss from './page.module.scss';

async function fetchData() {
  try {
    const resp = await fetch(`${process.env.API_URL}/toponyms?limit=1`);

    if (!resp.ok) {
      if (resp.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching toponym data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const data = await fetchData();
  if (!data) { throw new Error('Toponym data not found') }

  // общее количество топонимов
  const totalCount =
    typeof data.count === 'number' ? data.count : 0;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/map`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  const collapse = (s = '') =>
    String(s || '')
      .replace(/\s+/g, ' ')
      .trim();

  const tMeta = await getTranslations({
    locale,
    namespace: 'map',
  });

  const titleTranslate = tMeta('metadata.title') || '';
  const descriptionTranslate = tMeta('metadata.description') || '';


  const title = collapse(`${totalCount} ${titleTranslate}`);
  const description = collapse(descriptionTranslate);

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/map`;
        return acc;
      }, {})
    },
    openGraph: {
      type: 'website',
      locale,
      siteName: 'Tamga.kg',
      url: absoluteUrl,
      title,
      description,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage]
    },

    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1
    }
  };
}

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