'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import chevron from '@/assets/icons/chevron.svg';
import styles from './index.module.scss';

function LocaleSelect({ children, defaultValue }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();

    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const containerRef = useRef(null);

    const currentLocale = (params && params.locale) || defaultValue || 'ky';

    // соответствие: короткое → длинное название
    const shortNames = { ru: 'Рус', ky: 'Кыр', en: 'Eng' };
    const fullNames = { ru: 'Русский', ky: 'Кыргызча', en: 'English' };

    // парсим <option>
    const options = useMemo(() => {
        return React.Children.toArray(children)
            .filter(Boolean)
            .map((child) => {
                if (!React.isValidElement(child)) return null;
                const value = child.props?.value;
                const label = fullNames[value] || child.props?.children;
                return { value, label };
            })
            .filter(Boolean);
    }, [children]);

    // закрытие по клику вне и по Esc
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
                <span className={styles.labelText}>{shortNames[currentLocale] || currentLocale}</span>
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
