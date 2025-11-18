import SearchableMapClient from '@/components/Map/SearchableMapClient';
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

    const t = await getTranslations({ locale, namespace: 'toponym' });
    const l = await getTranslations({ locale, namespace: 'link' });

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