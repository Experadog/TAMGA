import { Hero } from "@/components/Hero/Hero";
import HorizontalFilters from "@/components/HorizontalFilters/HorizontalFilters";
import MainForm from "@/components/MainForm/MainForm";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import { Pagination } from "@/components/Pagination";
import ToponymlistList from "@/components/ToponymAlphaList/ToponymAlphaList";
import ToponymCard from "@/components/ToponymCard/ToponymCard";
import ToponymCardGrid from "@/components/ToponymCardGrid/ToponymCardGrid";
import ViewToggle from "@/components/ViewToggle/ViewToggle";
import { fetchOSMData } from "@/lib/utils/fetchOSMData";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import styles from './page.module.scss';

export default async function GlossaryPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'glossary' })
  const sp = await searchParams

  const rawView = typeof sp?.view === 'string' ? sp.view.toLowerCase() : '';
  const view = rawView === 'vertical' ? 'vertical' :
    rawView === 'horizontal' ? 'horizontal' :
      'list';

  const page = sp?.page ? parseInt(sp.page) : 1;
  const itemsPerPage = view === 'list' ? 60 : 16;

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

  const hasOrdering = (paramsFromUrl.get('ordering') || '').trim().length > 0;

  if (!hasOrdering) {
    const orderingByLocale =
      locale === 'ky' ? 'name_ky' :
        locale === 'en' ? 'name_en' :
          'name_ru';
    paramsFromUrl.set('ordering', orderingByLocale);
  }

  let data = [];
  let totalCount = 0;

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

  const cards = await Promise.all(
    data.map(async (item) => {
      const isCity = item?.terms_topomyns?.name_en?.toLowerCase() === 'city';
      const osmData = item?.osm_id ? await fetchOSMData(item.osm_id, isCity) : null;
      return { item, osmData };
    })
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <>
      <Hero heading={t('title')} description={t('description')} />

      <section>
        <div className={styles.search}>
          <Suspense fallback={null}>
            <MainSearch locale={locale} variant="plain" />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <HorizontalFilters locale={locale} pageKind="glossary" />
        </Suspense>
      </section>

      <section className={styles.results}>
        <div className={styles.results__count}>
          <h3 className={styles.results__count__heading}>Найдено результатов: {totalCount}</h3>
          <Suspense fallback={null}>
            <ViewToggle modes={['horizontal', 'vertical', 'list']} />
          </Suspense>
        </div>

        {data.length > 0 && (
          view === 'list' ? (
            <ToponymlistList items={data} locale={locale} />
          ) : (
            <ul className={`${styles.results__cards} ${view === 'vertical' ? styles.results__cards_grid : styles.results__cards_list}`}>
              {cards.map(({ item, osmData }) => (
                <li key={item.id}>
                  {view === 'vertical'
                    ? <ToponymCardGrid toponym={item} osmData={osmData} locale={locale} />
                    : <ToponymCard toponym={item} osmData={osmData} locale={locale} />
                  }
                </li>
              ))}
            </ul>
          )
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
      <section className={styles.formContainer}>
        <Suspense fallback={null}>
          <MainForm />
        </Suspense>
      </section>
    </>
  )
}