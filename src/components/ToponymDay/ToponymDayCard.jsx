import ClientMapWrapper from '@/app/[locale]/[toponym]/_components/ClientMapWrapper';
import arrow from '@/assets/icons/arrowRight.svg';
import chevron from '@/assets/icons/chevron.svg';
import { Link } from '@/i18n/navigation';
import { cleanHtml, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import styles from './ToponymDay.module.scss';

async function ToponymDayCard({ osmData, toponym, locale, dateISO, prevHref, nextHref }) {

  const {
    slug,
    region,
    terms_topomyns,
    osm_id
  } = toponym || {};

  const t = await getTranslations({ locale, namespace: 'home' });

  const region0 = Array.isArray(region) ? region[0] : null;

  return (
    <div className={styles.toponymDayLeft}>
      <div className={styles.cardTop}>
        <h2 className={styles.title}>{t('toponym-day.title')}</h2>
        <div className={styles.dateBlock}>
          {prevHref ? (
            <Link href={prevHref} prefetch scroll={false} className={styles.arrowBtn} aria-label="Предыдущий день">
              <Image className={styles.chevronLeft} src={chevron} alt='' width={32} height={32} />
            </Link>
          ) : (
            <button className={styles.arrowBtn} disabled>
              <Image className={styles.chevronLeft} src={chevron} alt='' width={32} height={32} />
            </button>
          )}
          <span className={styles.date}>{dateISO}</span>
          {nextHref ? (
            <Link href={nextHref} prefetch scroll={false} className={styles.arrowBtn} aria-label="Следующий день">
              <Image className={styles.chevronRight} src={chevron} alt='' width={32} height={32} />
            </Link>
          ) : (
            <button className={styles.arrowBtn} disabled>
              <Image className={styles.chevronRight} src={chevron} alt='' width={32} height={32} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.imagePlaceholder}>
          <div className={styles.cardImage}>
            {toponym ? (
              <ClientMapWrapper toponym={toponym} osmId={osm_id} osmData={osmData} />
            ) : (
              <div className={styles.cardImageDefault}>{t('no-data')}</div>
            )}
          </div>
        </div>
        <div className={styles.info}>
          <div className={styles.infoBlock}>
            <h3 className={styles.name}>{toponym ? getLocalizedValue(toponym, 'name', locale) : t('name')}</h3>
            <p className={styles.meta}>{toponym ? (region0 ? getLocalizedValue(region0, 'name', locale) : t('region')) : t('region')}</p>
            <p className={styles.meta}>{toponym ? getLocalizedValue(terms_topomyns, 'name', locale) : t('object-type')}</p>
            <p className={styles.metaDescription}>
              {toponym ? cleanHtml(stripHtmlTags(getLocalizedValue(toponym, 'description', locale))) : t('brief-description')}
            </p>
          </div>

          <div className={styles.moreBlock}>
            {toponym && slug ? (
              <Link href={`/${slug}`} className={styles.moreBtn}>
                {t('more-details')}
                <Image
                  src={arrow}
                  alt=''
                  width={24}
                  height={24}
                  className={styles.moreArrow}
                />
              </Link>
            ) : (
              <button className={styles.moreBtn} disabled>
                {t('more-details')}
                <Image
                  src={arrow}
                  alt=''
                  width={24}
                  height={24}
                  className={styles.moreArrow}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div >
  )
}

export default ToponymDayCard
