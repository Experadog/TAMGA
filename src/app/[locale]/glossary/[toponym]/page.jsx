import MapClient from "@/components/Map/MapClient";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getLocalizedValue, stripHtmlTags } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import clss from './page.module.scss';

// --- Нормализация для точного сравнения названий ---
function normalizeName(raw) {
  const s = String(raw ?? "");
  const unifiedDashes = s.replace(/[\u2010-\u2015\u2212]/g, "-");
  const spacesFixed = unifiedDashes
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return spacesFixed.toLowerCase();
}

async function fetchMatchesBySlug(rawToponym) {
  const search = decodeURIComponent(String(rawToponym || "")).toLowerCase();
  if (!search) return null;

  const params = new URLSearchParams({ search });

  try {
    const url = `${process.env.API_URL}/toponyms/?${params.toString()}`;
    const resp = await fetch(url, { cache: "no-store" });

    if (!resp.ok) {
      if (resp.status === 404) {
        // ничего не нашли – для нас это повод показать notFound
        return null;
      }
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();

    const results = Array.isArray(json)
      ? json
      : (json?.results ?? []);

    const count = Array.isArray(json)
      ? json.length
      : (json?.count ?? results.length);

    return { results, count };
  } catch (e) {
    console.error("Error fetching matches:", e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale, toponym } = await params;

  const data = await fetchMatchesBySlug(toponym);
  if (!data) { throw new Error('Toponym data not found') }



  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/glossary/${toponym}`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  const collapse = (s = '') =>
    String(s || '')
      .replace(/\s+/g, ' ')
      .trim();

  const tMeta = await getTranslations({ locale, namespace: 'identicalToponymsPage.metadata', });

  const rawResults = Array.isArray(data.results) ? data.results : [];

  const target = normalizeName(
    decodeURIComponent(String(toponym || ''))
  );

  const filteredResults = rawResults.filter((item) => {
    const nKy = normalizeName(getLocalizedValue(item, "name", "ky"));
    const nRu = normalizeName(getLocalizedValue(item, "name", "ru"));
    const nEn = normalizeName(getLocalizedValue(item, "name", "en"));

    return (
      (nKy && nKy === target) ||
      (nRu && nRu === target) ||
      (nEn && nEn === target)
    );
  });

  const visibleCount = filteredResults.length;
  const identicalToponymsName = decodeURIComponent(String(toponym || ''));

  const title = collapse(
    tMeta('title', {
      identicalToponymsName,
      identicalToponymCount: visibleCount
    })
  );
  const description = collapse(
    tMeta('description', {
      identicalToponymsName,
      identicalToponymCount: visibleCount
    })
  );

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/glossary/${toponym}`;
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

export default async function GlossaryToponymPage({ params, searchParams }) {
  const { locale, toponym } = await params;
  const sp = await searchParams
  const t = await getTranslations({ locale, namespace: 'glossary' })

  const normalized = decodeURIComponent(String(toponym || '')).toLowerCase();

  const currentSearch = typeof sp?.search === "string" ? sp.search : "";
  if (normalized && currentSearch !== normalized) {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(sp || {})) {
      if (val == null) continue;

      if (Array.isArray(val)) {
        for (const v of val) {
          if (v != null && v !== "") qs.append(key, String(v));
        }
      } else {
        if (val !== "") qs.set(key, String(val));
      }
    }

    qs.set("search", normalized);
    redirect(`/${locale}/glossary/${toponym}?${qs.toString()}`);
  }

  const data = await fetchMatchesBySlug(toponym);
  // if (!data) throw new Error('Toponym data not found');
  if (!data || !Array.isArray(data.results) || data.results.length === 0) {
    notFound();
  }

  // --- ВЫРЕЗАЕМ НЕИДЕНТИЧНЫЕ НАЗВАНИЯ НА ФРОНТЕ ---
  const targetRaw =
    (typeof sp?.search === "string" && sp.search) ? sp.search : toponym;
  const target = normalizeName(decodeURIComponent(String(targetRaw || "")));

  const filteredResults = (data.results ?? []).filter((item) => {
    const nKy = normalizeName(getLocalizedValue(item, "name", "ky"));
    const nRu = normalizeName(getLocalizedValue(item, "name", "ru"));
    const nEn = normalizeName(getLocalizedValue(item, "name", "en"));
    return (nKy && nKy === target) || (nRu && nRu === target) || (nEn && nEn === target);
  });

  const safeData = { results: filteredResults, count: filteredResults.length };

  return (
    <>
      <div className={clss.toponymWrapper}>
        <article className={clss.toponymArticle}>
          <div className={clss.mapWrapper}>
            <MapClient
              locale={locale}
              glossaryToponyms={safeData.results}
            />
          </div>
        </article>

        <aside className={clss.toponymAside}>
          <span className={clss.dictionary}>{t('identical.title')}</span>
          {safeData.results.length > 0 &&
            <ul className={clss.list}>
              {safeData.results.map(item => (
                <li key={item.id} className={clss.itemCard}>
                  <strong className={clss.popupTitle}>{getLocalizedValue(item, 'name', locale)}</strong>

                  {item?.region?.length > 0 && (
                    <div className={clss.popupRegion}>{getLocalizedValue(item.region[0], 'name', locale)}</div>
                  )}

                  {item?.terms_topomyns && (
                    <div className={clss.popupRegion}>{getLocalizedValue(item?.terms_topomyns, 'name', locale)}</div>
                  )}
                  <div className={clss.popupDescription}>
                    {stripHtmlTags(getLocalizedValue(item, 'description', locale)).length > 100
                      ? `${stripHtmlTags(getLocalizedValue(item, 'description', locale)).substring(0, 100)}...`
                      : stripHtmlTags(getLocalizedValue(item, 'description', locale))
                    }
                  </div>

                  {item?.slug && (
                    <Link href={`/${item.slug}`} className={clss.popupLink}>
                      <span>{t('identical.more')}</span>
                      <svg width="19" height="10" viewBox="0 0 19 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.175 6.00011H1C0.716667 6.00011 0.479167 5.90428 0.2875 5.71261C0.0958333 5.52094 0 5.28344 0 5.00011C0 4.71678 0.0958333 4.47928 0.2875 4.28761C0.479167 4.09594 0.716667 4.00011 1 4.00011H15.175L13.8 2.60011C13.6 2.40011 13.5042 2.16678 13.5125 1.90011C13.5208 1.63344 13.625 1.40011 13.825 1.20011C14.025 1.01678 14.2625 0.920943 14.5375 0.912609C14.8125 0.904276 15.0417 1.00011 15.225 1.20011L18.3 4.30011C18.5 4.50011 18.6 4.73344 18.6 5.00011C18.6 5.26678 18.5 5.50011 18.3 5.70011L15.2 8.80011C15.0167 8.98344 14.7875 9.07511 14.5125 9.07511C14.2375 9.07511 14 8.98344 13.8 8.80011C13.6 8.60011 13.5 8.36261 13.5 8.08761C13.5 7.81261 13.6 7.57511 13.8 7.37511L15.175 6.00011Z" fill="#0094EB" />
                      </svg>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          }
        </aside>
      </div>
    </>
  );
}
