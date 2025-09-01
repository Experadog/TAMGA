import clss from './page.module.scss';
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import { ToponymEtymology } from '../../[toponym]/_components/ToponymEtymology';
import { ToponymSources } from '../../[toponym]/_components/ToponymSources';
import { ToponymPernamentLink } from '../../[toponym]/_components/ToponymPernamentLink/ToponymPernamentLink';
import SearchableMapClient from '@/components/Map/SearchableMapClient';
import { getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { headers } from "next/headers";

export async function fetchData({ etymology }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/etymologies/${etymology}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching etymology data:', error);
        return null;
    }
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

    return (
        <>
            <div className={clss.toponymWrapper}>
                <article className={clss.toponymArticle}>
                    <section className={clss.toponymArticle__section}>
                        <SearchableMapClient 
                            searchTerm={getLocalizedValue(data, 'name', locale)}
                            searchType="etymology"
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
                        <ToponymPernamentLink fullPath={fullPath}/>
                    </ToponymDetails>
                </article>
            </div>
        </>
    );
}