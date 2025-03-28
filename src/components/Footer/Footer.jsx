import Link from 'next/link';
import { useTranslations } from 'next-intl';

import star from '@/assets/icons/star.svg';

import './index.scss';
import Image from 'next/image';

function Footer() {
    const t = useTranslations('Footer');

    return (
        <footer className='footer'>
            <div className="footer__body">
                <div className="footer__logo">
                    <span className='footer__title'>Logo</span>
                    <hr className='footer__hr' />
                </div>
                <div className="footer__content">
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>{t('aboutNeuros-title')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('aboutNeuros-company-overview')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('aboutNeuros-careers')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('aboutNeuros-press-media')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('aboutNeuros-testimonials')}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>{t('support-title')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('support-contact')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('support-technical')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('support-feedback')}</Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>{t('support-community')}</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer__column">
                        <Link href='/' className='footer__column-main-link'>{t('connect-title')}</Link>
                        <ul className='footer__column-list'>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>
                                    <Image src={star} width='17' height='17' alt=''/>
                                    Instagram
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>
                                    <Image src={star} width='17' height='17' alt=''/>
                                    Facebook
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>
                                    <Image src={star} width='17' height='17' alt=''/>
                                    Twitter / X
                                </Link>
                            </li>
                            <li className='footer__column-item'>
                                <Link className='footer__column-link' href='/'>
                                    <Image src={star} width='17' height='17' alt=''/>
                                    Linkedin
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer__extra">
                <span className='footer__copyright'>©2025 Logo · {t('copyright')}.</span>
                <ul className='footer__extra-list'>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>{t('term-of-use')}</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>{t('privacy-policy')}</Link>
                    </li>
                    <li className='footer__extra-item'>
                        <Link className='footer__extra-link' href='/'>{t('security')}</Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export { Footer };