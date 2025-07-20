import hierarchy from '@/assets/icons/hierarchy.svg';
import Image from 'next/image';

import clss from './index.module.scss'
import { getTranslations } from 'next-intl/server';
import { getLocalizedValue } from '@/lib/utils';

export async function ToponymHierarchy({ region, city, district, aiylAimak, aiyl, locale }) {

    const t = await getTranslations({ locale, namespace: 'toponym.hierarchy' });

    const regionName = getLocalizedValue(region, 'name', locale);
    const aiylAimakName = getLocalizedValue(aiylAimak, 'name', locale);

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

                <span className={clss.toponymHierarchy__listHeading}>{t('region')}</span>
                {regionName && <p className={clss.toponymHierarchy__listItem}>{regionName}</p>}

                <span className={clss.toponymHierarchy__listHeading}>{t('village')}</span>
                {aiylAimakName && <p className={clss.toponymHierarchy__listItem}>{aiylAimakName}</p>}
            </div>
        </div>
    );
}