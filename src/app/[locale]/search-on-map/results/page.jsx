import arrowLeft from '@/assets/icons/arrowLeftRight.svg';
import arrowUp from '@/assets/icons/arrowUpDown.svg';
import backToMapIcon from '@/assets/icons/backToMapIcon.svg';
import pinInner from '@/assets/icons/pin-inner.svg';
import pinInnerBlue from '@/assets/icons/pinInnerBlueIcon.svg';
import HorizontalFilters from '@/components/HorizontalFilters';
import { Pagination } from '@/components/Pagination';
import ToponymCard from '@/components/ToponymCard/ToponymCard';
import ToponymCardGrid from '@/components/ToponymCardGrid/ToponymCardGrid';
import ViewToggle from '@/components/ViewToggle/ViewToggle';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getLocalizedValue } from '@/lib/utils';
import { fetchOSMData } from '@/lib/utils/fetchOSMData';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Suspense } from 'react';
import style from './page.module.scss';

export const dynamic = 'force-dynamic';

// helper для перевода в DMS
function toDMS(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const abs = Math.abs(num);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);

  return `${deg}°${String(min).padStart(2, '0')}′${String(sec).padStart(
    2,
    '0'
  )}″`;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const tMeta = await getTranslations({ locale, namespace: 'mapSearchResults' });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/search-on-map/results`;
  const absoluteUrl = `${siteUrl}${pathname}`;


  const title = tMeta('meta.title')
  const description = tMeta('meta.description')

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/search-on-map/results`;
        return acc;
      }, {})
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

