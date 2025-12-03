import SearchableMapClient from '@/components/Map/SearchableMapClient';
import { routing } from "@/i18n/routing";
import { cleanHtml, getLocalizedValue } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { headers } from "next/headers";
import { notFound } from 'next/navigation';
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import { ToponymEtymology } from '../../[toponym]/_components/ToponymEtymology';
import { ToponymPernamentLink } from '../../[toponym]/_components/ToponymPernamentLink/ToponymPernamentLink';
import { ToponymSources } from '../../[toponym]/_components/ToponymSources';
import clss from './page.module.scss';

async function fetchData({ etymology }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/etymologies/${etymology}`)

        if (!resp.ok) {
            if (resp.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data = await resp.json();

        if (!data || !data.id) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching etymology data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { locale, etymology } = await params;

    const data = await fetchData({ etymology });
    if (!data) { throw new Error('Etymology data not found') }

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/etymologies/${etymology}`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    const etymologyName = getLocalizedValue(data, 'name', locale) || '';

    const synonymList = Array.isArray(data.synonyms)
        ? data.synonyms
            .map(s => getLocalizedValue(s, 'name', locale))
            .filter(Boolean)
        : [];
    const etymologySynonymsName = synonymList.join(', ');
    const etymologiesToponymsCount = Number(data?.count_etymologies || 0);

    const tMeta = await getTranslations({ locale, namespace: 'etymologies' });

    const title = tMeta('metadata.title', {
        etymologyName,
        etymologySynonymsName,
        etymologiesToponymsCount
    });
    const description = tMeta('metadata.description', {
        etymologyName,
        etymologySynonymsName,
        etymologiesToponymsCount
    });

    const shareImage = '/openGraph.png';

    return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pathname,
            languages: routing.locales.reduce((acc, loc) => {
                acc[loc] = `/${loc}/etymologies/${etymology}`;
                return acc;
            }, {})
        },
        openGraph: {
            type: 'article',
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

export default async function EtymologyPage({ params }) {
    const { locale, etymology } = await params;

    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    const fullPath = `${protocol}://${host}/${locale}/etymologies/${etymology}`;

    const data = await fetchData({ etymology });
    // if (!data) throw new Error('Eymology data not found');
    if (!data) notFound();

    const headings = []
    const synonyms = data?.synonyms.map(synonym => getLocalizedValue(synonym, 'name', locale)) || [];
    function getHeadings() {
        return [getLocalizedValue(data, 'name', locale), ...synonyms];
    }
    headings.push(...getHeadings());

    const description = getLocalizedValue(data, 'description', locale);
    const cleanDescription = cleanHtml(description);

    const t = await getTranslations({ locale, namespace: 'toponym' });
    const l = await getTranslations({ locale, namespace: 'link' });

    const plasts = data.dictionaries.flatMap(t =>
        Array.isArray(t.plasts) ? t.plasts : []
    );

    return (
        <>
            <div className={clss.toponymWrapper}>
                <article className={clss.toponymArticle}>
                    <section className={`${clss.toponymArticle__section} ${clss.toponymMap}`}>
                        <SearchableMapClient
                            searchTerm={getLocalizedValue(data, 'name', locale)}
                            searchType="etymology"
                            locale={locale}
                        />
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={headings.join(', ')} headingLevel={1}>
                            {description && (
                                <div
                                    className={clss.toponymDesc}
                                    dangerouslySetInnerHTML={{ __html: cleanDescription }}
                                ></div>
                            )}
                        </ToponymDetails>
                    </section>

                    {plasts?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('plast.heading')} headingLevel={2}>
                                <ul className={clss.toponymPlastList}>
                                    {(() => {
                                        // 1) Исходные данные
                                        const source = [...plasts];

                                        // 2) Уникализация по названию пласта (child)
                                        const seenChild = new Set();
                                        const uniqByChild = [];
                                        for (const p of source) {
                                            const childName = (getLocalizedValue(p, 'name', locale) || '').trim();
                                            if (!childName) continue;
                                            const key = childName.toLowerCase();
                                            if (seenChild.has(key)) continue;
                                            seenChild.add(key);
                                            uniqByChild.push(p);
                                        }

                                        // 3) Группировка по имени родителя (по тексту, не по id)
                                        const groupsMap = new Map();

                                        for (const item of uniqByChild) {
                                            const parentNameRaw = item?.parent
                                                ? getLocalizedValue(item.parent, 'name', locale)
                                                : null;

                                            const normalizedParentKey = (parentNameRaw ?? '__no_parent__')
                                                .toLowerCase()
                                                .trim();

                                            const existed = groupsMap.get(normalizedParentKey);
                                            if (existed) {
                                                existed.items.push(item);
                                            } else {
                                                groupsMap.set(normalizedParentKey, {
                                                    parentName: parentNameRaw,
                                                    items: [item],
                                                });
                                            }
                                        }

                                        // 4) Вывод: в каждой группе показываем parent только у первого элемента
                                        return Array.from(groupsMap.values()).flatMap((group, gi) =>
                                            group.items.map((plastItem, idx) => {
                                                const parentName = group.parentName; // одинаков для группы
                                                const childName = getLocalizedValue(plastItem, 'name', locale);
                                                const showParentOnce = Boolean(parentName) && idx === 0;
                                                const isSublayer = Boolean(parentName);

                                                return (
                                                    <li
                                                        key={`${parentName ?? 'noparent'}__${childName || plastItem.name_ky || gi + '-' + idx
                                                            }`}
                                                        className={clss.toponymPlast}
                                                    >
                                                        {showParentOnce && (
                                                            <span className={clss.toponym__label}>{parentName}</span>
                                                        )}
                                                        <span
                                                            className={`${clss.toponym__label} ${isSublayer ? clss.toponym__labelChild : ''
                                                                }`}
                                                        >
                                                            {childName}
                                                        </span>
                                                    </li>
                                                );
                                            }),
                                        );
                                    })()}
                                </ul>
                            </ToponymDetails>
                        </section>
                    )}

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={t('etymology-naming.heading')} headingLevel={2}>
                            <ToponymEtymology
                                etymologies={[{ dictionaries: data?.dictionaries }]}
                                locale={locale}
                                l={l}
                            />
                        </ToponymDetails>
                    </section>

                    {data?.dictionaries?.some(dict => dict.sources?.length > 0) && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('source.heading')} headingLevel={2}>
                                <ToponymSources
                                    etymologies={[{ dictionaries: data?.dictionaries }]}
                                    locale={locale}
                                />
                            </ToponymDetails>
                        </section>
                    )}

                    <ToponymDetails heading={t('pernament-link.heading')} headingLevel={2}>
                        <ToponymPernamentLink fullPath={fullPath} />
                    </ToponymDetails>
                </article>
            </div>
        </>
    );
}