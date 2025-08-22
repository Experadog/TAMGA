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

    return (
        <div className={clss.toponymHierarchy}>
            <div className={clss.toponymHierarchy__header}>
                <Image src={hierarchy} alt="" width={24} height={24} />
                <h3 className={clss.toponymHierarchy__heading}>{t('heading')}</h3>
            </div>
            <div className={clss.toponymHierarchy__list}>
                <span className={clss.toponymHierarchy__listHeading}>{t('republic')}</span>
                <p className={clss.toponymHierarchy__listItem}>{republicName[locale]}</p>

                {regionName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{t('region')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{regionName}</p>
                    </>
                )}

                {districtName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{t('disctrict')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{districtName}</p>
                    </>
                )}

                {cityName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{t('city')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{cityName}</p>
                    </>
                )}

                {aiylAimakName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{t('village')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{aiylAimakName}</p>
                    </>
                )}

                {aiylName && (
                    <>
                        <span className={clss.toponymHierarchy__listHeading}>{t('aiyl')}</span>
                        <p className={clss.toponymHierarchy__listItem}>{aiylName}</p>
                    </>
                )}
            </div>
        </div>
    );
}