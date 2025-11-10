import { getTranslations } from 'next-intl/server';
import { BurgerMenu } from '../BurgerMenu';
import { LocaleSwitcher } from '../LocaleSwitcher';

import { Link } from '@/i18n/navigation';
import { getStartsWithByLocale } from '@/lib/utils/getStartsWithByLocale';
import Image from 'next/image';
import styles from './index.module.scss';

async function Header({ locale }) {
    const t = await getTranslations({ locale, namespace: 'header.navigation' });
    const startswith = getStartsWithByLocale(locale);

    const MENU_ITEMS = [
        { name: t('search'), path: '/search' },
        { name: t('glossary'), path: '/glossary' },
        {
            name: t('map'),
            path: {
                pathname: `/map`,
                query: {
                    startswith,
                    offset: '0',
                    language: locale
                }
            },
        },
        { name: t('blog'), path: '/blog' },
        { name: t('about'), path: '/about' },
    ]

    return (
        <header className={styles.header}>
            <BurgerMenu items={MENU_ITEMS} />
            <Link href="/" className={styles.header__logo} aria-label="Home">
                <Image
                    className={styles.header__img}
                    src="/logo.svg"
                    width={122}
                    height={26}
                    alt="Logo"
                    priority
                    sizes="(max-width: 767px) 112px, (max-width: 1023px) 112px, 122px"
                />
            </Link>
            <nav className={styles.header__nav}>
                <ul className={styles.header__navList}>
                    {MENU_ITEMS.map((item, idx) => (
                        <li key={idx} className={styles.header__navItem}>
                            <Link href={item.path} className={styles.header__navLink}>{item.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <LocaleSwitcher />
        </header>
    )
}

export { Header };
