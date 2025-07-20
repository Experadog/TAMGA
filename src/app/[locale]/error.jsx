'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';


export default function Error({ error, reset }) {
    // const t = useTranslations('Error');


    return (
        <div>
            <button
                className="text-white underline underline-offset-2"
                onClick={reset}
                type="button"
            >
                reset error
            </button>
        </div>
    );
}