export default async function SearchOnMapResultsPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'mapSearch' })

  const sp = await searchParams;

  const latitude = sp?.latitude;
  const longitude = sp?.longitude;
  const radius = sp?.radius;

  if (!latitude || !longitude || !radius) {
    return (
      <section className={style.resultsSection}>
        <>
          <Link href={`/search-on-map`} className={`${style.backBtn} ${style.backBtnVoid}`}>
            <Image src={backToMapIcon} alt='back icon' width={24} height={24} />
            {t('back-to-map')}
          </Link>
          <h1 className={style.pageTitle}>{t('results-by-coords')}</h1>
          <p>{t('no-params')}</p>
        </>
      </section>
    );
  }

  const page = sp?.page ? parseInt(sp.page, 10) || 1 : 1;
  const itemsPerPage = 16;
  const offset = (page - 1) * itemsPerPage;

  const qs = new URLSearchParams();

  // координаты
  qs.set('latitude', String(latitude));
  qs.set('longitude', String(longitude));
  qs.set('radius', String(radius));

  // пагинация
  qs.set('limit', String(itemsPerPage));
  qs.set('offset', String(offset));

  // пробрасываем остальные фильтры из URL (которые задаёт HorizontalFilters)
  for (const [key, val] of Object.entries(sp || {})) {
    if (['page', 'view', 'latitude', 'longitude', 'radius'].includes(key)) continue;

    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (v != null && v !== '') qs.append(key, String(v));
      });
    } else if (val != null && val !== '') {
      qs.append(key, String(val));
    }
  }

  let data = [];
  let totalCount = 0;

  try {
    const resp = await fetch(
      `${process.env.API_URL}/toponyms/toponym/list/maps/?${qs.toString()}`,
      { cache: 'no-store' }
    );

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();
    const rawResults = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];

    data = rawResults;
    totalCount =
      typeof json?.count === 'number'
        ? json.count
        : rawResults.length;
  } catch (err) {
    console.error('Error fetching map search results:', err);
    data = [];
    totalCount = 0;
  }

  // легкая сортировка как на search по text query (если он есть)
  const paramsFromUrl = new URLSearchParams();
  for (const [key, val] of Object.entries(sp || {})) {
    if (Array.isArray(val)) {
      val.forEach((v) => {
        if (v != null && v !== '') paramsFromUrl.append(key, String(v));
      });
    } else if (val != null && val !== '') {
      paramsFromUrl.set(key, String(val));
    }
  }

  const rawQ = (paramsFromUrl.get('search') || '').trim();
  const norm = (s) =>
    (s || '')
      .trim()
      .toLocaleLowerCase('ru')
      .replaceAll('ё', 'е');

  if (rawQ) {
    const q = norm(rawQ);

    data = data.slice().sort((a, b) => {
      const an = norm(getLocalizedValue(a, 'name', locale) || '');
      const bn = norm(getLocalizedValue(b, 'name', locale) || '');

      const aStarts = an.startsWith(q) ? 0 : 1;
      const bStarts = bn.startsWith(q) ? 0 : 1;

      if (aStarts !== bStarts) return aStarts - bStarts;

      return (getLocalizedValue(a, 'name', locale) || '').localeCompare(
        getLocalizedValue(b, 'name', locale) || '',
        locale
      );
    });
  }

  // подгружаем osmData для карточек (как на search)
  const cards = await Promise.all(
    data.map(async (item) => {
      const isCity = item?.terms_topomyns?.name_en?.toLowerCase() === 'city';
      const osmData = item?.osm_id
        ? await fetchOSMData(item.osm_id, isCity)
        : null;
      return { item, osmData };
    })
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const view = sp?.view === 'vertical' ? 'vertical' : 'horizontal';

  const latDms = toDMS(latitude);
  const lngDms = toDMS(longitude);

  return (
    <section className={style.resultsSection}>
      <Link href={`/search-on-map`} className={style.backBtn}>
        <Image src={backToMapIcon} alt='back icon' width={24} height={24} />
        {t('back-to-map')}
      </Link>
      <div className={style.coordsHeader}>
        <div className={style.coordsMain}>
          <div className={style.coordsIcon}>
            <Image src={pinInner} alt='pin icon' width={24} height={24} className={style.coordsIconInner} />
          </div>

          <div className={style.coordsInfo}>
            <p className={style.coordsText}>
              {latDms} {t('latitude')} - {lngDms} {t('longitude')}
            </p>
            <div className={style.coordsMeta}>
              <span className={style.metaItem}>
                <Image className={style.metaItem__Icon} src={arrowUp} alt='pin icon' width={24} height={24} />
                {t('latitude-text')}
              </span>
              <span className={style.metaItem}>
                <Image className={style.metaItem__Icon} src={arrowLeft} alt='pin icon' width={24} height={24} />
                {t('longitude-text')}
              </span>
            </div>
          </div>
        </div>
        <Link href={`/search-on-map`} className={style.changeButton}>
          <div className={style.changeButtonIcon}>
            <Image src={pinInnerBlue} alt='pin icon' width={24} height={24} />
            <Image src={pinInner} alt='pin icon' width={24} height={24} />
          </div>
          <span>{t('change-place')}</span>
        </Link>
      </div>

      <Suspense fallback={null}>
        <HorizontalFilters locale={locale} pageKind="coordsMap" />
      </Suspense>

      {/* Блок результатов */}
      <section className={style.results}>
        <div className={style.results__count}>
          <h3 className={style.results__count__heading}>
            {t('results-finding')} {totalCount}
          </h3>
          <Suspense fallback={null}>
            <ViewToggle modes={['horizontal', 'vertical']} />
          </Suspense>
        </div>

        {data.length > 0 && (
          <ul
            className={`${style.results__cards} ${view === 'vertical'
              ? style.results__cards_grid
              : style.results__cards_list
              }`}
          >
            {cards.map(({ item, osmData }) => (
              <li key={item.id}>
                {view === 'vertical' ? (
                  <ToponymCardGrid
                    toponym={item}
                    osmData={osmData}
                    locale={locale}
                  />
                ) : (
                  <ToponymCard
                    toponym={item}
                    osmData={osmData}
                    locale={locale}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <Suspense fallback={null}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </Suspense>
      </section>

    </section>
  );
}