import { routing } from '@/i18n/routing';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';

const locales = routing.locales || ['ru', 'ky', 'en'];

async function fetchJsonWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// Хелпер: делает записи для одного pathSuffix сразу для всех языков
function makeLocalizedEntries(pathSuffix, options = {}) {
  const { priority, changeFrequency, lastModified } = options;

  const lastModifiedDate = lastModified
    ? new Date(lastModified)
    : new Date();

  return locales.map((lng) => ({
    url: `${baseUrl}/${lng}${pathSuffix}`,
    lastModified: lastModifiedDate,
    changeFrequency: changeFrequency || 'weekly',
    priority: priority ?? 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((lng2) => [lng2, `${baseUrl}/${lng2}${pathSuffix}`])
      ),
    },
  }));
}

async function fetchAllToponyms(limitPerPage = 500, timeoutMs = 10000) {
  const all = [];
  let url = `${process.env.API_URL}/toponyms/?limit=${limitPerPage}&offset=0`;
  let safetyCounter = 0;

  while (url && safetyCounter < 200) {
    const json = await fetchJsonWithTimeout(url, timeoutMs);

    const results = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json)
        ? json
        : [];

    all.push(...results);

    // DRF-пагинация: json.next — абсолютный URL или null
    url = json.next || null;
    safetyCounter += 1;

    // на всякий случай жёсткий предел, чтобы не уйти в бесконечный цикл
    if (!url) break;
  }

  return all;
}

export default async function sitemap() {
  const urls = [];

  // ---------- 1. Статические страницы ----------

  // 1) Главная /[locale]
  urls.push(
    ...makeLocalizedEntries('', {
      priority: 1,
      changeFrequency: 'weekly',
    })
  );

  // 2) /[locale]/search
  urls.push(
    ...makeLocalizedEntries('/search', {
      priority: 0.9,
      changeFrequency: 'weekly',
    })
  );

  // 3) /[locale]/glossary
  urls.push(
    ...makeLocalizedEntries('/glossary', {
      priority: 0.8,
      changeFrequency: 'weekly',
    })
  );

  // 5) /[locale]/map
  urls.push(
    ...makeLocalizedEntries('/map', {
      priority: 0.8,
      changeFrequency: 'weekly',
    })
  );

  // 6) /[locale]/blog
  urls.push(
    ...makeLocalizedEntries('/blog', {
      priority: 0.8,
      changeFrequency: 'weekly',
    })
  );

  // 9) /[locale]/about
  urls.push(
    ...makeLocalizedEntries('/about', {
      priority: 0.7,
      changeFrequency: 'monthly',
    })
  );

  // 11) /[locale]/search-on-map
  urls.push(
    ...makeLocalizedEntries('/search-on-map', {
      priority: 0.6,
      changeFrequency: 'weekly',
    })
  );

  // 12) /[locale]/search-on-map/results
  // Только базовый URL без query (lat/lng/radius)
  urls.push(
    ...makeLocalizedEntries('/search-on-map/results', {
      priority: 0.3,
      changeFrequency: 'monthly',
    })
  );

  // ---------- 2. Динамика: блог-посты + авторы ----------

  let blogItems = [];
  try {
    const blogJson = await fetchJsonWithTimeout(
      `${process.env.API_URL}/blogs/?limit=5000`,
      10000
    );

    blogItems = Array.isArray(blogJson?.results)
      ? blogJson.results
      : Array.isArray(blogJson)
        ? blogJson
        : [];
  } catch (e) {
    console.error('Error fetching blogs for sitemap:', e);
  }

  // 7) /[locale]/blog/{slug статьи}
  for (const post of blogItems) {
    if (!post?.slug) continue;

    const lastMod =
      post.updated_at || post.published_date || new Date().toISOString();

    urls.push(
      ...makeLocalizedEntries(`/blog/${post.slug}`, {
        priority: 0.7,
        changeFrequency: 'weekly',
        lastModified: lastMod,
      })
    );
  }

  // 8) /[locale]/blog/authors/{slug автора}
  // slugs авторов берём из post.autors
  const authorSlugSet = new Set();

  for (const post of blogItems) {
    if (!Array.isArray(post?.autors)) continue;
    for (const author of post.autors) {
      if (author?.slug) {
        authorSlugSet.add(author.slug);
      }
    }
  }

  // Делаем запрос на каждого автора (по твоему требованию)
  for (const slug of authorSlugSet) {
    try {
      const authorRes = await fetch(
        `${process.env.API_URL}/blogs/autors/${slug}`,
        {
          next: { revalidate: 3600 },
        }
      );

      let lastMod = new Date().toISOString();

      if (authorRes.ok) {
        const authorJson = await authorRes.json();
        lastMod = authorJson.updated_at || lastMod;
      }

      urls.push(
        ...makeLocalizedEntries(`/blog/authors/${slug}`, {
          priority: 0.5,
          changeFrequency: 'monthly',
          lastModified: lastMod,
        })
      );
    } catch (e) {
      console.error(`Error fetching author ${slug} for sitemap:`, e);

      // Даже если запрос упал — всё равно добавим URL автора,
      // просто без нормального lastModified.
      urls.push(
        ...makeLocalizedEntries(`/blog/authors/${slug}`, {
          priority: 0.5,
          changeFrequency: 'monthly',
        })
      );
    }
  }

  // ---------- 3. Динамика: детальные страницы топонимов ----------

  let toponyms = [];

  try {
    // Грузим все страницы по next с лимитом, например 500
    toponyms = await fetchAllToponyms(500, 10000);

    console.log('Toponyms in sitemap (total):', toponyms.length);

    for (const t of toponyms) {
      if (!t?.slug) continue;

      const lastMod =
        t.updated_at || t.modified || t.created || new Date().toISOString();

      // 10) /[locale]/{slug топонима}
      urls.push(
        ...makeLocalizedEntries(`/${t.slug}`, {
          priority: 0.9,
          changeFrequency: 'weekly',
          lastModified: lastMod,
        })
      );
    }
  } catch (e) {
    console.error('Error building sitemap for toponyms:', e);
  }

  // ---------- 4. Глоссарий идентичных топонимов ----------
  const usedNames = new Set();

  try {
    // Используем уже загруженный массив toponyms
    const glossaryItems = toponyms;

    console.log('Glossary items (from toponyms):', glossaryItems.length);

    for (const item of glossaryItems) {
      if (!item?.name_en) continue;

      const nameEn = String(item.name_en).trim().toLowerCase();

      // чтобы не дублировать одинаковые name_en
      if (usedNames.has(nameEn)) continue;
      usedNames.add(nameEn);

      const encoded = encodeURIComponent(item.name_en);
      const lastMod = item.updated_at || new Date().toISOString();

      // 4) /[locale]/glossary/{name_en}?search={name_en}
      locales.forEach((lng) => {
        const pathSuffix = `/glossary/${encoded}?search=${encoded}`;

        urls.push({
          url: `${baseUrl}/${lng}${pathSuffix}`,
          lastModified: new Date(lastMod),
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((lng2) => [
                lng2,
                `${baseUrl}/${lng2}${pathSuffix}`,
              ])
            ),
          },
        });
      });
    }
  } catch (e) {
    console.error('Error building sitemap for glossary identicals:', e);
  }

  return urls;
}