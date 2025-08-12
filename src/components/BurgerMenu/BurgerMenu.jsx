'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import styles from './index.module.scss';
import cancelIcon from '@/assets/icons/cancel.svg';
import burgerIcon from '@/assets/icons/burger.svg'
import useMediaQuery from '@/lib/hooks/useMediaQuery';
import { Link } from '@/i18n/navigation';

function BurgerMenu({ items }) {
    const [isMounted, setIsMounted] = useState(false);
    const [open, setOpen] = useState(false);

    const isMobile = useMediaQuery('(max-width: 767px)');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('no-scroll', open);
        return () => document.body.classList.remove('no-scroll');
    }, [open]);

    if (!isMounted || !isMobile) return null;

    return (
        <>
            {!open ? (
                <button
                    title='Open menu'
                    aria-label='Open menu'
                    className={styles.burger__btn}
                    onClick={() => setOpen(true)}
                >
                    <Image
                        src={burgerIcon}
                        width='18'
                        height='12'
                        alt=''
                    />
                </button>
            ) : (
                <div className={styles.burger__overlay} onClick={() => setOpen(false)}>
                    <div className={styles.burger__content} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.burger__header}>
                            <button
                                title='Close menu'
                                aria-label='Close menu'
                                className={styles.burger__cancelBtn}
                                onClick={() => setOpen(false)}
                            >
                                <Image src={cancelIcon} width={14} height={14} alt='' />
                            </button>
                            <Link 
                                href='/' 
                                onClick={() => setOpen(false)}
                                className={styles.burger__logo}
                            >
                                <Image src='/logo.svg' width={35} height={30} alt='KG Map Logo' />
                                <span className={styles.burger__title}>KG Map</span>
                            </Link>
                        </div>
                        <ul className={styles.burger__menu}>
                            {items.length > 1 &&
                                items.map((item, idx) => (
                                    <li key={idx} className={styles.burger__menuItem}>
                                        <Link 
                                            className={styles.burger__menuLink}
                                            href={item.path}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpen(false);
                                            }}
                                        >{item.name}</Link>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}

export { BurgerMenu };
