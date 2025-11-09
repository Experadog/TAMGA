import HorizontalFilters from "@/components/HorizontalFilters/HorizontalFilters";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import { Pagination } from "@/components/Pagination";
import ToponymCard from "@/components/ToponymCard/ToponymCard";
import ToponymCardGrid from "@/components/ToponymCardGrid/ToponymCardGrid";
import ViewToggle from "@/components/ViewToggle/ViewToggle";
import { getLocalizedValue } from "@/lib/utils";
import { fetchOSMData } from "@/lib/utils/fetchOSMData";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import styles from './page.module.scss';

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'search' })

  const sp = await searchParams

  const page = sp?.page ? parseInt(sp.page) : 1;
  const itemsPerPage = 16;
  const offset = (page - 1) * itemsPerPage;

  // 1) Собираем URLSearchParams из объекта Next
  const paramsFromUrl = new URLSearchParams();
  for (const [key, val] of Object.entries(sp || {})) {
    if (key === 'page') continue;
    if (Array.isArray(val)) {
      val.forEach(v => { if (v != null && v !== '') paramsFromUrl.append(key, String(v)); });
    } else if (val != null && val !== '') {
      paramsFromUrl.set(key, String(val));
    }
  }

  const arrayKeys = [
    'plast', 'languages', 'dialects_speech', 'topoformants', 'class_topomyns',
    'terms_topomyns', 'toponyms_types', 'terms', 'thematic_groups',
    'region', 'aiyl_aimak', 'city', 'district', 'aiyl', 'special_territory',
  ];

  const arraysPresent = arrayKeys.some(k => paramsFromUrl.has(k));
  const hasSearch = (paramsFromUrl.get('search') || '').trim().length > 0;
  const hasStarts = (paramsFromUrl.get('startswith') || '').trim().length > 0;
  const hasOrdering = (paramsFromUrl.get('ordering') || '').trim().length > 0;

  const hasMeaningfulFilters = arraysPresent || hasSearch || hasStarts || hasOrdering;

  if (!hasOrdering) {
    const orderingByLocale =
      locale === 'ky' ? 'name_ky' :
        locale === 'en' ? 'name_en' :
          'name_ru';
    paramsFromUrl.set('ordering', orderingByLocale);
  }

  let data = [];
  let totalCount = 0;

  if (hasMeaningfulFilters) {
    paramsFromUrl.set('limit', String(itemsPerPage));
    paramsFromUrl.set('offset', String(offset));

    const url = `${process.env.API_URL}/toponyms?${paramsFromUrl.toString()}`;

    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);

      const json = await resp.json();
      data = Array.isArray(json?.results) ? json.results : (Array.isArray(json) ? json : []);
      totalCount = typeof json?.count === 'number' ? json.count : data.length;
    } catch (err) {
      console.error('Error fetching toponyms:', err);
      data = [];
      totalCount = 0;
    }
  } else {
    data = [];
    totalCount = 0;
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

      return (getLocalizedValue(a, 'name', locale) || '')
        .localeCompare(getLocalizedValue(b, 'name', locale) || '', locale);
    });
  }

  const identicals = data.flatMap(t =>
    Array.isArray(t.identical_toponyms) ? t.identical_toponyms : []
  );

  const cards = await Promise.all(
    data.map(async (item) => {
      const isCity = item?.terms_topomyns?.name_en?.toLowerCase() === 'city';
      const osmData = item?.osm_id ? await fetchOSMData(item.osm_id, isCity) : null;
      return { item, osmData };
    })
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const view = sp?.view === 'vertical' ? 'vertical' : 'horizontal';

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <h1 className={styles.hero__heading}>{t('hero.title')}</h1>
        <p className={styles.hero__desc}>
          {t('hero.description')}
        </p>
        <div className={styles.hero__search}>
          <Suspense fallback={null}>
            <MainSearch locale={locale} />
          </Suspense>
        </div>
      </section>
      {identicals.length > 0 && (
        <section className={styles.identicalSection}>
          <div className={styles.identicalSection__container}>
            <h3 className={styles.identicalSection__heading}>Идентичные топонимы:</h3>
            <ul className={styles.identicalSection__list}>
              {identicals.map((identical, idx) => (
                <li
                  className={styles.identicalSection__item}
                  key={identical.id || idx}
                >
                  {getLocalizedValue(identical, "name", locale)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}


      <section>
        <Suspense fallback={null}>
          <HorizontalFilters locale={locale} pageKind="search" />
        </Suspense>
      </section>

      <section className={styles.results}>
        <div className={styles.results__count}>
          <h3 className={styles.results__count__heading}>Найдено результатов: {totalCount}</h3>
          <Suspense fallback={null}>
            <ViewToggle modes={['horizontal', 'vertical']} />
          </Suspense>
        </div>
        {data.length > 0 && (
          <ul className={`${styles.results__cards} ${view === 'vertical' ? styles.results__cards_grid : styles.results__cards_list}`}>
            {
              cards.map(({ item, osmData }) => (
                <li key={item.id}>
                  {view === 'vertical' ? (
                    <ToponymCardGrid toponym={item} osmData={osmData} locale={locale} />
                  ) : (
                    <ToponymCard toponym={item} osmData={osmData} locale={locale} />
                  )}
                </li>
              ))
            }
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
    </>
  )
}