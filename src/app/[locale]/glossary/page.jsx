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

function normTitle(it, locale) {
  // берём локализованное имя; если пусто — фоллбэки
  const t =
    (it?.[`name_${locale}`]) ||
    it?.name_ru ||
    it?.name_ky ||
    it?.name_en ||
    '';
  return String(t).trim();
}

function hasNumericSuffix(slug) {
  return /-\d+$/.test(String(slug || ''));
}

// Дедупликация по названию: предпочитаем slug БЕЗ числового хвоста
function dedupePreferBaseSlug(items, locale) {
  const byTitle = new Map();
  for (const it of items) {
    const title = normTitle(it, locale);
    if (!title) continue;
    const key = title.toLowerCase();
    const existing = byTitle.get(key);
    if (!existing) {
      byTitle.set(key, it);
      continue;
    }
    // если уже есть — заменяем, только если существующий с цифрой, а новый без
    if (hasNumericSuffix(existing.slug) && !hasNumericSuffix(it.slug)) {
      byTitle.set(key, it);
    }
  }
  return Array.from(byTitle.values());
}

export default async function GlossaryPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'glossaryPage' })
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

  const batchSize = itemsPerPage;
  let fetched = 0;
  let uniquePool = [];
  let keepFetching = true;

  while (keepFetching) {
    paramsFromUrl.set('limit', String(batchSize));
    paramsFromUrl.set('offset', String(offset + fetched));
    const url = `${process.env.API_URL}/toponyms?${paramsFromUrl.toString()}`;

    try {
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const json = await resp.json();

      const batch = Array.isArray(json?.results) ? json.results : (Array.isArray(json) ? json : []);
      if (typeof json?.count === 'number') totalCount = json.count;

      uniquePool = dedupePreferBaseSlug(uniquePool.concat(batch), locale);

      fetched += batch.length;

      if (uniquePool.length >= itemsPerPage || batch.length < batchSize || (totalCount && offset + fetched >= totalCount)) {
        keepFetching = false;
      }
    } catch (err) {
      console.error('Error fetching toponyms:', err);
      break;
    }
  }

  // берём первые 60 уникальных для страницы
  data = uniquePool.slice(0, itemsPerPage);

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

      <div id="results-top" />
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