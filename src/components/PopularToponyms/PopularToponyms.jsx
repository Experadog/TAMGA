import { Link } from '@/i18n/navigation';
import { fetchOSMData } from '@/lib/utils/fetchOSMData';
import ToponymCard from '../ToponymCard/ToponymCard';
import styles from './PopularToponyms.module.scss';

async function fetchData() {
  try {
    const resp = await fetch(`${process.env.API_URL}/toponyms/toponym/list/maps`, {
      next: { revalidate: 300 }
    })
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error('Error fetching toponym data:', error);
    return null;
  }
}

const statisticData = [
  {
    id: 0,
    title: '5,000 +',
    description: 'Ороним'
  },
  {
    id: 1,
    title: '2,500 +',
    description: 'Ойконим'
  },
  {
    id: 2,
    title: '5,000 +',
    description: 'Антропотопонимы'
  },
  {
    id: 3,
    title: '2,000 +',
    description: 'Неотопонимы'
  },
  {
    id: 4,
    title: '2,400 +',
    description: 'Этнотопонимы'
  }
]

export async function PopularToponyms({ locale }) {

  const items = (await fetchData()) ?? [];

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
          )
          }
        </ul>

        <div className={styles.buttonBlock}>
          <Link href='/glossary' className={`${styles.button} ${styles.buttonDown}`}>Посмотреть все</Link>
        </div>
      </div>


      <div className={styles.popularToponymsBottom}>
        {statisticData.map(item => (
          <ul key={item.id} className={styles.list}>
            <li className={styles.elOne}>{item.title}</li>
            <li className={styles.elTwo}>{item.description}</li>
          </ul>
        ))}
      </div>
    </>
  )
}

