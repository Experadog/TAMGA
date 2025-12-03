'use client';

import { useFetch } from '@/lib/hooks/useFetch';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { MapContainer } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';
import ToponymMarkers from './ToponymMarkers';

import 'leaflet/dist/leaflet.css';
import { useTranslations } from 'next-intl';

export default function CountryMap({ locale, glossaryToponyms }) {
    const t = useTranslations('map');
    const mapRef = useRef();

    const isGlossaryPage = Array.isArray(glossaryToponyms);

    const sp = useSearchParams();

    const cleanSearch = useMemo(() => {
        const raw = sp.get('search') || '';
        if (!raw) return '';
        try { return decodeURIComponent(decodeURIComponent(raw)); } catch { }
        try { return decodeURIComponent(raw); } catch { }
        return raw;
    }, [sp]);

    // Строим URL из ФАКТИЧЕСКИХ query-параметров
    const apiUrl = useMemo(() => {
        if (isGlossaryPage) return null; // Не строим URL, если используем переданные данные
        const params = new URLSearchParams();
        // копируем всё как есть (повторяющиеся ключи сохраняются)
        for (const [k, v] of sp.entries()) {
            if (v && String(v).trim() !== '') params.append(k, v);
        }

        if (params.has('search')) {
            params.set('search', cleanSearch);
        }

        const qs = params.toString();
        return `/api/toponyms/toponym/list/maps${qs ? `?${qs}` : ''}`;
    }, [sp, cleanSearch]);
    const { data = {}, isLoading: loading, isError: error } = useFetch(apiUrl, {
        enabled: !isGlossaryPage // Отключаем запрос, если данные пришли через пропсы
    });

    // Извлекаем топонимы и пагинацию из ответа
    let toponymsArray = [];
    let count = 0;
    let actualLoading = loading;
    let actualError = error;

    if (isGlossaryPage) {
        // ИСПОЛЬЗУЕМ ПЕРЕДАННЫЕ ДАННЫЕ
        toponymsArray = glossaryToponyms;
        count = glossaryToponyms.length;
        actualLoading = false;
        actualError = false;
    } else {
        // ИСПОЛЬЗУЕМ ДАННЫЕ ИЗ useFetch (старая логика)
        if (data.results && Array.isArray(data.results)) {
            toponymsArray = data.results;
            count = data.count || 0;
        } else if (Array.isArray(data)) {
            toponymsArray = data;
            count = data.length;
        }
    }

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

                {actualLoading && (
                    <div style={{
                        position: 'absolute',
                        top: '70px',
                        left: '20px',
                        background: 'white',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        {t('loading-toponyms')}
                    </div>
                )}

                {actualError && (
                    <div style={{
                        position: 'absolute',
                        top: '70px',
                        left: '20px',
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        {t('loading-error')}
                    </div>
                )}

                <ToponymMarkers toponyms={toponymsArray} locale={locale} />
                <FullScreenControl />
                <LocationControl />
            </MapContainer>


        </div>
    );
}