'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ToponymMap = dynamic(() => import('@/components/Map/ToponymMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            color: '#666'
        }}>
            Загрузка карты...
        </div>
    )
});

export default function ClientMapWrapper({ toponym, osmId, osmData }) {
    return (
        <Suspense fallback={
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                color: '#666'
            }}>
                Загрузка карты...
            </div>
        }>
            <ToponymMap
                toponym={toponym}
                osmId={osmId}
                osmData={osmData}
            />
        </Suspense>
    );
}
