'use client';

import bufferIcon from '@/assets/icons/buffer.svg';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef } from 'react';
import clss from './index.module.scss';

export function ToponymPernamentLink({ fullPath }) {
    const spanRef = useRef(null);
    const t = useTranslations('toponym');

    const copyToClipboard = async () => {
        try {
            const text = spanRef.current?.innerText || '';
            await navigator.clipboard.writeText(text);
            alert(t('permanent.link'));
        } catch (err) {
            alert(t('permanent.error'));
            console.error(err);
        }
    };

    return (
        <div className={clss.toponymPernamentLink}>
            <span ref={spanRef} className={clss.toponymPernamentLink__path}>{fullPath}</span>
            <Image
                className={clss.toponymPernamentLink__icon}
                src={bufferIcon}
                alt="Скопировать ссылку"
                width={17}
                height={20}
                onClick={copyToClipboard}
            />
        </div>
    );
}
