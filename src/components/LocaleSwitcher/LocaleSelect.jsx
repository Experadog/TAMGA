'use client';

import Image from 'next/image';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';

import langRU from '@/assets/icons/lang-ru.svg'
import chevron from '@/assets/icons/chevron.svg'

import styles from './index.module.scss';

function LocaleSelect({
    children,
    defaultValue,
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();
    const params = useParams();

    function onSelectChange(event) {
        const nextLocale = event.target.value
        startTransition(() => {
            router.replace(
                { pathname, params },
                { locale: nextLocale }
            );
        });
    };

    return (
        <label className={styles.label}>
            <Image className={styles.label__img} src={langRU} width='24' height='24' alt='' />
            <select
                defaultValue={defaultValue}
                disabled={isPending}
                onChange={onSelectChange}
                className={styles.label__select}
            >
                {children}
            </select>
            <div>
                <Image src={chevron} width='8' height='5' alt='' />
            </div>
        </label>
    );
};

export { LocaleSelect };