'use client';

import { useRef } from 'react';
import Image from 'next/image';
import bufferIcon from '@/assets/icons/buffer.svg'; 
import clss from './index.module.scss';

export function ToponymPernamentLink({ fullPath }) {
    const spanRef = useRef(null);

    const copyToClipboard = async () => {
        try {
            const text = spanRef.current?.innerText || '';
            await navigator.clipboard.writeText(text);
            alert('Ссылка скопирована!');
        } catch (err) {
            alert('Ошибка копирования');
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
