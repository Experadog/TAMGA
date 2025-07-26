import React from "react";
import Link from "next/link";
import Image from "next/image";
import mapTestImg from '@/assets/images/map-test.png';
import { getLocalizedValue, stripHtmlTags } from "@/lib/utils";

import clss from './page.module.scss'
import { ToponymDetails } from "./_components/ToponymDetails";
import { ToponymHierarchy } from "./_components/ToponymHierarchy/ToponymHierarchy";
import { getTranslations } from "next-intl/server";
import { ToponymAsideItem } from "./_components/ToponymAsideItem";

import arrowIcon from '@/assets/icons/arrow.svg';
import coordinatesIcon from '@/assets/icons/coordinates.svg';
import twoArrowsIcon from '@/assets/icons/two-arrow.svg';
import chevronIcon from '@/assets/icons/chevron.svg';
import fileIcon from '@/assets/icons/file.svg';
import AudioPlayer from "@/components/AudioPlayer/AudioPlayer";
import { headers } from "next/headers";
import { ToponymPernamentLink } from "./_components/ToponymPernamentLink/ToponymPernamentLink";

export async function fetchData({ toponym }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/toponyms/${toponym}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching toponym data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { locale, toponym } = params;

    const data = await fetchData({ toponym });
    if (!data) { throw new Error('Toponym data not found') }

    const websiteTitle = {
        ky: 'Тамга - Кыргызстандагы: географиялык объекттердин аталыштарынын тарыхы | tamga.kg',
        ru: 'Тамга - в Кыргызстане: происхождение, легенды, исторические записи | tamga.kg',
        en: 'Tamga - History of geographical object names in Kyrgyzstan | tamga.kg'
    };

    const webSiteDescription = {
        historyNaming: {
            ky: 'Аталышынын тарыхы',
            ru: 'история названия',
            en: 'History of naming'
        },
        legendsAndScientific: {
            ky: 'Легендалар жана илимий версиялар',
            ru: 'Легенды и научные версии',
            en: 'Legends and scientific versions'
        }
    }

    const name = getLocalizedValue(data, 'name', locale);
    const term = getLocalizedValue(data.terms_topomyns, 'name', locale);
    const rawDescription = getLocalizedValue(data, 'description', locale);
    const cleanDescription = stripHtmlTags(rawDescription);

    return {
        title: `${name} - ${term} ${websiteTitle[locale]}`,
        description: `${term} ${name}: ${webSiteDescription.historyNaming[locale]}, ${cleanDescription}. Географические данные. ${webSiteDescription.legendsAndScientific[locale]}`,
    };
}

