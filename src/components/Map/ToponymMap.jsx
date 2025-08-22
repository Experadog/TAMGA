'use client';

import { useEffect, useState, useRef } from "react";
import { MapContainer, Polygon, Polyline } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';

import 'leaflet/dist/leaflet.css';

const checkLeafletAvailability = () => {
    return typeof window !== 'undefined' && window.L;
};

export default function ToponymMap({ toponym, osmData, onError }) {
    const [isMapReady, setIsMapReady] = useState(false);
    const [leafletReady, setLeafletReady] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        const checkLeaflet = () => {
            if (checkLeafletAvailability()) {
                setLeafletReady(true);
            } else {
                setTimeout(checkLeaflet, 100);
            }
        };
        
        checkLeaflet();
    }, []);

    useEffect(() => {
        if (osmData?.coords?.length > 0 && mapRef.current && isMapReady) {
            const timeoutId = setTimeout(() => {
                const map = mapRef.current;
                
                if (map && map.getContainer()) {
                    try {
                        const coords = osmData.coords;
                        const lats = coords.map(coord => coord[0]);
                        const lngs = coords.map(coord => coord[1]);
                        
                        const minLat = Math.min(...lats);
                        const maxLat = Math.max(...lats);
                        const minLng = Math.min(...lngs);
                        const maxLng = Math.max(...lngs);
                        
                        const bounds = [[minLat, minLng], [maxLat, maxLng]];
                        map.fitBounds(bounds, { padding: [20, 20] });
                    } catch (error) {
                        console.error('Error fitting bounds:', error);
                        onError?.(error);
                    }
                }
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [osmData, isMapReady, onError]);

    const handleMapReady = () => {
        setIsMapReady(true);
    };

    if (!leafletReady) {
        return (
            <div style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                color: '#666'
            }}>
                ️ Инициализация карты...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                ref={mapRef}
                center={[toponym.latitude, toponym.longitude]}
                zoom={5}
                minZoom={6}
                maxZoom={18}
                maxBounds={[
                    [39.0, 69.0],
                    [43.5, 81.0]
                ]}
                maxBoundsViscosity={1.0}
                attributionControl={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#d3ecfd', borderRadius: '16px' }}
                whenReady={handleMapReady}
            >
                <BoundaryCanvasTileLayer
                    tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FullScreenControl />
                <LocationControl />

                {osmData?.coords?.length > 0 && osmData.elementType === 'way' && isMapReady && (
                    <>
                        {osmData.isClosedWay ? (
                            <Polygon
                                positions={osmData.coords}
                                pathOptions={{
                                    color: "#0094EB",
                                    weight: 3,
                                    fill: true,
                                    fillColor: "#0094EB",
                                    fillOpacity: 0.2,
                                    stroke: true
                                }}
                            />
                        ) : (
                            <Polyline
                                positions={osmData.coords}
                                pathOptions={{ 
                                    color: "#0094EB", 
                                    weight: 4,
                                    opacity: 1,
                                    stroke: true
                                }}
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
}
