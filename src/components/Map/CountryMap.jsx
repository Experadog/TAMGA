'use client';

import { useRef } from 'react';
import { MapContainer, AttributionControl } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { useFetch } from '@/lib/hooks/useFetch';

import ToponymMarkers from './ToponymMarkers';
import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';

import 'leaflet/dist/leaflet.css';

export default function CountryMap({ locale }) {
    const { data: toponyms = [], isLoading: loading, isError: error } = useFetch('/api/toponyms');
    const mapRef = useRef();
    
    return (
        <MapContainer
            center={[41.2, 74.6]}
            zoom={6}
            minZoom={6}
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

            <ToponymMarkers toponyms={toponyms} locale={locale} />
            <FullScreenControl />
            <LocationControl />
        </MapContainer>
    );
}