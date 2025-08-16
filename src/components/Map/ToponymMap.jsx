'use client';

import { useEffect, useState, useRef } from "react";
import { MapContainer, Polygon, Polyline } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';

import FullScreenControl from './FullScreenControl';
import LocationControl from './LocationControl';

import 'leaflet/dist/leaflet.css';

export default function ToponymMap({ toponym, osmId }) {
    const [coords, setCoords] = useState([]);
    const [elementType, setElementType] = useState(null);
    const [isClosedWay, setIsClosedWay] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        const query = `
            [out:json];
            way(${osmId});
            out geom;
        `;

        fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.elements.length > 0) {
                    const element = data.elements[0];
                    const points = element.geometry.map(p => [p.lat, p.lon]);
                    setCoords(points);
                    setElementType(element.type);

                    if (points.length > 2) {
                        const firstPoint = points[0];
                        const lastPoint = points[points.length - 1];
                        const isClosed = firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];
                        setIsClosedWay(isClosed);
                    }
                }
            });
    }, [osmId]);

    useEffect(() => {
        if (coords.length > 0 && mapRef.current) {
            setTimeout(() => {
                const map = mapRef.current;
                
                if (map) {
                    const lats = coords.map(coord => coord[0]);
                    const lngs = coords.map(coord => coord[1]);
                    
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    
                    const bounds = [[minLat, minLng], [maxLat, maxLng]];
                    map.fitBounds(bounds, { padding: [20, 20] });
                }
            }, 100);
        }
    }, [coords]);

    return (
        <MapContainer
            ref={mapRef}
            center={[toponym.latitude, toponym.longitude]}
            zoom={6}
            minZoom={6}
            maxZoom={18}
            maxBounds={[
                [39.0, 69.0],
                [43.5, 81.0]
            ]}
            maxBoundsViscosity={1.0}
            attributionControl={false}
            style={{ height: '100%', width: '100%', backgroundColor: '#d3ecfd', borderRadius: '16px' }}
        >
            <BoundaryCanvasTileLayer
                tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FullScreenControl />
            <LocationControl />

            {coords.length > 0 && elementType === 'way' && (
                <>
                    {isClosedWay ? (
                        <Polygon
                            positions={coords}
                            pathOptions={{
                                color: "#0094EB",
                                weight: 3,
                                fill: true,
                                fillColor: "#0094EB",
                                fillOpacity: 0.2
                            }}
                        />
                    ) : (
                        <Polyline
                            positions={coords}
                            pathOptions={{ color: "#0094EB", weight: 4 }}
                        />
                    )}
                </>
            )}
        </MapContainer>
    );
}
