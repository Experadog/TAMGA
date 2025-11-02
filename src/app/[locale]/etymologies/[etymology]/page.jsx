import SearchableMapClient from '@/components/Map/SearchableMapClient';
import { routing } from "@/i18n/routing";
import { cleanHtml, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { headers } from "next/headers";
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import { ToponymEtymology } from '../../[toponym]/_components/ToponymEtymology';
import { ToponymPernamentLink } from '../../[toponym]/_components/ToponymPernamentLink/ToponymPernamentLink';
import { ToponymSources } from '../../[toponym]/_components/ToponymSources';
import clss from './page.module.scss';

async function fetchData({ etymology }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/etymologies/${etymology}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching etymology data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { locale, etymology } = params;

    const data = await fetchData({ etymology });
    if (!data) { throw new Error('Toponym data not found') }

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/etymologies/${etymology}`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    // helpers
    const collapse = (s = '') => String(s || '').replace(/\s+/g, ' ').trim();
    const pick = (...vals) => vals.find(v => typeof v === 'string' && v.trim().length > 0) ?? '';

    const tMeta = await getTranslations({ locale, namespace: 'etymologies.metadata' });
    const localizedTitleTail = tMeta('title', { count: Number(data?.count_etymologies) || 0 });
    const localizedDescTail = tMeta('description');

    const name = getLocalizedValue(data, 'name', locale);

    const synonymList = (data?.synonyms ?? [])
        .map(s => getLocalizedValue(s, 'name', locale))
        .filter(Boolean);
    const synonymsPart = synonymList.length ? ` (${synonymList.join(', ')})` : '';

    const rawDescription = getLocalizedValue(data, 'description', locale) || '';
    const clean = stripHtmlTags(cleanHtml(rawDescription));
    const normalizedClean = collapse(clean);

    const titleLeft = collapse([name, synonymsPart].join('')).trim();
    const titleTail = pick(localizedTitleTail || '');
    const title = collapse(`${titleLeft} — ${titleTail}`);

    const description = collapse(pick(normalizedClean, localizedDescTail || ''));

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
    const { locale, etymology } = params;

    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    const fullPath = `${protocol}://${host}/${params.locale}/${params.etymology}`;

    const data = await fetchData({ etymology });
    if (!data) throw new Error('Eymology data not found');

    const headings = []
    const synonyms = data?.synonyms.map(synonym => getLocalizedValue(synonym, 'name', locale)) || [];
    function getHeadings() {
        return [getLocalizedValue(data, 'name', locale), ...synonyms];
    }
    headings.push(...getHeadings());

    const description = getLocalizedValue(data, 'description', locale);
    const cleanDescription = stripHtmlTags(description);

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

                    {plasts.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('plast.heading')} headingLevel={2}>
                                <ul className={clss.toponymPlastList}>
                                    {plasts.map((plastItem) => {
                                        const parentName = plastItem.parent
                                            ? getLocalizedValue(plastItem.parent, 'name', locale)
                                            : null;

                                        const childName = getLocalizedValue(plastItem, 'name', locale);
                                        const isSublayer = Boolean(parentName);

                                        return (
                                            <li key={plastItem.name_ky} className={clss.toponymPlast}>
                                                {isSublayer && (
                                                    <span className={clss.toponym__label}>{parentName}</span>
                                                )}
                                                <span className={`${clss.toponym__label} ${isSublayer ? clss.toponym__labelChild : ''}`}>
                                                    {childName}

                                                </span>
                                            </li>
                                        );
                                    })}
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