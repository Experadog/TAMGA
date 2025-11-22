'use client';

import { useFetch } from '@/lib/hooks/useFetch';
import { useRef } from 'react';
import { MapContainer } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';
import ToponymMarkers from './ToponymMarkers';

import 'leaflet/dist/leaflet.css';
import { useTranslations } from 'next-intl';

export default function SearchableMapComponent({ searchTerm, searchType, locale }) {
    const mapRef = useRef();
    const t = useTranslations('searchableMapComponent');

    // Создаем URL для поиска топонимов
    const apiUrl = `/api/toponyms?search_etymologies=${encodeURIComponent(searchTerm)}`;
    const { data = {}, isLoading: loading, isError: error } = useFetch(apiUrl);

    // Извлекаем топонимы из ответа
    let toponymsArray = [];

    if (data.results && Array.isArray(data.results)) {
        toponymsArray = data.results;
    } else if (Array.isArray(data)) {
        toponymsArray = data;
    }

    // Определяем текст для уведомлений в зависимости от типа поиска
    const getEmptyMessage = () => {
        switch (searchType) {
            case 'etymology':
                return t('etymology');
            case 'topoformant':
                return t('topoformant');
            default:
                return t('toponym');
        }
    };

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                center={[41.2, 74.6]}
                zoom={6}
                minZoom={5}
                maxZoom={18}
                maxBounds={[
                    [39.0, 69.0],
                    [43.5, 81.0]
                ]}
                maxBoundsViscosity={1.0}
                attributionControl={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#d3ecfd', borderRadius: '16px' }}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                <BoundaryCanvasTileLayer
                    tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: 'white',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        {t('loading')}
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        {t('error')}
                    </div>
                )}

                {!loading && !error && toponymsArray.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        {getEmptyMessage()}
                    </div>
                )}

                <ToponymMarkers toponyms={toponymsArray} locale={locale} />
                <FullScreenControl />
                <LocationControl />
            </MapContainer>
        </div>
    );
}
