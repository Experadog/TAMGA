'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';

const ToponymMap = dynamic(() => import('@/components/Map/ToponymMap'), {
    ssr: false,
    loading: () => (
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
            Загрузка карты...
        </div>
    )
});

export default function ClientMapWrapper({ toponym, osmId, osmData }) {
    const [mapError, setMapError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleMapError = (error) => {
        setMapError(error);
        console.error('Map error:', error);
    };

    const handleRetry = () => {
        setMapError(null);
        setRetryCount(prev => prev + 1);
    };

    if (mapError) {
        return (
            <div style={{
                height: '363px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '16px',
                border: '1px solid #dee2e6',
                color: '#6c757d',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '10px', color: '#dc3545' }}>
                    ⚠️ Ошибка загрузки карты
                </div>
                <button 
                    onClick={handleRetry}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Попробовать снова {retryCount > 0 && `(${retryCount})`}
                </button>
            </div>
        );
    }

    return (
        <>
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
                    Загрузка карты...
                </div>
            }>
                <ToponymMap 
                    key={`map-${retryCount}`} // Перезапускаем компонент при retry
                    toponym={toponym} 
                    osmId={osmId} 
                    osmData={osmData}
                    onError={handleMapError}
                />
            </Suspense>
        </>
    );
}
