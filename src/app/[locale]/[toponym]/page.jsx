import { routing } from "@/i18n/routing";
import { cleanHtml, getLocalizedValue, stripHtmlTags } from "@/lib/utils";
import Image from "next/image";

import { getTranslations } from "next-intl/server";
import { ToponymAsideItem } from "./_components/ToponymAsideItem";
import { ToponymDetails } from "./_components/ToponymDetails";
import { ToponymEtymology } from "./_components/ToponymEtymology";
import { ToponymHierarchy } from "./_components/ToponymHierarchy/ToponymHierarchy";
import { ToponymSources } from "./_components/ToponymSources";
import clss from './page.module.scss';

import chevronIcon from '@/assets/icons/chevron.svg';
import coordinatesIcon from '@/assets/icons/coordinates.svg';
import twoArrowsIcon from '@/assets/icons/two-arrow.svg';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Link } from "@/i18n/navigation";
import { getStartsWithByLocale } from "@/lib/utils/getStartsWithByLocale";
import { headers } from "next/headers";
import ClientMapWrapper from "./_components/ClientMapWrapper";
import { ToponymPernamentLink } from "./_components/ToponymPernamentLink/ToponymPernamentLink";


async function fetchData({ toponym }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/toponyms/${toponym}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching toponym data:', error);
        return null;
    }
}

