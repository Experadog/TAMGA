'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import chevron from '@/assets/icons/chevron.svg';
import langEN from '@/assets/icons/lang-en.svg';
import langKY from '@/assets/icons/lang-ky.svg';
import langRU from '@/assets/icons/lang-ru.svg';

import styles from './index.module.scss';

function LocaleSelect({ children, defaultValue }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const containerRef = useRef(null);

    const currentLocale = (params && params.locale) || defaultValue || 'ru';

    // парсим <option> → {value,label,icon}
    const options = useMemo(() => {
        const iconByLocale = { ru: langRU, ky: langKY, en: langEN };
        return React.Children.toArray(children)
            .filter(Boolean)
            .map((child) => {
                if (!React.isValidElement(child)) return null;
                const value = child.props?.value;
                const label = child.props?.children;
                if (!value) return null;
                return { value, label, icon: iconByLocale[value] || langRU };
            })
            .filter(Boolean);
    }, [children]);

    const currentIcon = useMemo(() => {
        const f = options.find((o) => o.value === currentLocale);
        return (f && f.icon) || langRU;
    }, [options, currentLocale]);

    // esc и клик вне компонента — закрыть
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        const onClickOutside = (e) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClickOutside);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, [open]);

    function changeLocale(nextLocale) {
        if (isPending || !nextLocale || nextLocale === currentLocale) {
            setOpen(false);
            return;
        }
        startTransition(() => {
            router.replace({ pathname, params }, { locale: nextLocale });
            setOpen(false);
        });
    }

    return (
        <div className={styles.wrapper} ref={containerRef}>
            <button
                type="button"
                className={styles.labelBtn}
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open ? 'true' : 'false'}
                disabled={isPending}
            >
                <Image className={styles.labelImg} src={currentIcon} width={24} height={24} alt="" />
                <span className={styles.labelText}>{currentLocale}</span>
                <Image className={styles.labelChevron} src={chevron} width={8} height={5} alt="" />
            </button>

            {open && (
                <div className={styles.dropdown} role="listbox">
                    <ul className={styles.langList}>
                        {options.map((opt) => {
                            const active = opt.value === currentLocale;
                            return (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        className={`${styles.langItem} ${active ? styles.langItemActive : ''}`}
                                        onClick={() => changeLocale(opt.value)}
                                        disabled={isPending}
                                        role="option"
                                        aria-selected={active ? 'true' : 'false'}
                                    >
                                        <Image src={opt.icon} width={20} height={20} alt="" />
                                        <span>{opt.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export { LocaleSelect };
