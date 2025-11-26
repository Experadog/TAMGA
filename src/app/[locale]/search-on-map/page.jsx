import CoordsMapClient from '@/components/SearchMap/CoordsMapClient';
import { routing } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import style from './page.module.scss';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const tMeta = await getTranslations({ locale, namespace: 'mapSearch' });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/search-on-map`;
  const absoluteUrl = `${siteUrl}${pathname}`;


  const title = tMeta('meta.title')
  const description = tMeta('meta.description')

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/search-on-map`;
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

export default async function SearchOnMapPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className={style.section}>
      <div className={style.mapContainer}>
        <CoordsMapClient locale={locale} />
      </div>
    </section>
  );
}