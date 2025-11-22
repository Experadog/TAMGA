import { Link } from '@/i18n/navigation';
import { fetchOSMData } from '@/lib/utils/fetchOSMData';
import { fetchToponymOfDay, navHrefs, pickDateFromParams, toISO } from '@/lib/utils/toponymDay';
import { getTranslations } from 'next-intl/server';
import styles from './ToponymDay.module.scss';
import ToponymDayCard from './ToponymDayCard';

async function fetchData(day, month) {
  try {
    const base = `${process.env.API_URL}/toponyms/toponym/days/`;
    const qs = (day && month) ? `?day=${encodeURIComponent(day)}&month=${encodeURIComponent(month)}` : '';
    // const resp = await fetch(base + qs, { cache: 'no-store' });
    const isSpecificDay = Boolean(day && month);
    const resp = await fetch(base + qs, {
      next: { revalidate: isSpecificDay ? 86400 : 300 } // 24h vs 5m
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (error) {
    console.error('Error fetching toponym data:', error);
    return null;
  }
}

export async function ToponymDay({ locale, searchParams }) {
  const sp = await searchParams;
  const { current, now, min, max } = pickDateFromParams(sp);
  const dateISO = toISO(current);
  const t = await getTranslations({ locale, namespace: 'home' });

  const toponym = await fetchToponymOfDay(fetchData, current, now);

  // прогреем кэш соседних дат (если в диапазоне)
  try {
    const prev = new Date(current); prev.setDate(prev.getDate() - 1);
    const next = new Date(current); next.setDate(next.getDate() + 1);
    const jobs = [];
    if (prev >= min) jobs.push(fetchData(prev.getDate(), prev.getMonth() + 1));
    if (next <= max) jobs.push(fetchData(next.getDate(), next.getMonth() + 1));
    // не ждем — пусть бегут в фоне
    Promise.allSettled(jobs);
  } catch (_) { }

  let osmData = null;
  if (toponym?.osm_id) {
    const termEn = (toponym?.terms_topomyns?.name_en || '').toLowerCase();
    const isCity = termEn === 'city' || termEn === 'town';
    osmData = await fetchOSMData(toponym.osm_id, isCity, termEn);
  }
  if (!osmData && Number.isFinite(toponym?.latitude) && Number.isFinite(toponym?.longitude)) {
    osmData = { point: [toponym.latitude, toponym.longitude], elementType: 'node' };
  }

  const basePath = `/`;
  const { prevHref, nextHref } = navHrefs(basePath, current, min, max, now);

  return (
    <section className={styles.toponymDay}>
      <ToponymDayCard
        locale={locale}
        searchParams={sp}
        toponym={toponym}
        osmData={osmData}
        dateISO={dateISO}
        prevHref={prevHref}
        nextHref={nextHref}
      />
      <div className={styles.toponymDayRight}>
        <div className={styles.topBlock}>
          <h2 className={styles.topBlockTitle}>{t('about-project.title')}</h2>
          <p className={styles.topBlockDescription}>
            {t('about-project.description')}
          </p>
        </div>
        <div className={styles.bottomBlock}>
          <Link href='/about' className={styles.bottomBlockButton}>{t('more-details')}</Link>
        </div>
      </div>
    </section>
  );
};