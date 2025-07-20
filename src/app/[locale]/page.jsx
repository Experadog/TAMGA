import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import styles from './page.module.scss';

export default function Home({ params }) {
  const {locale} = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <>
      <section className={`${styles.hero} full-width`}>
        <div className={styles.hero__bg}>
          {/* <h1 className={styles.hero__heading}>{t('hero-heading')}</h1>
          <p className={styles.hero__desc}>{t('hero-desc')}</p> */}
        </div>
      </section>
    </>
  );
}
