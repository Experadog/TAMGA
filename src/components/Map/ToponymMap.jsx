'use client';

import { MapContainer, GeoJSON, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';

function GeoJSONWithZoom({ data }) {
    const map = useMap();
    useEffect(() => {
        if (!data?.features?.length) return;
        const geoJsonLayer = L.geoJSON(data);
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds, { maxZoom: 10 });
    }, [data, map]);

    return <GeoJSON data={data} />;
}

function toGeoJSON(toponym) {
    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    name_ky: toponym.name_ky,
                    name_ru: toponym.name_ru,
                    description_ky: toponym.description_ky,
                    description_ru: toponym.description_ru
                },
                geometry: {
                    type: "Point",
                    coordinates: [toponym.longitude, toponym.latitude] 
                }
            }
        ]
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
