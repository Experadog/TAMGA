import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

import map from '@/assets/images/defaultMap.png';
import mapMobile from '@/assets/images/mapMobile.png';
import mapTablet from '@/assets/images/mapTablet.png';
import Blog from "@/components/Blog/Blog";
import MainForm from "@/components/MainForm/MainForm";
import { MainSearch } from "@/components/MainSearch/MainSearch";
// import MapClient from "@/components/Map/MapClient";
import { PopularToponyms } from "@/components/PopularToponyms/PopularToponyms";
import { ToponymDay } from "@/components/ToponymDay/ToponymDay";
import { Link } from "@/i18n/navigation";
import { getStartsWithByLocale } from "@/lib/utils/getStartsWithByLocale";
import Image from "next/image";
import { Suspense } from "react";
import styles from './page.module.scss';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'home' });

  const title = t('seo.title');
  const description = t('seo.description');

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = loc === routing.defaultLocale ? '/' : `/${loc}`;
        return acc;
      }, {}),
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

export default async function Home({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams
  setRequestLocale(locale);
  const startswith = getStartsWithByLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <h1 className={styles.hero__heading}>{t('hero.title')}</h1>
        <p className={styles.hero__desc}>
          {t('hero.description')}
        </p>
        <div className={styles.hero__search}>
          <Suspense fallback={null}>
            <MainSearch locale={locale} />
          </Suspense>
          <Suspense fallback={null}>
            <ToponymDay locale={locale} searchParams={sp} />
          </Suspense>
        </div>
      </section>

      <section className={styles.popular}>
        <Suspense fallback={null}>
          <PopularToponyms locale={locale} />
        </Suspense>
      </section>

      <section className={styles.mapContainer}>
        <h2 className={styles.title}>Интерактивная карта</h2>
        <div className={styles.descriptionBlock}>
          <p className={styles.description}>
            We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to
          </p>
          <Link
            href={{
              pathname: `/map`,
              query: {
                startswith,
                offset: '0',
                language: locale,
              },
            }}
            className={styles.button}
          >
            Перейти на карту
          </Link>
        </div>
        <div className={styles.mapWrapper}>
          {/* <Suspense fallback={null}>
            <MapClient locale={locale} />
          </Suspense> */}
          <Image className={styles.defaultImage} src={map} alt="" width={1312} height={724} />
          <Image className={styles.mapTablet} src={mapTablet} alt="" width={1312} height={724} />
          <Image className={styles.mapMobile} src={mapMobile} alt="" width={1312} height={724} />
        </div>
        <div className={styles.buttonBlock}>
          <Link
            href={{
              pathname: `/map`,
              query: {
                startswith,
                offset: '0',
                language: locale,
              },
            }}
            className={`${styles.button} ${styles.buttonDown}`}
          >
            Перейти на карту
          </Link>
        </div>
      </section>
      <section className={styles.blogContainer}>
        <Suspense fallback={null}>
          <Blog locale={locale} searchParams={sp} />
        </Suspense>
      </section>
      <section className={styles.formContainer}>
        <Suspense fallback={null}>
          <MainForm />
        </Suspense>
      </section>
    </>
  );
}
