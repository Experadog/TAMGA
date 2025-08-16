'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapContainer, AttributionControl } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { useFetch } from '@/lib/hooks/useFetch';

import ToponymMarkers from './ToponymMarkers';
import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';
import ResultsInfo from '@/components/ResultsInfo';

import 'leaflet/dist/leaflet.css';

export default function CountryMap({ locale, searchParams }) {
    const mapRef = useRef();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    
    // Строим URL с query параметрами
    const params = new URLSearchParams();
    if (searchParams && typeof searchParams === 'object') {
        Object.entries(searchParams).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Для массивов добавляем каждое значение отдельно
                value.forEach(item => {
                    if (item && String(item).trim() !== '') {
                        params.append(key, String(item));
                    }
                });
            } else if (value && String(value).trim() !== '') {
                params.set(key, String(value));
            }
        });
    }
    
    const apiUrl = `/api/toponyms${params.toString() ? `?${params.toString()}` : ''}`;
    const { data = {}, isLoading: loading, isError: error } = useFetch(apiUrl);
    
    // Извлекаем топонимы и пагинацию из ответа
    let toponymsArray = [];
    let count = 0;
    let currentPage = 1;
    let limit = parseInt(searchParams?.limit || '50', 10);
    
    if (data.results && Array.isArray(data.results)) {
        toponymsArray = data.results;
        count = data.count || 0;
        // Вычисляем текущую страницу на основе offset
        const offset = parseInt(searchParams?.offset || '0', 10);
        currentPage = Math.floor(offset / limit) + 1;
    } else if (Array.isArray(data)) {
        toponymsArray = data;
        count = data.length;
    }

    // Обработка смены страницы
    const handlePageChange = (page) => {
        const newOffset = (page - 1) * limit;
        const newParams = new URLSearchParams(currentSearchParams);
        newParams.set('offset', newOffset.toString());
        
        const queryString = newParams.toString();
        const newUrl = queryString ? `/${locale}/map?${queryString}` : `/${locale}/map`;
        router.push(newUrl);
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
                style={{ height: '100%', width: '100%', backgroundColor: '#d3ecfd', borderRadius: '16px'}}
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
            
            <ResultsInfo 
                count={count}
                currentPage={currentPage}
                limit={limit}
                onPageChange={handlePageChange}
                loading={loading}
            />
        </div>
    );
}