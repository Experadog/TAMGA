import ClientMapWrapper from '@/app/[locale]/[toponym]/_components/ClientMapWrapper';
import arrow from '@/assets/icons/arrowRight.svg';
import { Link } from '@/i18n/navigation';
import { cleanHtml, getLocalizedValue } from '@/lib/utils';
import Image from 'next/image';
import MapClickable from './MapClickable';
import styles from './ToponymCard.module.scss';

function ToponymCard({ osmData, toponym, locale }) {

  const {
    slug,
    region,
    terms_topomyns,
    matching_toponyms_count,
    osm_id,
    name_en,
  } = toponym;

  const nameEN = (name_en || '').normalize('NFC');

  const description = getLocalizedValue(toponym, 'description', locale) || '';
  const cleanDescription = cleanHtml(description);

  return (
    <div className={styles.cardContainer}>
      <MapClickable>
        <div className={styles.cardImage}>
          <ClientMapWrapper toponym={toponym} osmId={osm_id} osmData={osmData} />
        </div>
      </MapClickable>
      <div className={styles.cardContent}>
        <div className={styles.topContent}>
          <h3 className={styles.title}>
            {getLocalizedValue(toponym, 'name', locale)}
          </h3>
          <p className={styles.description}>
            {getLocalizedValue(Array.isArray(region) ? region[0] : region, 'name', locale) || ''}
          </p>
          <p className={styles.description}>
            {getLocalizedValue(terms_topomyns, 'name', locale)}
          </p>
          <div className={styles.descriptionBody} dangerouslySetInnerHTML={{ __html: cleanDescription }}>
            {/* {cleanHtml(getLocalizedValue(toponym, 'description', locale) || '')} */}
          </div>
        </div>
        <div className={styles.bottomContent}>
          <Link
            href={{
              pathname: `/glossary/${nameEN}`,
              query: { search: nameEN }
            }}
            className={styles.similar}
            prefetch={false}
          >
            {matching_toponyms_count} cовпадений
          </Link>
          <Link href={`/${slug}`} className={styles.moreBtn} prefetch={false}>
            Подробнее
            <Image
              src={arrow}
              alt=''
              width={24}
              height={24}
              className={styles.moreArrow}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ToponymCard
