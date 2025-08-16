'use client';

import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

function GeoJSONWithZoom({ data }) {
    const map = useMap();
    
    useEffect(() => {
        if (!data?.features?.length) return;
        const geoJsonLayer = L.geoJSON(data);
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds, { maxZoom: 10 });
    }, [data, map]);

    const geoJsonStyle = (feature) => {
        const { type } = feature.properties;
        
        switch (type) {
            case 'boundary_area':
                return {
                    fillColor: '#94bcff',
                    fillOpacity: 0.2,
                    color: '#94bcff',
                    weight: 2,
                    dashArray: '5, 5'
                };
            case 'boundary_line':
                return {
                    color: '#94bcff',
                    weight: 3,
                    dashArray: '10, 5'
                };
            default:
                return {
                    color: '#94bcff',
                    weight: 2,
                    fillOpacity: 0.7
                };
        }
    };

    const pointToLayer = (feature, latlng) => {
        const { type, label } = feature.properties;
        
        let size = 8;
        
        switch (type) {
            case 'main_point':
                size = 10;
                break;
        }
        
        const htmlMarker = L.divIcon({
            html: `<div style="
                background-color: #94bcff;
                width: ${size * 2}px;
                height: ${size * 2}px;
                border-radius: 50%;
                border: none;
            "></div>`,
            className: 'custom-point-marker',
            iconSize: [size * 2, size * 2],
            iconAnchor: [size, size]
        });
        
        return L.marker(latlng, { icon: htmlMarker });
    };

    return (
        <GeoJSON 
            data={data} 
            style={geoJsonStyle}
            pointToLayer={pointToLayer}
        />
    );
}

function toGeoJSON(toponym) {
    const features = [];
    
    if (toponym.latitude && toponym.longitude) {
        features.push({
            type: "Feature",
            properties: {
                name_ky: toponym.name_ky,
                name_ru: toponym.name_ru,
                description_ky: toponym.description_ky,
                description_ru: toponym.description_ru,
                type: 'main_point'
            },
            geometry: {
                type: "Point",
                coordinates: [toponym.longitude, toponym.latitude] 
            }
        });
    }

    const hasStartCoords = toponym.latitude_start && toponym.longitude_start;
    const hasMiddleCoords = toponym.latitude_middle && toponym.longitude_middle;
    const hasEndCoords = toponym.latitude_end && toponym.longitude_end;

    if (hasStartCoords || hasMiddleCoords || hasEndCoords) {
        const coordinates = [];
        
        if (hasStartCoords) {
            coordinates.push([toponym.longitude_start, toponym.latitude_start]);
        }
        
        if (hasMiddleCoords) {
            coordinates.push([toponym.longitude_middle, toponym.latitude_middle]);
        }
        
        if (hasEndCoords) {
            coordinates.push([toponym.longitude_end, toponym.latitude_end]);
        }

        if (toponym.latitude && toponym.longitude) {
            const mainPoint = [toponym.longitude, toponym.latitude];
            const alreadyExists = coordinates.some(coord => 
                Math.abs(coord[0] - mainPoint[0]) < 0.0001 && 
                Math.abs(coord[1] - mainPoint[1]) < 0.0001
            );
            if (!alreadyExists) {
                coordinates.push(mainPoint);
            }
        }

        if (coordinates.length >= 2) {
            if (coordinates.length >= 3) {
                if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
                    coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
                    coordinates.push([...coordinates[0]]);
                }
                
                features.push({
                    type: "Feature",
                    properties: {
                        name: toponym.name_ru || toponym.name_ky,
                        type: 'boundary_area'
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [coordinates]
                    }
                });
            } else {
                features.push({
                    type: "Feature",
                    properties: {
                        name: toponym.name_ru || toponym.name_ky,
                        type: 'boundary_line'
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: coordinates
                    }
                });
            }
        }

        if (hasStartCoords) {
            features.push({
                type: "Feature",
                properties: { type: 'start_point', label: 'Начало' },
                geometry: {
                    type: "Point",
                    coordinates: [toponym.longitude_start, toponym.latitude_start]
                }
            });
        }
        
        if (hasMiddleCoords) {
            features.push({
                type: "Feature",
                properties: { type: 'middle_point', label: 'Середина' },
                geometry: {
                    type: "Point",
                    coordinates: [toponym.longitude_middle, toponym.latitude_middle]
                }
            });
        }
        
        if (hasEndCoords) {
            features.push({
                type: "Feature",
                properties: { type: 'end_point', label: 'Конец' },
                geometry: {
                    type: "Point",
                    coordinates: [toponym.longitude_end, toponym.latitude_end]
                }
            });
        }
    }

    return {
        type: "FeatureCollection",
        features: features
    };
}

export default function ToponymMap({ toponym }) {
    const geoJSONData = useMemo(() => toGeoJSON(toponym), [toponym]);

    return (
        <div className="country-map">
            <MapContainer
                center={[toponym.latitude, toponym.longitude]}
                zoom={6}
                style={{ height: "100vh", width: "100%" }}
            >
                <BoundaryCanvasTileLayer
                    tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GeoJSONWithZoom data={geoJSONData} />
            </MapContainer>
        </div>
    );
}