export default async function ToponymPage({ params }) {
    const { locale, toponym } = params;

    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    const fullPath = `${protocol}://${host}/${params.locale}/${params.toponym}`;
    
    const t = await getTranslations({ locale, namespace: 'toponym' });
    const l = await getTranslations({ locale, namespace: 'link' });

    const data = await fetchData({ toponym });
    if (!data) throw new Error('Toponym data not found');

    const {
        region,
        city,
        district,
        aiyl_aimak,
        aiyl,
        identical_toponyms,
        matching_toponyms,
        matching_toponyms_count,
        plast,
        etymologies,
        name_ky,
        latitude,
        longitude,
        archived_records,
        historical_backgrounds,
    } = data;

    const heading = getLocalizedValue(data, 'name', locale);

    const description = getLocalizedValue(data, 'description', locale);
    const cleanDescription = stripHtmlTags(description);
    const term = getLocalizedValue(data?.terms_topomyns, 'name', locale);
    const termClassToponym = getLocalizedValue(data?.terms_topomyns?.class_toponym, 'name', locale);
    const termsClassParent = getLocalizedValue(data?.terms_topomyns?.class_toponym?.parent, 'name', locale);
    const information = getLocalizedValue(data, 'information', locale);
    const cleanInformation = stripHtmlTags(information);

    const kyOfficialName = getLocalizedValue(data, 'name', 'ky');
    const ruOfficialName = getLocalizedValue(data, 'name', 'ru');
    const enOfficialName = getLocalizedValue(data, 'name', 'en');

    const officialNaming = {
        ru: {
            ru: 'Русский',
            ky: 'Кыргызский',
            en: 'Английский'
        },
        ky: {
            ru: 'Орусча',
            ky: 'Кыргызча',
            en: 'Английсче'
        },
        en: {
            ru: 'Russian',
            ky: 'Kyrgyz',
            en: 'English'
        }
    }

    return (
        <>
            <div className={clss.toponymWrapper}>
                <article className={clss.toponymArticle}>
                    <section className={clss.toponymArticle__section}>
                        <Image src={mapTestImg} width='930' height='auto' alt='' priority />
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={heading} headingLevel={1}>
                            <ul className={clss.toponymTerms}>
                                <li key={1}>{termsClassParent && <span className={clss.toponymTerm}>{termsClassParent}</span>}</li>
                                <li key={2}>{termClassToponym && <span className={clss.toponymTerm}>{termClassToponym}</span>}</li>
                                <li key={3}>{term && <span className={clss.toponymTerm}>{term}</span>}</li>
                            </ul>

                            {description && (
                                <p className={clss.toponymDesc}>{cleanDescription}</p>
                            )}
                        </ToponymDetails>
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={t('official-naming.heading')} headingLevel={2}>
                            <div className={clss.toponymOfficialNaming}>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{officialNaming[locale]['ky']}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{kyOfficialName}</span>
                                </div>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{officialNaming[locale]['ru']}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{ruOfficialName}</span>
                                </div>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{officialNaming[locale]['en']}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{enOfficialName}</span>
                                </div>
                            </div>
                        </ToponymDetails>
                    </section>

                    {plast?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('plast.heading')} headingLevel={2}>
                                <ul className={clss.toponymPlastList}>
                                    {plast.map(plastItem => (
                                        <li key={plastItem.name_ky} className={clss.toponymPlast}>
                                            <span className={clss.toponym__label}>{getLocalizedValue(plastItem, 'name', locale)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </ToponymDetails>
                        </section>
                    )}

                    {etymologies?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('etymology-naming.heading')} headingLevel={2}>
                                {etymologies.map((etymology, index) => {
                                    const description = getLocalizedValue(etymology, 'description', locale);
                                    const name = getLocalizedValue(etymology, 'name', locale);

                                    return (
                                        <React.Fragment key={index}>
                                            {name && <span className={clss.toponymEtymology__heading}>{name}</span>}
                                            {description && <p className={clss.toponymEtymology__desc}>{description}</p>}
                                            {etymology?.dictionaries?.length > 0 && (
                                                <ul className={clss.toponymEtymology__dictionaries}>
                                                    {etymology.dictionaries.map((dict, dictIndex) => (
                                                        <li className={clss.toponymEtymology__dictionary} key={dictIndex}>
                                                            <span className={clss.toponym__label}>{getLocalizedValue(dict?.language, 'name', locale)}</span>
                                                            {dict?.transcription && <span className={clss.toponymEtymology__transcription}>[{dict.transcription}]</span>}
                                                            {dict?.translations?.length > 0 && (
                                                                <>
                                                                    <ul className={clss.toponymEtymology__translations}>
                                                                        {dict.translations.map((translation, transIndex) => (
                                                                            <li key={transIndex}>
                                                                                <span>{getLocalizedValue(translation, 'name', locale)}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <Link className={clss.toponymEtymology__link} href={`#source-${dict.id}`}>
                                                                        {l('source')}
                                                                        <Image className={clss.toponymEtymology__arrow} src={arrowIcon} width='12' height='12' alt='' />
                                                                    </Link>
                                                                </>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </ToponymDetails>
                        </section>
                    )}

                    {name_ky && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('pronunciation.heading')} headingLevel={2}>
                                <AudioPlayer text={name_ky} className={clss.toponymArticle__audio} />
                            </ToponymDetails>
                        </section>
                    )}

                    {latitude && longitude && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('coordinates.heading')} headingLevel={2}>
                                <div className={clss.toponymCoordinates}>
                                    <div className={clss.toponymCoordinates__iconWrapper}>
                                        <Image src={coordinatesIcon} width={22} height={22} alt="" />
                                    </div>
                                    <div className={clss.toponymCoordinates__info}>
                                        <div className={clss.toponymCoordinates__label}>
                                            <p className={clss.toponymCoordinates__value}>{latitude} c.ш.</p>
                                            <p className={`${clss.toponymCoordinates__value} ${clss.toponymCoordinates__valueDelimeter}`}> - </p>
                                            <p className={clss.toponymCoordinates__value}>{longitude} в.д.</p>
                                        </div>
                                        <div className={clss.toponymCoordinates__coordinates}>
                                            <span className={clss.toponymCoordinates__coordinatesItem}>
                                                <Image src={twoArrowsIcon} alt="" />
                                                {t('coordinates.latitude')}
                                            </span>
                                            <span className={clss.toponymCoordinates__coordinatesItem}>
                                                <Image className={clss.toponymCoordinates__longitudeImg} src={twoArrowsIcon} alt="" />
                                                {t('coordinates.longitude')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </ToponymDetails>
                        </section>
                    )}

                    {archived_records?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('archival-records.heading')} headingLevel={2}>
                                <ul className={clss.toponymArchivedRecords}>
                                    {archived_records?.map((record, index) => (
                                        <li key={record} className={clss.toponymArchivedRecord}>
                                            <Link href={record?.file} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={record?.file}
                                                    alt=""
                                                    width={307}
                                                    height={192}
                                                    loading="lazy"
                                                />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </ToponymDetails>
                        </section>
                    )}

                    {information && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('references.heading')} headingLevel={2}>
                                <p className={clss.toponymInformation}>{cleanInformation}</p>
                            </ToponymDetails>
                        </section>
                    )}

                    {historical_backgrounds?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails
                                heading={t('historical-references.heading')}
                                headingLevel={2}
                                locale={locale}
                            >
                                <div className={clss.toponymHistoricalBackground}>
                                    {historical_backgrounds.map((background, index) => {
                                        const { day, month, year } = background;
                                        return (
                                            <div key={index} className={clss.toponymHistoricalBackground__info}>
                                                <span className={clss.toponymHistoricalBackground__date}>{`${day}.${month}.${year}`}</span>
                                                <details open className={clss.toponymHistoricalBackground__details}>
                                                    <summary className={clss.toponymHistoricalBackground__summary}>
                                                        <Image className={clss.toponymHistoricalBackground__chevron} src={chevronIcon} alt="" width={12} height={7} />
                                                        {getLocalizedValue(background, 'name', locale)}
                                                    </summary>
                                                    <p className={clss.toponymHistoricalBackground__description}>
                                                        {getLocalizedValue(background, 'description', locale)}
                                                    </p>
                                                </details>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ToponymDetails>
                        </section>
                    )}

                    {etymologies?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('source.heading')} headingLevel={2}>
                                {etymologies.map((etymology, index) => {
                                    const { dictionaries } = etymology;

                                    if (!dictionaries?.length) return null;

                                    return (
                                        <div key={index} className={clss.toponymSourseces}>
                                            {dictionaries.map((dict, dictIndex) => {
                                                const { sources } = dict;

                                                return (
                                                    <div key={dictIndex} className={clss.toponymSourseces__dictionaries}>
                                                        {sources?.length > 0 && (
                                                            <div className={clss.toponymSourseces__dictionariesItem}>
                                                                {sources.map((source, sourceIndex) => (
                                                                    <div id={`source-${dict.id}`} key={sourceIndex} className={clss.toponymSourseces__source}>
                                                                        {source?.file && (
                                                                            <Link className={clss.toponymSourseces__sourceLink} href={source?.file} target="_blank" rel="noopener noreferrer">
                                                                                <div className={clss.toponymSourseces__sourceFile}>
                                                                                    <Image className={clss.toponymSourseces__sourceFileIcon} src={fileIcon} alt="" width={0} height={40} />
                                                                                    {source.format_file && (
                                                                                        <span className={`${clss.toponymSourseces__sourceFileFormat} ${source.format_file}`}>{source.format_file}</span>
                                                                                    )}
                                                                                </div>
                                                                                <span>{getLocalizedValue(source, 'name', locale)}</span>
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </ToponymDetails>
                        </section>
                    )}

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={t('pernament-link.heading')} headingLevel={2}>
                            <ToponymPernamentLink fullPath={fullPath}/>
                        </ToponymDetails>
                    </section>
                </article>

                <aside className={clss.toponymAside}>
                    {region?.length > 0 && city?.length > 0 && (
                        <section className={clss.toponymAside__section}>
                            <ToponymHierarchy
                                region={region[0]}
                                city={city[0]}
                                district={district[0]}
                                aiylAimak={aiyl_aimak[0]}
                                aiyl={aiyl[0]}
                                locale={locale}
                            />
                        </section>
                    )}

                    {identical_toponyms?.length > 0 && (
                        <section className={clss.toponymAside__section}>
                            <ToponymAsideItem
                                heading={t('identical-toponyms')}
                                data={identical_toponyms}
                                locale={locale}
                            />
                        </section>
                    )}

                    {matching_toponyms?.length > 0 && (
                        <section className={clss.toponymAside__section}>
                            <ToponymAsideItem
                                heading={t('matching-toponyms')}
                                data={matching_toponyms}
                                amount={matching_toponyms_count}
                                locale={locale}
                            />
                        </section>
                    )}
                </aside>
            </div>
        </>
    );
}
