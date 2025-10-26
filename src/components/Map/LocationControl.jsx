'use client';

import L from 'leaflet';
import { LocateControl } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const LocationControl = () => {
    const map = useMap();
    const sp = useSearchParams();
    const shouldLocate = sp.get('locate') === '1';

    useEffect(() => {
        if (!map) return;

        const locateControl = new LocateControl({
            position: 'topleft',
            strings: { title: 'Показать мое местоположение' },
            locateOptions: {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            },
            flyTo: true,
            setView: 'always',
            keepCurrentZoomLevel: false,
            initialZoomLevel: 18,
            drawCircle: false,
            drawMarker: true,
            showPopup: false,
            markerStyle: {
                color: '#0094EB',
                fillColor: '#0094EB',
                fillOpacity: 0.8,
                weight: 3,
                radius: 16,
            },
        });

        map.addControl(locateControl);

        // Гарантированно дождаться полной загрузки тайлов и рендера UI
        const ensureMapIsReady = async () => {
            // ждём пока карта реально "готова" по флагу Leaflet
            await new Promise((resolve) => {
                if (map._loaded) resolve();
                else map.once('load', () => resolve());
            });

            // ждём пока тайлы прорисуются
            await new Promise((resolve) => {
                let tilesLoading = 0;
                map.eachLayer((layer) => {
                    if (layer instanceof L.TileLayer) {
                        layer.on('loading', () => tilesLoading++);
                        layer.on('load', () => {
                            tilesLoading--;
                            if (tilesLoading <= 0) resolve();
                        });
                    }
                });

                // fallback если нет TileLayer — ждём 500 мс
                setTimeout(resolve, 500);
            });

            // invalidate size + microзадержка
            map.invalidateSize();
            await new Promise((r) => setTimeout(r, 150));
        };

        const startLocateSafely = async () => {
            await ensureMapIsReady();

            // подписываемся ДО старта
            const onFound = (e) => {
                if (e?.latlng) {
                    // ещё одна задержка, чтобы marker успел добавиться
                    setTimeout(() => {
                        map.flyTo(e.latlng, 17, { duration: 1.2 });
                    }, 300);
                }
                map.off('locationfound', onFound);
            };
            map.on('locationfound', onFound);

            try {
                locateControl.start();
            } catch (err) {
                console.warn('Locate start failed:', err);
            }
        };

        if (shouldLocate) {
            // задержка чтобы дождаться React-отрисовки всей карты
            setTimeout(() => {
                startLocateSafely();
            }, 600);
        }

        return () => {
            map.removeControl(locateControl);
        };
    }, [map, shouldLocate]);

    return null;
};

export default LocationControl;