import Image from 'next/image';
import clss from './page.module.scss';
import mapTestImg from '@/assets/images/map-test.png';
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import { getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function fetchData({ topoformant }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/topoformants/${topoformant}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching topoformant data:', error);
        return null;
    }
}

export default async function TopoformantPage({ params }) {
    const { locale, topoformant } = params;

    const data = await fetchData({ topoformant });
    if (!data) throw new Error('Topoformant data not found');

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
                        <Image src={mapTestImg} width='930' height='auto' alt='' priority />
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