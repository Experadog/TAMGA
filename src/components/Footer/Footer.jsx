import { Link } from '@/i18n/navigation';
import { getLocalizedValue } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import './index.scss';

async function fetchRegions() {
    try {
        const resp = await fetch(`${process.env.API_URL}/territories/regions/`);

        if (!resp.ok) return [];

        const data = await resp.json();
        return Array.isArray(data.results) ? data.results : [];
    } catch (e) {
        console.error('Error fetching regions:', e);
        return [];
    }
}

async function fetchTermsToponyms() {
    try {
        const resp = await fetch(`${process.env.API_URL}/directories/terms-topomyns/`);

        if (!resp.ok) return [];

        const data = await resp.json();
        return Array.isArray(data.results) ? data.results : [];
    } catch (e) {
        console.error('Error fetching terms-toponyms:', e);
        return [];
    }
}

async function Footer({ locale }) {
    const t = await getTranslations({ locale, namespace: 'footer' });
    const regions = await fetchRegions();
    const termsToponyms = await fetchTermsToponyms();

    const allowedTerms = [
        // ru
        'гора',
        'река',
        'озеро',
        'родник',
        'долина',
        'перевал',
        'водопад',
        // ky
        'тоо',
        'дарыя',
        'көл',
        'булак',
        'өрөөн',
        'ашуу',
        'шаркыратма',
        // en
        'mountain',
        'river',
        'lake',
        'spring',
        'valley',
        'pass',
        'waterfall',
    ];

    return (
        <footer className='footer'>
            <div className="footer__body">
                <div className="footer__head">
                    <Link href="/" className='footer__head__logo' aria-label="Home">
                        <Image
                            className='footer__head__img'
                            src="/logo.svg"
                            width={122}
                            height={26}
                            alt="Logo"
                            priority
                            sizes="(max-width: 767px) 112px, (max-width: 1023px) 112px, 122px"
                        />
                    </Link>
                    <hr className='footer__hr' />
                </div>
                <div className="footer__content">

                    {/* ====== РЕГИОНЫ ====== */}
                    <div className="footer__column">
                        <span className='footer__column-main-link'>
                            {t('about-neuros.heading')}
                        </span>
                        <ul className='footer__column-list'>
                            {regions.map(region => {
                                const name = getLocalizedValue(region, 'name', locale);

                                return (
                                    <li key={region.id} className='footer__column-item'>
                                        <Link
                                            className='footer__column-link'
                                            href={{
                                                pathname: `/map`,
                                                query: {
                                                    region: region.id,
                                                    offset: '0',
                                                    language: locale
                                                },
                                            }}
                                        >
                                            {name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* ====== Тематические подборки ====== */}
                    <div className="footer__column">
                        <span className='footer__column-main-link'>
                            {t('thematic.heading')}
                        </span>
                        <ul className='footer__column-list'>
                            {termsToponyms
                                .filter(term => {
                                    const name = getLocalizedValue(term, 'name', locale)?.toLowerCase();
                                    return name && allowedTerms.includes(name);
                                })
                                .map(term => {
                                    const name = getLocalizedValue(term, 'name', locale);
                                    return (
                                        <li key={term.id} className='footer__column-item'>
                                            <Link
                                                className='footer__column-link'
                                                href={{
                                                    pathname: `/map`,
                                                    query: {
                                                        terms_topomyns: term.id,
                                                        offset: '0',
                                                        language: locale
                                                    },
                                                }}
                                            >
                                                {name}
                                            </Link>
                                        </li>
                                    )
                                })}
                        </ul>
                    </div>

                    {/* ====== О проекте ====== */}
                    <div className="footer__column">
                        <span className='footer__column-main-link'>{t('connect.heading')}</span>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link
                                    className='footer__column-link'
                                    href={{ pathname: '/about', hash: 'contacts' }}
                                >
                                    {t('contacts')}
                                </Link>
                            </li>
                            {/* можно добавить еще ссылки */}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer__extra">
                <span className='footer__extra__copyright'>
                    {t('memory')}
                </span>
                <span className='footer__extra__copyright'>
                    {t('year')} • {t('description')} • {t('done')}
                </span>
            </div>
        </footer>
    );
}

export { Footer };
