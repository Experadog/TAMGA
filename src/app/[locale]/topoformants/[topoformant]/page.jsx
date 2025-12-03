import SearchableMapClient from '@/components/Map/SearchableMapClient';
import { routing } from '@/i18n/routing';
import { getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import clss from './page.module.scss';

async function fetchData({ topoformant }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/topoformants/${topoformant}`)

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
        console.error('Error fetching topoformant data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { locale, topoformant } = await params;

    const data = await fetchData({ topoformant });
    if (!data) { throw new Error('Topoformant data not found') }

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/topoformants/${topoformant}`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    // helpers
    const collapse = (s = '') => String(s || '').replace(/\s+/g, ' ').trim();
    const tMeta = await getTranslations({ locale, namespace: 'topoformants' });

    const topoformantName = getLocalizedValue(data, 'name', locale) || '';
    const topoformantAffixusName = Array.isArray(data.affixes)
        ? data.affixes
            .map(a => getLocalizedValue(a, 'name', locale))
            .filter(Boolean)
            .join(', ')
        : '';

    const title = tMeta('metadata.title', {
        topoformantName,
        topoformantAffixusName,
    })

    // описание топоформанта (может быть null)
    const rawDescription = getLocalizedValue(data, 'description', locale) || '';
    const description = collapse(stripHtmlTags(rawDescription));

    const shareImage = '/openGraph.png';

    return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pathname,
            languages: routing.locales.reduce((acc, loc) => {
                acc[loc] = `/${loc}/topoformants/${topoformant}`;
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

export default async function TopoformantPage({ params }) {
    const { locale, topoformant } = params;

    const data = await fetchData({ topoformant });
    // if (!data) throw new Error('Topoformant data not found');
    if (!data) notFound();

    const headings = []
    const synonyms = data?.affixes.map(synonym => getLocalizedValue(synonym, 'name', locale)) || [];
    function getHeadings() {
        return [getLocalizedValue(data, 'name', locale), ...synonyms];
    }
    headings.push(...getHeadings());

    const description = getLocalizedValue(data, 'description', locale);
    const cleanDescription = stripHtmlTags(description);

    return (
        <>
            <div className={clss.toponymWrapper}>
                <article className={clss.toponymArticle}>
                    <section className={clss.toponymArticle__section}>
                        <SearchableMapClient
                            searchTerm={getLocalizedValue(data, 'name', locale)}
                            searchType="topoformant"
                            locale={locale}
                        />
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={headings.join(', ')} headingLevel={1}>
                            {description && (
                                <p className={clss.toponymDesc}>{cleanDescription}</p>
                            )}
                        </ToponymDetails>
                    </section>
                </article>
            </div>
        </>
    );
}