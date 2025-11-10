import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import star from '@/assets/icons/star.svg';

import Image from 'next/image';
import './index.scss';

async function Footer({ locale }) {
    const t = await getTranslations({ locale, namespace: 'footer' });

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
                    <div className="footer__column">
                        <Link href='#' className='footer__column-main-link'>{t('about-neuros.heading')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('about-neuros.company-overview')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('about-neuros.careers')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('about-neuros.press-media')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('about-neuros.testimonials')}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='#' className='footer__column-main-link'>{t('support-contact.heading')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('support-contact.contact-us')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('support-contact.technical-support')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('support-contact.feedback')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>{t('support-contact.community-form')}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='#' className='footer__column-main-link'>{t('connect.heading')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>
                                    <Image src={star} width='17' height='17' alt='' />
                                    Instagram
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>
                                    <Image src={star} width='17' height='17' alt='' />
                                    Facebook
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>
                                    <Image src={star} width='17' height='17' alt='' />
                                    Twitter / X
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='#'>
                                    <Image src={star} width='17' height='17' alt='' />
                                    Linkedin
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer__extra">
                <span className='footer__copyright'>{t('copyright.year')} · {t('copyright.description')}.</span>
                <ul className='footer__extra-list'>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='#'>{t('compliance.term-of-use')}</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='#'>{t('compliance.privacy-policy')}</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='#'>{t('compliance.security')}</Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export { Footer };
