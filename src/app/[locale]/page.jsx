import { routing } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

import Blog from "@/components/Blog/Blog";
import MainForm from "@/components/MainForm/MainForm";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import MapClient from "@/components/Map/MapClient";
import { PopularToponyms } from "@/components/PopularToponyms/PopularToponyms";
import { ToponymDay } from "@/components/ToponymDay/ToponymDay";
import styles from './page.module.scss';

export async function generateMetadata({ params }) {
  const { locale } = params;

  const t = await getTranslations({ locale });

  const title = t('home.seo.title');
  const description = t('home.seo.description');

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
  const { locale } = params;
  const t = await getTranslations('home');
  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <h1 className={styles.hero__heading}>{t('hero.title')}</h1>
        <p className={styles.hero__desc}>
          {t('hero.description')}
        </p>
        <div className={styles.hero__search}>
          <MainSearch locale={locale} />
          <ToponymDay />
        </div>
      </section>

      <section className={styles.popular}>
        <PopularToponyms locale={locale} />
      </section>

      <section className={styles.mapContainer}>
        <h2 className={styles.title}>Интерактивная карта</h2>
        <div className={styles.descriptionBlock}>
          <p className={styles.description}>
            We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to
          </p>
          <button className={styles.button}>Перейти на карту</button>
        </div>
        <div className={styles.mapWrapper}>
          <MapClient locale={locale} />
        </div>
        <div className={styles.buttonBlock}>
          <button className={`${styles.button} ${styles.buttonDown}`}>Перейти на карту</button>
        </div>
      </section>
      <section className={styles.blogContainer}>
        <Blog locale={locale} searchParams={searchParams} />
      </section>
      <section className={styles.formContainer}>
        <MainForm />
      </section>
    </>
  );
}
