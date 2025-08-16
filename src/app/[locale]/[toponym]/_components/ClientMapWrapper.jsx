'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ToponymMap = dynamic(() => import('@/components/Map/ToponymMap'), {
    ssr: false
});

export default function ClientMapWrapper({ toponym, osmId }) {
    return (
        <Suspense fallback={
            <div style={{
                height: '363px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                color: '#666'
            }}>
                Loading map...
            </div>
        }>
            <ToponymMap toponym={toponym} osmId={osmId} />
        </Suspense>
    );
}
