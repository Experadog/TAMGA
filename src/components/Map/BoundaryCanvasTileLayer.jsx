// BoundaryCanvasTileLayer.js
import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';

const loadBoundaryCanvas = () => {
    if (typeof window !== 'undefined' && !L.TileLayer.BoundaryCanvas) {
        const script = document.createElement('script');
        script.src = 'https://cdn.rawgit.com/aparshin/leaflet-boundary-canvas/f00b4d35/src/BoundaryCanvas.js';
        script.async = true;
        document.body.appendChild(script);
    }
};

function BoundaryCanvasTileLayer({ tileUrl }) {
    const map = useMap();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBoundaryCanvas();

        let layer;
        let mounted = true;

        const fetchKGZGeoJSON = async () => {
            try {
                const response = await fetch('/data/kyrgyzstan-boundary.json');
                if (!response.ok) {
                    throw new Error('Не удалось загрузить границы Кыргызстана');
                }
                const geoJSON = await response.json();
                return geoJSON;
            } catch (error) {
                console.error('Ошибка загрузки границ:', error);
                // Fallback: простая граница Кыргызстана
                return {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            properties: { name: "Kyrgyzstan" },
                            geometry: {
                                type: "Polygon",
                                coordinates: [
                                    [
                                        [69.25, 41.85],
                                        [78.18, 41.18],
                                        [78.12, 40.83],
                                        [73.49, 39.43],
                                        [69.46, 39.53],
                                        [69.25, 41.85]
                                    ]
                                ]
                            }
                        }
                    ]
                };
            }
        };

        const addLayer = async () => {
            setLoading(true);
            const geoJSON = await fetchKGZGeoJSON();

            if (!L.TileLayer.BoundaryCanvas) {
                // Wait until plugin is loaded
                await new Promise((resolve) => {
                    const interval = setInterval(() => {
                        if (L.TileLayer.BoundaryCanvas) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 100);
                });
            }

            if (!mounted) return;

            layer = new L.TileLayer.BoundaryCanvas(tileUrl, {
                boundary: geoJSON,
            });

            map.addLayer(layer);
            const bounds = L.geoJSON(geoJSON).getBounds();
            map.fitBounds(bounds);
            setLoading(false);
        };

        addLayer();

        return () => {
            mounted = false;
            if (layer) map.removeLayer(layer);
        };
    }, [map, tileUrl]);

    return loading ? (
        <div
            style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'white',
                padding: '10px 15px',
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
            }}
        >
            Загрузка границ Кыргызстана...
        </div>
    ) : null;
}

export { BoundaryCanvasTileLayer };
