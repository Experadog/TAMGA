'use client';

import dynamic from 'next/dynamic';

const ToponymMap = dynamic(() => import('@/components/Map/ToponymMap'), {
    ssr: false
});

export default function ClientMapWrapper({ toponym }) {
    return <ToponymMap toponym={toponym} />;
}
