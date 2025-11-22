// BoundaryCanvasTileLayer.js
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useFetch } from '../../lib/hooks/useFetch';

import * as L from 'leaflet';
import { useTranslations } from 'next-intl';

const loadBoundaryCanvas = () => {
    if (typeof window !== 'undefined' && !L.TileLayer.BoundaryCanvas) {
        const script = document.createElement('script');
        script.src = 'https://cdn.rawgit.com/aparshin/leaflet-boundary-canvas/f00b4d35/src/BoundaryCanvas.js';
        script.async = true;
        document.body.appendChild(script);
    }
};

function BoundaryCanvasTileLayer({ tileUrl }) {
    const t = useTranslations('map');
    const map = useMap();
    const [loading, setLoading] = useState(true);

    const { data: geoJSON, isLoading: isGeoJSONLoading, isError } = useFetch(`${process.env.NEXT_PUBLIC_KG_BOUNDARY_API_URL}`);

    useEffect(() => {
        if (isError) {
            console.warn('Не удалось загрузить границы Кыргызстана, будет использован обычный слой карты');
        }
    }, [isError]);

    useEffect(() => {
        loadBoundaryCanvas();

        let layer;
        let mounted = true;

        const addLayer = async () => {
            try {
                setLoading(true);

                if (!mounted) return;

                if (isError) {
                    layer = new L.TileLayer(tileUrl);
                    map.addLayer(layer);
                    setLoading(false);
                    return;
                }

                if (!geoJSON) return;

                if (!L.TileLayer.BoundaryCanvas) {
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
            } catch (error) {
                console.error('Ошибка при добавлении слоя карты:', error);

                if (mounted && map) {
                    layer = new L.TileLayer(tileUrl);
                    map.addLayer(layer);
                    setLoading(false);
                }
            }
        };

        if (!isGeoJSONLoading && (geoJSON || isError)) {
            addLayer();
        }

        return () => {
            mounted = false;
            if (layer) map.removeLayer(layer);
        };
    }, [map, tileUrl, geoJSON, isGeoJSONLoading, isError]);

    return (loading || isGeoJSONLoading) ? (
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
            {isError ? t('loading-map') : t('borders-loading')}
        </div>
    ) : null;
}

export { BoundaryCanvasTileLayer };
