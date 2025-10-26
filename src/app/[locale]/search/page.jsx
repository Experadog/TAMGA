import HorizontalFilters from "@/components/HorizontalFilters";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import { Pagination } from "@/components/Pagination";
import PreserveScroll from "@/components/PreserveScroll/PreserveScroll";
import ToponymCard from "@/components/ToponymCard/ToponymCard";
import ToponymCardGrid from "@/components/ToponymCardGrid/ToponymCardGrid";
import ViewToggle from "@/components/ViewToggle/ViewToggle";
import { getLocalizedValue } from "@/lib/utils";
import { fetchOSMData } from "@/lib/utils/fetchOSMData";
import { getTranslations, setRequestLocale } from "next-intl/server";
import styles from './page.module.scss';

export default async function SearchPage({ params, searchParams }) {
  const { locale } = params;
  const t = await getTranslations('search')
  setRequestLocale(locale);

  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const itemsPerPage = 16;
  const offset = (page - 1) * itemsPerPage;

  // 1) Собираем URLSearchParams из объекта Next
  const paramsFromUrl = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams || {})) {
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

  // 2) Определяем: есть ли реально выбранные фильтры,
  //    т.е. не считаем служебные и "language" само по себе
  const arraysPresent = arrayKeys.some(k => paramsFromUrl.has(k));
  const hasSearch = (paramsFromUrl.get('search') || '').trim().length > 0;
  const hasStarts = (paramsFromUrl.get('startswith') || '').trim().length > 0;
  const hasOrdering = (paramsFromUrl.get('ordering') || '').trim().length > 0;

  // language считаем признаком ТОЛЬКО если он идёт вместе с startswith (алфавит)
  const hasMeaningfulFilters = arraysPresent || hasSearch || hasStarts || hasOrdering;

  // 3) Только если есть смысловые фильтры — добавляем пагинацию и делаем запрос
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
    // Ничего не выбрано → ничего не грузим
    data = [];
    totalCount = 0;
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

  const view = searchParams?.view === 'grid' ? 'grid' : 'list';

  return (
    <>
      <PreserveScroll />
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <h1 className={styles.hero__heading}>{t('hero.title')}</h1>
        <p className={styles.hero__desc}>
          {t('hero.description')}
        </p>
        <div className={styles.hero__search}>
          <MainSearch locale={locale} />
        </div>
      </section>

      <section className={styles.identicalSection}>
        <div className={styles.identicalSection__container}>
          <h3 className={styles.identicalSection__heading}>Идентичные топонимы:</h3>

          {identicals.length > 0 ? (
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
          ) : (
            <p className={styles.identicalSection__empty}>ничего не найдено</p>
          )}

        </div>
      </section>

      <section>
        <HorizontalFilters locale={locale} />
      </section>

      <section className={styles.results}>
        <div className={styles.results__count}>
          <h3 className={styles.results__count__heading}>Найдено результатов: {totalCount}</h3>
          <ViewToggle />
        </div>

        <ul className={`${styles.results__cards} ${view === 'grid' ? styles.results__cards_grid : styles.results__cards_list}`}>
          {data.length > 0 ? (
            cards.map(({ item, osmData }) => (
              <li key={item.id}>
                {view === 'grid' ? (
                  <ToponymCardGrid toponym={item} osmData={osmData} locale={locale} />
                ) : (
                  <ToponymCard toponym={item} osmData={osmData} locale={locale} />
                )}
              </li>
            ))
          ) : (
            <p className={styles.identicalSection__empty}>Ничего не найдено</p>
          )
          }
        </ul>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      </section>

      {/* <SearchResultsCSR locale={locale} /> */}

    </>
  )
}