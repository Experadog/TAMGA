import { Link } from '@/i18n/navigation';
import { fetchOSMData } from '@/lib/utils/fetchOSMData';
import { getLocalizedValue } from '../../lib/utils/get-localize-value';
import ToponymCard from '../ToponymCard/ToponymCard';
import styles from './PopularToponyms.module.scss';

async function fetchData() {
  try {
    const resp = await fetch(`${process.env.API_URL}/toponyms`, {
      next: { revalidate: 300 }
    })
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching toponym data:', error);
    return null;
  }
}

async function fetchClassToponymsCount() {
  try {
    const resp = await fetch(`${process.env.API_URL}/directories/class-topomyns-count`, {
      next: { revalidate: 300 }
    })
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching class toponym count:', error);
    return null;
  }
}

export async function PopularToponyms({ locale }) {
  const data = await fetchData();
  const items = Array.isArray(data?.results) ? data.results : [];
  const statisticData = (await fetchClassToponymsCount()) ?? [];

  // Топ-4 по count_visits (по убыванию). Если нет значения — считаем 0.
  const top4 = [...items]
    .sort((a, b) => (b?.count_visits ?? 0) - (a?.count_visits ?? 0))
    .slice(0, 4);

  // Тянем OSM только для этих 4
  const cards = await Promise.all(
    top4.map(async (item) => {
      const isCity = item?.terms_topomyns?.name_en?.toLowerCase() === 'city';
      const termEn = item?.terms_topomyns?.name_en || '';
      const osmData = item?.osm_id ? await fetchOSMData(item.osm_id, isCity, termEn) : null;
      return { item, osmData };
    })
  );

  return (
    <>
      <div className={styles.popularToponymsTop}>
        <h2 className={styles.title}>Популярные топонимы</h2>
        <div className={styles.descriptionBlock}>
          <p className={styles.description}>
            We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to
          </p>
          <Link href='/glossary' className={styles.button}>Посмотреть все</Link>
        </div>

        <ul className={styles.cardsBlock}>
          {cards.length > 0 && (
            cards.map(({ item, osmData }) => (
              <li key={item.id}>
                <ToponymCard toponym={item} osmData={osmData} locale={locale} />
              </li>
            ))
          )}
        </ul>

        <div className={styles.buttonBlock}>
          <Link href='/glossary' className={`${styles.button} ${styles.buttonDown}`}>Посмотреть все</Link>
        </div>
      </div>


      <div className={styles.popularToponymsBottom}>
        {statisticData.length > 0 && (
          statisticData.map(item =>
            Number(item.count_toponyms) > 0 && (
              <ul key={item.id} className={styles.list}>
                <li className={styles.elOne}>{item.count_toponyms} +</li>
                <li className={styles.elTwo}>{getLocalizedValue(item, 'name', locale)}</li>
              </ul>
            ))
        )}
      </div>
    </>
  )
}

