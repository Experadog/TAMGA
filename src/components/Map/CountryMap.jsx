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

export default function CountryMap({ locale }) {
    const mapRef = useRef();
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
    const { data = {}, isLoading: loading, isError: error } = useFetch(apiUrl);

    // Извлекаем топонимы и пагинацию из ответа
    let toponymsArray = [];
    let count = 0;

    if (data.results && Array.isArray(data.results)) {
        toponymsArray = data.results;
        count = data.count || 0;
    } else if (Array.isArray(data)) {
        toponymsArray = data;
        count = data.length;
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

                {loading && (
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
                        Загрузка топонимов...
                    </div>
                )}

                {error && (
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
                        Ошибка загрузки данных
                    </div>
                )}

                <ToponymMarkers toponyms={toponymsArray} locale={locale} />
                <FullScreenControl />
                <LocationControl />
            </MapContainer>


        </div>
    );
}