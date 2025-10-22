import { MainSearch } from "@/components/MainSearch/MainSearch";
import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from './page.module.scss';


export default async function SearchPage({ params }) {

  const { locale } = params;

  const t = await getTranslations('search')

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
        </div>
      </section>


      
    </>
  )
}