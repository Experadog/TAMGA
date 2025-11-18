// import backIcon from "@/assets/icons/backIcon.svg";
import MapClient from "@/components/Map/MapClient";
// import { Link } from "@/i18n/navigation";
import { getLocalizedValue, stripHtmlTags } from "@/lib/utils";
// import Image from "next/image";
import { redirect } from "next/navigation";
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
  const search = decodeURIComponent(String(rawToponym || '')).toLowerCase();
  if (!search) return { results: [], count: 0 };
  const params = new URLSearchParams({ search });
  try {
    const url = `${process.env.API_URL}/toponyms/?${params.toString()}`;
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) return { results: [], count: 0 };
    const json = await resp.json();
    if (Array.isArray(json)) return { results: json, count: json.length };
    return { results: json?.results ?? [], count: json?.count ?? 0 };
  } catch (e) {
    console.error("Error fetching matches:", e);
    return { results: [], count: 0 };
  }
}

export default async function GlossaryToponymPage({ params, searchParams }) {
  const { locale, toponym } = await params;
  const sp = await searchParams

  const normalized = decodeURIComponent(String(toponym || '')).toLowerCase();

  const currentSearch = typeof sp?.search === "string" ? sp.search : "";
  if (normalized && currentSearch !== normalized) {
    const qs = new URLSearchParams(sp);
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
  if (!data) throw new Error('Toponym data not found');

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

  console.log("DATA", data)

  return (
    <>
      <div className={clss.toponymWrapper}>
        <article className={clss.toponymArticle}>
          <div className={clss.mapWrapper}>
            <MapClient locale={locale} />
          </div>
        </article>

        <aside className={clss.toponymAside}>
          {/* <Link href={`/glossary`} className={clss.backButton}>
            <Image src={backIcon} alt="" width={24} height={24} />
            <span className={clss.backText}>Назад</span>
          </Link> */}
          <span className={clss.dictionary}>Словарь общих слов в Кыргызских топонимах</span>
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
                </li>
              ))}
            </ul>
          }
        </aside>
      </div>
    </>
  );
}
