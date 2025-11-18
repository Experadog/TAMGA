'use client';

import { useEffect, useRef, useState } from "react";
import { CircleMarker, MapContainer, Polygon, Polyline } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';

import 'leaflet/dist/leaflet.css';

const checkLeafletAvailability = () => {
    return typeof window !== 'undefined' && window.L;
};

// ★ хелпер: валидно ли число
const isFiniteCoord = (v) => typeof v === 'number' && Number.isFinite(v);

export default function ToponymMap({ toponym, osmData }) {
    const [isMapReady, setIsMapReady] = useState(false);
    const [leafletReady, setLeafletReady] = useState(false);
    const mapRef = useRef(null);

    // ★ вычисляем наличие валидной точки
    const hasPoint =
        isFiniteCoord(toponym?.latitude) && isFiniteCoord(toponym?.longitude);

    // ★ безопасный центр и зум по умолчанию (КР, Бишкек)
    const DEFAULT_CENTER = [42.8746, 74.5698];
    const DEFAULT_ZOOM = 6;

    const initialCenter = hasPoint
        ? [toponym.latitude, toponym.longitude]
        : DEFAULT_CENTER;

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
                                // мультиполигон
                                osmData.coords.forEach(polygon => {
                                    const lats = polygon.map(coord => coord[0]).filter(isFiniteCoord);
                                    const lngs = polygon.map(coord => coord[1]).filter(isFiniteCoord);
                                    allLats.push(...lats);
                                    allLngs.push(...lngs);
                                });
                            } else {
                                // одиночный полигон/линия
                                const coords = (osmData.coords || []).filter(
                                    p => Array.isArray(p) && isFiniteCoord(p[0]) && isFiniteCoord(p[1])
                                );
                                allLats = coords.map(coord => coord[0]);
                                allLngs = coords.map(coord => coord[1]);
                            }

                            if (allLats.length && allLngs.length) {
                                const minLat = Math.min(...allLats);
                                const maxLat = Math.max(...allLats);
                                const minLng = Math.min(...allLngs);
                                const maxLng = Math.max(...allLngs);
                                const bounds = [[minLat, minLng], [maxLat, maxLng]];
                                map.fitBounds(bounds, { padding: [20, 20] });
                            } else if (hasPoint) {
                                // на всякий случай fallback на точку
                                map.setView([toponym.latitude, toponym.longitude], 12);
                            } else {
                                // крайний fallback — дефолтный центр
                                map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
                            }
                        } else if (hasPoint) {
                            // Фокусировка на точке топонима (для кружочка)
                            map.setView([toponym.latitude, toponym.longitude], 12);
                        } else {
                            // ★ если нет ни геометрии, ни точки — просто дефолт
                            map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
                        }
                    } catch (error) {
                        console.error('Error focusing map:', error);
                    }
                }
            }, 200);

            return () => clearTimeout(timeoutId);
        }
    }, [osmData, isMapReady, hasPoint, toponym?.latitude, toponym?.longitude]); // ★ зависимость hasPoint

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
                center={initialCenter}
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

                {/* way: polygon / polyline */}
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

                {/* Render single polygon/polyline for ways */}
                {/* {osmData?.coords?.length > 0 && osmData.elementType === 'way' && isMapReady && (
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
                )} */}

                {/* ★ Маркер только если точка валидная */}
                {(!osmData?.coords?.length || (osmData.elementType !== 'way' && osmData.elementType !== 'relation')) && isMapReady && hasPoint && (
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
            {/* ★ Мягкая заглушка поверх карты, если нет ни точки, ни геометрии */}
            {!hasPoint && (!osmData?.coords?.length || osmData.elementType === undefined) && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        color: '#666',
                        fontSize: 14
                    }}
                >
                    Координаты отсутствуют — объект на карте не отмечен
                </div>
            )}
        </div>
    );
}
