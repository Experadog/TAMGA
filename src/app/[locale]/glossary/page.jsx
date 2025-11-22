import { Hero } from "@/components/Hero/Hero";
import HorizontalFilters from "@/components/HorizontalFilters/HorizontalFilters";
import MainForm from "@/components/MainForm/MainForm";
import { MainSearch } from "@/components/MainSearch/MainSearch";
import { Pagination } from "@/components/Pagination";
import ToponymlistList from "@/components/ToponymAlphaList/ToponymAlphaList";
import ToponymCard from "@/components/ToponymCard/ToponymCard";
import ToponymCardGrid from "@/components/ToponymCardGrid/ToponymCardGrid";
import ViewToggle from "@/components/ViewToggle/ViewToggle";
import { routing } from "@/i18n/routing";
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

export async function generateMetadata({ params }) {
  const { locale } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/glossary`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  const collapse = (s = '') =>
    String(s || '')
      .replace(/\s+/g, ' ')
      .trim();

  const tMeta = await getTranslations({
    locale,
    namespace: 'glossary.metadata',
  });

  const titleTranslate = tMeta('title') || '';
  const descriptionTranslate = tMeta('description') || '';


  const title = collapse(titleTranslate);
  const description = collapse(descriptionTranslate);

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/glossary`;
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

  let totalCount = 0;

  const batchSize = itemsPerPage;
  let fetched = 0;
  let uniquePool = [];
  let keepFetching = true;

  const nameCounts = new Map();

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

      for (const it of batch) {
        const title = normTitle(it, locale);
        if (!title) continue;
        const key = title.toLowerCase();
        nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
      }

      // uniquePool = dedupePreferBaseSlug(uniquePool.concat(batch), locale);
      uniquePool = uniquePool.concat(batch);

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
  // const pageItems = uniquePool.slice(0, itemsPerPage);
  const pageItems = uniquePool;

  const data = pageItems.map((item) => {
    const key = normTitle(item, locale).toLowerCase();
    const count = nameCounts.get(key) || 0;
    return {
      ...item,
      matching_toponyms_count_fixed: count,
    };
  });

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
      <Hero heading={t('hero.title')} description={t('hero.description')} />

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
          <h3 className={styles.results__count__heading}>{t('search-results')} {totalCount}</h3>
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