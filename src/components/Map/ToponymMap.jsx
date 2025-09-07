'use client';

import { useEffect, useState, useRef } from "react";
import { MapContainer, Polygon, Polyline, CircleMarker } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';

import 'leaflet/dist/leaflet.css';

const checkLeafletAvailability = () => {
    return typeof window !== 'undefined' && window.L;
};

export default function ToponymMap({ toponym, osmData }) {
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
        if (mapRef.current && isMapReady) {
            const timeoutId = setTimeout(() => {
                const map = mapRef.current;
                
                if (map && map.getContainer()) {
                    try {
                        if (osmData?.coords?.length > 0) {
                            // Фокусировка на OSM геометрии
                            let allLats = [];
                            let allLngs = [];
                            
                            if (osmData.isMultiPolygon) {
                                // Handle multi-polygon (cities)
                                osmData.coords.forEach(polygon => {
                                    const lats = polygon.map(coord => coord[0]);
                                    const lngs = polygon.map(coord => coord[1]);
                                    allLats.push(...lats);
                                    allLngs.push(...lngs);
                                });
                            } else {
                                // Handle single polygon/polyline
                                const coords = osmData.coords;
                                allLats = coords.map(coord => coord[0]);
                                allLngs = coords.map(coord => coord[1]);
                            }
                            
                            const minLat = Math.min(...allLats);
                            const maxLat = Math.max(...allLats);
                            const minLng = Math.min(...allLngs);
                            const maxLng = Math.max(...allLngs);
                            
                            const bounds = [[minLat, minLng], [maxLat, maxLng]];
                            map.fitBounds(bounds, { padding: [20, 20] });
                        } else {
                            // Фокусировка на точке топонима (для кружочка)
                            map.setView([toponym.latitude, toponym.longitude], 12);
                        }
                    } catch (error) {
                        console.error('Error focusing map:', error);
                    }
                }
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [osmData, isMapReady, toponym.latitude, toponym.longitude]);

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

                {/* Render multi-polygon for relations (cities) */}
                {osmData?.coords?.length > 0 && osmData.elementType === 'relation' && osmData.isMultiPolygon && isMapReady && (
                    <>
                        {osmData.coords.map((polygon, index) => (
                            <Polygon
                                key={index}
                                positions={polygon}
                                pathOptions={{
                                    color: "#0094EB",
                                    weight: 3,
                                    fill: true,
                                    fillColor: "#0094EB",
                                    fillOpacity: 0.2,
                                    stroke: true
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Render single polygon/polyline for ways */}
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

                {/* Render circle marker when no OSM data or unsupported type */}
                {(!osmData?.coords?.length || (osmData.elementType !== 'way' && osmData.elementType !== 'relation')) && isMapReady && (
                    <CircleMarker
                        center={[toponym.latitude, toponym.longitude]}
                        radius={8}
                        pathOptions={{
                            color: "#0094EB",
                            weight: 2,
                            fill: true,
                            fillColor: "#0094EB",
                            fillOpacity: 0.7,
                            stroke: true
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
