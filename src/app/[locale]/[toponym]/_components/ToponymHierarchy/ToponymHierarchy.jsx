import hierarchy from '@/assets/icons/hierarchy.svg';
import Image from 'next/image';

import clss from './index.module.scss'
import { getTranslations } from 'next-intl/server';
import { getLocalizedValue } from '@/lib/utils';

export async function ToponymHierarchy({ region, city, district, aiylAimak, aiyl, locale }) {

    const t = await getTranslations({ locale, namespace: 'toponym.hierarchy' });

    const regionName = getLocalizedValue(region, 'name', locale);
    const cityName = getLocalizedValue(city, 'name', locale);
    const districtName = getLocalizedValue(district, 'name', locale);
    const aiylAimakName = getLocalizedValue(aiylAimak, 'name', locale);
    const aiylName = getLocalizedValue(aiyl, 'name', locale);

    const republicName = {
        ru: 'Кыргызстан',
        en: 'Kyrgyzstan',
        ky: 'Кыргызстан'
    }

    const fallbackTranslations = {
        ru: {
            heading: 'Иерархия',
            republic: 'Республика',
            region: 'Область', 
            district: 'Район',
            city: 'Город',
            village: 'Айыл окмоту',
            aiyl: 'Айыл'
        },
        ky: {
            heading: 'Иерархия',
            republic: 'Республика',
            region: 'Облус',
            district: 'Район', 
            city: 'Шаар',
            village: 'Айыл окмоту',
            aiyl: 'Айыл'
        },
        en: {
            heading: 'Hierarchy',
            republic: 'Republic',
            region: 'Region',
            district: 'District',
            city: 'City', 
            village: 'Village council',
            aiyl: 'Village'
        }
    };

    const getTranslationWithFallback = (key) => {
        if (key === 'heading') {
            try {
                return t(key);
            } catch {
                return fallbackTranslations[locale]?.heading || 'Иерархия';
            }
        }
        return fallbackTranslations[locale]?.[key] || key;
    };

    return (
        <div className={clss.toponymHierarchy}>
            <div className={clss.toponymHierarchy__header}>
                <Image src={hierarchy} alt="" width={24} height={24} />
                <h3 className={clss.toponymHierarchy__heading}>{getTranslationWithFallback('heading')}</h3>
            </div>
            <div className={clss.toponymHierarchy__list}>
                <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('republic')}</span>
                <p className={clss.toponymHierarchy__listItem}>{republicName[locale]}</p>

                {regionName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('region')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{regionName}</p>
                    </>
                )}

                {districtName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('district')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{districtName}</p>
                    </>
                )}

                {cityName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('city')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{cityName}</p>
                    </>
                )}

                {aiylAimakName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('village')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{aiylAimakName}</p>
                    </>
                )}

                {aiylName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{getTranslationWithFallback('aiyl')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{aiylName}</p>
                    </>
                )}
            </div>
        </div>
    );
}