async function fetchOSMData(osmId, isCity = false) {
    if (!osmId) return null;

    try {
        // If it's a city, fetch relation data for boundaries
        const query = isCity ? `
            [out:json];
            relation(${osmId});
            out geom;
        ` : `
            [out:json];
            way(${osmId});
            out geom;
        `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.elements && data.elements.length > 0) {
            const element = data.elements[0];

            if (isCity && element.type === 'relation') {
                // Handle relation data for cities
                const outerWays = [];

                if (element.members) {
                    // Find outer ways in the relation
                    const outerMembers = element.members.filter(member =>
                        member.type === 'way' && member.role === 'outer'
                    );

                    // Get geometry for outer ways
                    for (const member of outerMembers) {
                        if (member.geometry) {
                            const coords = member.geometry.map(p => [p.lat, p.lon]);
                            outerWays.push(coords);
                        }
                    }
                }

                if (outerWays.length > 0) {
                    return {
                        coords: outerWays,
                        elementType: 'relation',
                        isMultiPolygon: true,
                        isClosedWay: true
                    };
                }
            } else if (!isCity && element.type === 'way') {
                // Handle way data for non-cities (existing logic)
                const coords = element.geometry.map(p => [p.lat, p.lon]);

                let isClosedWay = false;
                if (coords.length > 2) {
                    const firstPoint = coords[0];
                    const lastPoint = coords[coords.length - 1];
                    isClosedWay = firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];
                }

                return {
                    coords,
                    elementType: element.type,
                    isClosedWay
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching OSM data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { locale, toponym } = await params;

    const data = await fetchData({ toponym });
    if (!data) { throw new Error('Toponym data not found') }

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/${toponym}`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    // helpers
    const collapse = (s = '') => String(s || '').replace(/\s+/g, ' ').trim();
    const pick = (...vals) => vals.find(v => typeof v === 'string' && v.trim().length > 0) ?? '';

    const tMeta = await getTranslations({ locale, namespace: 'toponym.metadata' });
    const locTitleTail = tMeta('title');
    const locDescTail = tMeta('description');

    const name = getLocalizedValue(data, 'name', locale) || '';
    const term = getLocalizedValue(data?.terms_topomyns, 'name', locale) || '';

    const rawDescription = getLocalizedValue(data, 'description', locale) || '';
    const clean = stripHtmlTags(cleanHtml(rawDescription));
    const normalizedClean = collapse(clean);

    const titleLeft = collapse([name, term].filter(Boolean).join(' - '));
    const titleTail = pick(locTitleTail || '');
    const title = collapse(`${titleLeft} — ${titleTail}`);

    const subjectPart = collapse([term, name].filter(Boolean).join(' '));
    const mainDesc = pick(normalizedClean, locDescTail || '');
    const description = collapse(`${subjectPart}${subjectPart ? '. ' : ''}${mainDesc}`);

    const shareImage = '/openGraph.png';

    return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pathname,
            languages: routing.locales.reduce((acc, loc) => {
                acc[loc] = `/${loc}/${toponym}`;
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

export default async function ToponymPage({ params }) {
    const { locale, toponym } = await params;
    const startswith = getStartsWithByLocale(locale);

    const headersList = await headers();
    const host = headersList.get('host') || '';
    const protocol = headersList.get('x-forwarded-proto') || 'https';

    const fullPath = `${protocol}://${host}/${locale}/${toponym}`;

    const t = await getTranslations({ locale, namespace: 'toponym' });
    const l = await getTranslations({ locale, namespace: 'link' });
    const b = await getTranslations({ locale, namespace: 'breadcrumbs.toponym' });

    const data = await fetchData({ toponym });
    if (!data) throw new Error('Toponym data not found');

    // Check if the toponym is a city based on terms_topomyns.name_en
    const isCity = data.terms_topomyns?.name_en?.toLowerCase() === 'city';

    const osmData = await fetchOSMData(data.osm_id, isCity);

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
        latitude,
        longitude,
        archived_records,
        historical_backgrounds,
        topoformants,
        osm_id
    } = data;

    const heading = getLocalizedValue(data, 'name', locale);

    const breadcrumbsItems = [
        {
            name: b('home'),
            href: `/${locale}`,
            isLink: true
        },
        {
            name: b('catalog'),
            href: {
                pathname: `/map`,
                query: {
                    startswith,
                    offset: '0',
                    language: locale
                }
            },
            isLink: true
        },
        {
            name: heading,
            href: null,
            isLink: false
        }
    ];

    const description = getLocalizedValue(data, 'description', locale);
    const cleanDescription = cleanHtml(description);

    const term = getLocalizedValue(data?.terms_topomyns, 'name', locale);
    const termDescription = getLocalizedValue(data?.terms_topomyns, 'description', locale);

    const termClassToponym = getLocalizedValue(data?.terms_topomyns?.class_toponym, 'name', locale);
    const termClassToponymDescription = getLocalizedValue(data?.terms_topomyns?.class_toponym, 'description', locale);

    const termsClassParent = getLocalizedValue(data?.terms_topomyns?.class_toponym?.parent, 'name', locale);
    const termsClassParentDescription = getLocalizedValue(data?.terms_topomyns?.class_toponym?.parent, 'description', locale);

    const information = getLocalizedValue(data, 'information', locale);
    const cleanInformation = stripHtmlTags(information);

    const kyOfficialName = getLocalizedValue(data, 'name', 'ky');
    const ruOfficialName = getLocalizedValue(data, 'name', 'ru');
    const enOfficialName = getLocalizedValue(data, 'name', 'en');

    const eP = etymologies?.flatMap(t =>
        Array.isArray(t.dictionaries) ? t.dictionaries : []
    );

    const etymologyPlasts = eP?.flatMap(t =>
        Array.isArray(t.plasts) ? t.plasts : []
    );

    return (
        <>
            <Breadcrumbs
                className={clss.toponymBreadcrumb}
                items={breadcrumbsItems}
            />
            <div className={clss.toponymWrapper}>
                <article className={clss.toponymArticle}>
                    <section className={`${clss.toponymArticle__section} ${clss.toponymMap}`}>
                        <ClientMapWrapper toponym={data} osmId={osm_id} osmData={osmData} />
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={heading} headingLevel={1}>
                            <ul className={clss.toponymTerms}>
                                {termsClassParent && (
                                    <li key="parent">
                                        <div
                                            className={clss.langBadge}
                                            {...(termsClassParentDescription
                                                ? { 'aria-describedby': 'toponym-parent-desc' }
                                                : {})}
                                        >
                                            <span
                                                className={clss.toponymTerm}
                                                tabIndex={termsClassParentDescription ? 0 : -1}
                                            >
                                                {termsClassParent}
                                            </span>

                                            {termsClassParentDescription && (
                                                <span
                                                    id="toponym-parent-desc"
                                                    role="tooltip"
                                                    className={clss.langBadge__tooltip}
                                                >
                                                    {termsClassParentDescription}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                )}

                                {termClassToponym && (
                                    <li key="class">
                                        <div
                                            className={clss.langBadge}
                                            {...(termClassToponymDescription
                                                ? { 'aria-describedby': 'toponym-class-desc' }
                                                : {})}
                                        >
                                            <span
                                                className={clss.toponymTerm}
                                                tabIndex={termClassToponymDescription ? 0 : -1}
                                            >
                                                {termClassToponym}
                                            </span>

                                            {termClassToponymDescription && (
                                                <span
                                                    id="toponym-class-desc"
                                                    role="tooltip"
                                                    className={clss.langBadge__tooltip}
                                                >
                                                    {termClassToponymDescription}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                )}
                                {term && (
                                    <li key="term">
                                        <div
                                            className={clss.langBadge}
                                            {...(termDescription ? { 'aria-describedby': 'toponym-term-desc' } : {})}
                                        >
                                            <span
                                                className={clss.toponymTerm}
                                                tabIndex={termDescription ? 0 : -1}
                                            >
                                                {term}
                                            </span>

                                            {termDescription && (
                                                <span
                                                    id="toponym-term-desc"
                                                    role="tooltip"
                                                    className={clss.langBadge__tooltip}
                                                >
                                                    {termDescription}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                )}
                            </ul>

                            {description && (
                                <div className={clss.toponymDesc} dangerouslySetInnerHTML={{ __html: cleanDescription }}></div>
                            )}
                        </ToponymDetails>
                    </section>

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={t('official-naming.heading')} headingLevel={2}>
                            <div className={clss.toponymOfficialNaming}>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{t(`official-naming.${locale}.ky`)}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{kyOfficialName}</span>
                                </div>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{t(`official-naming.${locale}.ru`)}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{ruOfficialName}</span>
                                </div>
                                <div className={clss.toponymOfficialNaming__wrapper}>
                                    <div className={clss.toponym__label}>{t(`official-naming.${locale}.en`)}</div>
                                    <span className={clss.toponymOfficialNaming__value}>{enOfficialName}</span>
                                </div>
                            </div>
                        </ToponymDetails>
                    </section>

                    {(plast?.length > 0 ? plast : etymologyPlasts)?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('plast.heading')} headingLevel={2}>
                                <ul className={clss.toponymPlastList}>
                                    {(() => {
                                        // 1) исходные данные
                                        const source = [...(plast?.length > 0 ? plast : etymologyPlasts)];

                                        // 2) уникализация по названию пласта (child)
                                        const seenChild = new Set();
                                        const uniqByChild = [];
                                        for (const p of source) {
                                            const childName = (getLocalizedValue(p, 'name', locale) || '').trim();
                                            const key = childName.toLowerCase();
                                            if (!childName || seenChild.has(key)) continue;
                                            seenChild.add(key);
                                            uniqByChild.push(p);
                                        }

                                        // 3) группировка по имени родителя (по тексту, не по id)
                                        const groupsMap = new Map();

                                        for (const item of uniqByChild) {
                                            const parentNameRaw = item?.parent ? getLocalizedValue(item.parent, 'name', locale) : null;
                                            const normalizedParentKey = (parentNameRaw ? parentNameRaw : '__no_parent__').toLowerCase().trim();
                                            const existed = groupsMap.get(normalizedParentKey);
                                            if (existed) {
                                                existed.items.push(item);
                                            } else {
                                                groupsMap.set(normalizedParentKey, { parentName: parentNameRaw, items: [item] });
                                            }
                                        }

                                        // 4) вывод: в каждой группе показываем parent только у первого элемента
                                        return Array.from(groupsMap.values()).map((group, gi) =>
                                            group.items.map((plastItem, idx) => {
                                                const parentName = group.parentName; // одинаков для группы
                                                const childName = getLocalizedValue(plastItem, 'name', locale);
                                                const showParentOnce = Boolean(parentName) && idx === 0;
                                                const isSublayer = Boolean(parentName);

                                                return (
                                                    <li key={`${childName || plastItem.name_ky || gi + '-' + idx}`} className={clss.toponymPlast}>
                                                        {showParentOnce && (
                                                            <span className={clss.toponym__label}>{parentName}</span>
                                                        )}
                                                        <span
                                                            className={`${clss.toponym__label} ${isSublayer ? clss.toponym__labelChild : ''}`}
                                                        >
                                                            {childName}
                                                        </span>
                                                    </li>
                                                );
                                            })
                                        );
                                    })()}
                                </ul>
                            </ToponymDetails>
                        </section>
                    )}

                    {etymologies?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('etymology-naming.heading')} headingLevel={2}>
                                <ToponymEtymology
                                    etymologies={etymologies}
                                    locale={locale}
                                    l={l}
                                />
                            </ToponymDetails>
                        </section>
                    )}

                    {topoformants?.length > 0 && (
                        <section className={clss.toponymArticle__section}>
                            <ToponymDetails heading={t('topoformants.heading')} headingLevel={2}>
                                {topoformants.map((topoformant, index) => {
                                    const mainName = getLocalizedValue(topoformant, 'name', locale);
                                    const description = getLocalizedValue(topoformant, 'description', locale);
                                    const cleanTopoformantDescription = stripHtmlTags(description);

                                    const affixes = topoformant?.affixes || [];

                                    return (
                                        <div key={topoformant.id || index} className={clss.toponymTopoformant}>
                                            <div className={clss.toponymTopoformant__header}>
                                                {mainName}

                                                {affixes.length > 0 && (
                                                    <span className={clss.toponymTopoformant__affixes}>
                                                        {affixes.map((affix, affixIndex) => {
                                                            const affixName = getLocalizedValue(affix, 'name', locale);
                                                            return affixName ? (
                                                                <span key={affix.id || affixIndex} className={clss.toponymTopoformant__affix}>
                                                                    {affixIndex > 0 ? ', ' : ', '}{affixName}
                                                                </span>
                                                            ) : null;
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {description && (
                                                <p className={clss.toponymDesc}>
                                                    {cleanTopoformantDescription}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
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
                                        <li key={record?.id ?? record?.file ?? index} className={clss.toponymArchivedRecord}>
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
                                                <span className={clss.toponymHistoricalBackground__date}>
                                                    {[day, month, year].filter(Boolean).join('.')}
                                                </span>
                                                <details open className={clss.toponymHistoricalBackground__details}>
                                                    <summary className={clss.toponymHistoricalBackground__summary}>
                                                        {getLocalizedValue(background, 'description', locale) && (
                                                            <Image className={clss.toponymHistoricalBackground__chevron} src={chevronIcon} alt="" width={12} height={7} />
                                                        )}
                                                        {getLocalizedValue(background, 'name', locale)}
                                                    </summary>
                                                    {getLocalizedValue(background, 'description', locale) && (
                                                        <p className={clss.toponymHistoricalBackground__description}>
                                                            {getLocalizedValue(background, 'description', locale)}
                                                        </p>
                                                    )}
                                                </details>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ToponymDetails>
                        </section>
                    )}

                    {etymologies?.length > 0 && etymologies.some(etymology =>
                        etymology.dictionaries?.some(dict => dict.sources?.length > 0)
                    ) && (
                            <section className={clss.toponymArticle__section}>
                                <ToponymDetails heading={t('source.heading')} headingLevel={2}>
                                    <ToponymSources
                                        etymologies={etymologies}
                                        locale={locale}
                                    />
                                </ToponymDetails>
                            </section>
                        )}

                    <section className={clss.toponymArticle__section}>
                        <ToponymDetails heading={t('pernament-link.heading')} headingLevel={2}>
                            <ToponymPernamentLink fullPath={fullPath} />
                        </ToponymDetails>
                    </section>
                </article>

                <aside className={clss.toponymAside}>
                    {(region?.length > 0 || city?.length > 0 || district?.length > 0 || aiyl_aimak?.length > 0 || aiyl?.length > 0) && (
                        <section className={clss.toponymAside__section}>
                            <ToponymHierarchy
                                region={region?.[0]}
                                city={city?.[0]}
                                district={district?.[0]}
                                aiylAimak={aiyl_aimak?.[0]}
                                aiyl={aiyl?.[0]}
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
                                heading={t('matches')}
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
