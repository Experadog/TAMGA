import { getTranslations, setRequestLocale } from "next-intl/server";

import Blog from "@/components/Blog/Blog";
import MainForm from "@/components/MainForm/MainForm";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import MapClient from "@/components/Map/MapClient";
import PopularToponyms from "@/components/PopularToponyms/PopularToponyms";
import { ToponymDay } from "@/components/ToponymDay/ToponymDay";
import styles from './page.module.scss';

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
          <MainSearch />
          <ToponymDay />
        </div>
      </section>

      <section className={styles.popular}>
        <PopularToponyms />
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
