import Image from 'next/image';
import clss from './page.module.scss';
import mapTestImg from '@/assets/images/map-test.png';
import { ToponymDetails } from '../../[toponym]/_components/ToponymDetails';
import { getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

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
                        <Image src={mapTestImg} width='930' height='auto' alt='' priority />
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
                            {data?.dictionaries?.length > 0 && (
                                <ul className={clss.toponymEtymology__dictionaries}>
                                    {data.dictionaries.map((dict, dictIndex) => (
                                        <li className={clss.toponymEtymology__dictionary} key={dictIndex}>
                                            <span className={clss.toponym__label}>{getLocalizedValue(dict?.language, 'name', locale)}</span>
                                            {dict?.transcription && <span className={clss.toponymEtymology__transcription}>[{dict.transcription}]</span>}
                                            {dict?.translations?.length > 0 && (
                                                <ul className={clss.toponymEtymology__translations}>
                                                    {dict.translations.map((translation, transIndex) => (
                                                        <li key={transIndex}>
                                                            <span>{getLocalizedValue(translation, 'name', locale)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ToponymDetails>
                    </section>
                </article>
            </div>
        </>
    );
}