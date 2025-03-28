import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from '../LocaleSwitcher';
import { BurgerMenu } from '../BurgerMenu'

import styles from './index.module.scss';
import Link from 'next/link';
import Image from 'next/image';

function Header() {
    
    const t = useTranslations('Navitations');

    const MENU_ITEMS = [
        {name: t('search'), path: '/'},
        {name: t('glossary'), path: '/'},
        {name: t('map'), path: '/'},
        {name: t('blog'), path: '/blog'},
        {name: t('about'), path: '/'},
    ]

    return (
        <header className={styles.header}>
            <BurgerMenu items={MENU_ITEMS} />
            <Link href='/' className={styles.header__logo}>
                <Image className={styles.header__img} src='/logo.svg' width='40' height='34' alt='' />
                <span className={styles.header__title}>KG Map</span>
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

export { Header }