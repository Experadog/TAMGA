import { Hero } from "@/components/Hero/Hero";
import { getTranslations, setRequestLocale } from "next-intl/server";

import chevron from '@/assets/icons/chevron.svg';
import email from '@/assets/icons/email.svg';
import location from '@/assets/icons/location.svg';
import phone from '@/assets/icons/phone.svg';
import { ScrollToHash } from "@/components/ScrollToHash/ScrollToHash";
import { routing } from "@/i18n/routing";
import Image from "next/image";
import clss from './page.module.scss';

export async function generateMetadata({ params }) {
    const { locale } = await params;

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/about`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    const collapse = (s = '') =>
        String(s || '')
            .replace(/\s+/g, ' ')
            .trim();

    const tMeta = await getTranslations({
        locale,
        namespace: 'about.metadata',
    });

    const titleTranslate = tMeta('title') || '';
    const descriptionTranslate = tMeta('description') || '';


    const title = collapse(titleTranslate);
    const description = collapse(descriptionTranslate);

    const shareImage = '/openGraph.png';

    return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pathname,
            languages: routing.locales.reduce((acc, loc) => {
                acc[loc] = `/${loc}/about`;
                return acc;
            }, {})
        },
        openGraph: {
            type: 'website',
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

export default async function AboutPage({ params }) {
    const { locale } = await params
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'about' })
    return (
        <>
            <ScrollToHash />
            <Hero heading={t('title')} description={t('description')} />

            <section className={`${clss.about__aim} ${clss.section}`}>
                <h2 className={clss.about__aimTitle}>{t('aims.title')}</h2>
                <ul className={clss.about__aimList}>
                    <li className={clss.about__aimItem}>
                        <h3 className={clss.about__aimItemTitle}>{t('aims.heritage-preservation.title')}</h3>
                        <p className={clss.about__aimItemDescription}>- {t('aims.heritage-preservation.description')}</p>
                    </li>
                    <li className={clss.about__aimItem}>
                        <h3 className={clss.about__aimItemTitle}>{t('aims.educational-platform.title')}</h3>
                        <p className={clss.about__aimItemDescription}>- {t('aims.educational-platform.description')}</p>
                    </li>
                    <li className={clss.about__aimItem}>
                        <h3 className={clss.about__aimItemTitle}>{t('aims.identity-formation.title')}</h3>
                        <p className={clss.about__aimItemDescription}>- {t('aims.identity-formation.description')}</p>
                    </li>
                </ul>
            </section>

            <section className={`${clss.about__mission} ${clss.section} full-width`}>
                <div className="container">
                    <h2 className={clss.about__missionTitle}>{t('mission.title')}</h2>
                    <p className={clss.about__missionDescription}>{t('mission.description')}</p>
                </div>
            </section>

            <section className={`${clss.about__faq} ${clss.section} full-width`}>
                <div className="container">
                    <h2 className={clss.about__faqTitle}>{t('faq.title')}</h2>
                    <ul className={clss.about__faqList}>
                        <li className={clss.about__faqItem}>
                            <details className={clss.about__faqDetails} open>
                                <summary className={clss.about__faqSummary}>
                                    <span className={clss.about__faqItemTitle}>{t('faq.why-toponyms-important.title')}</span>
                                    <Image className={clss.about__faqChevron} src={chevron} width='10' height='16' alt='' />
                                </summary>
                                <p className={clss.about__faqDescription}>{t('faq.why-toponyms-important.description')}</p>
                            </details>
                        </li>
                        <li className={clss.about__faqItem}>
                            <details className={clss.about__faqDetails}>
                                <summary className={clss.about__faqSummary}>
                                    <span className={clss.about__faqItemTitle}>{t('faq.how-to-contibute.title')}</span>
                                    <Image className={clss.about__faqChevron} src={chevron} width='10' height='16' alt='' />
                                </summary>
                                <p className={clss.about__faqDescription}>{t('faq.how-to-contibute.description')}</p>
                            </details>
                        </li>
                        <li className={clss.about__faqItem}>
                            <details className={clss.about__faqDetails}>
                                <summary className={clss.about__faqSummary}>
                                    <span className={clss.about__faqItemTitle}>{t('faq.which-toponyms-found.title')}</span>
                                    <Image className={clss.about__faqChevron} src={chevron} width='10' height='16' alt='' />
                                </summary>
                                <p className={clss.about__faqDescription}>{t('faq.which-toponyms-found.description')}</p>
                            </details>
                        </li>
                        <li className={clss.about__faqItem}>
                            <details className={clss.about__faqDetails}>
                                <summary className={clss.about__faqSummary}>
                                    <span className={clss.about__faqItemTitle}>{t('faq.can-we-use-materials.title')}</span>
                                    <Image className={clss.about__faqChevron} src={chevron} width='10' height='16' alt='' />
                                </summary>
                                <p className={clss.about__faqDescription}>{t('faq.can-we-use-materials.description')}</p>
                            </details>
                        </li>
                        <li className={clss.about__faqItem}>
                            <details className={clss.about__faqDetails}>
                                <summary className={clss.about__faqSummary}>
                                    <span className={clss.about__faqItemTitle}>{t('faq.who-participates.title')}</span>
                                    <Image className={clss.about__faqChevron} src={chevron} width='10' height='16' alt='' />
                                </summary>
                                <p className={clss.about__faqDescription}>{t('faq.who-participates.description')}</p>
                            </details>
                        </li>
                    </ul>
                </div>
            </section>

            <section id="contacts" className={`${clss.about__contacts} ${clss.section}`}>
                <h2 className={clss.about__contactsHeading}>{t('contacts.title')}</h2>
                <ul className={clss.about__contactsList}>
                    <li className={clss.about__contactsItem}>
                        <div className={clss.about__contactsInfo}>
                            <div className={clss.about__contactsIconWrapper}>
                                <Image className={clss.about__contactsIcon} src={email} alt='' />
                            </div>
                            <span className={clss.about__contactsTitle}>{t('contacts.email.title')}</span>
                        </div>
                        <a href={`mailto:${t('contacts.email.link')}`} className={clss.about__contactsLink}>{t('contacts.email.link')}</a>
                    </li>
                    <li className={clss.about__contactsItem}>
                        <div className={clss.about__contactsInfo}>
                            <div className={clss.about__contactsIconWrapper}>
                                <Image className={clss.about__contactsIcon} src={phone} alt='' />
                            </div>
                            <span className={clss.about__contactsTitle}>{t('contacts.phone.title')}</span>
                        </div>
                        <a style={{ textDecoration: 'none' }} href={`tel:${t('contacts.phone.link')}`} className={clss.about__contactsLink}>{t('contacts.phone.link')}</a>
                    </li>
                    <li className={clss.about__contactsItem}>
                        <div className={clss.about__contactsInfo}>
                            <div className={clss.about__contactsIconWrapper}>
                                <Image className={clss.about__contactsIcon} src={location} alt='' />
                            </div>
                            <span className={clss.about__contactsTitle}>{t('contacts.address.title')}</span>
                        </div>
                        <a style={{ textDecoration: 'none' }} href={`${t('contacts.address.link')}`} className={clss.about__contactsLink}>{t('contacts.address.link')}</a>
                    </li>
                    <li className={clss.about__contactsItem}>
                        <div className={clss.about__contactsInfo}>
                            <div className={clss.about__contactsIconWrapper}>
                                <Image className={clss.about__contactsIcon} src={location} alt='' />
                            </div>
                            <span className={clss.about__contactsTitle}>{t('contacts.instagram.title')}</span>
                        </div>
                        <a style={{ textDecoration: 'none' }} href={`${t('contacts.instagram.link')}`} className={clss.about__contactsLink}>tamgatopto</a>
                    </li>
                    <li className={clss.about__contactsItem}>
                        <div className={clss.about__contactsInfo}>
                            <div className={clss.about__contactsIconWrapper}>
                                <Image className={clss.about__contactsIcon} src={location} alt='' />
                            </div>
                            <span className={clss.about__contactsTitle}>{t('contacts.facebook.title')}</span>
                        </div>
                        <a style={{ textDecoration: 'none' }} href={`${t('contacts.facebook.link')}`} className={clss.about__contactsLink}>tamgatopto</a>
                    </li>
                </ul>
            </section>
        </>
    )
}