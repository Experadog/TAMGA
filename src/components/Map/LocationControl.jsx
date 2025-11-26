'use client';

import L from 'leaflet';
import { LocateControl } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import styles from './LocationControl.module.scss';

// Те же границы, что в maxBounds карты (Кыргызстан)
const KG_BOUNDS = {
    minLat: 39.0,
    maxLat: 43.5,
    minLng: 69.0,
    maxLng: 81.0,
};

const LocationControl = () => {
    const t = useTranslations('map');
    const tLoc = useTranslations('locationControl');
    const map = useMap();
    const sp = useSearchParams();
    const shouldLocate = sp.get('locate') === '1';

    const [showOutsideModal, setShowOutsideModal] = useState(false);

    useEffect(() => {
        if (!showOutsideModal) return;

        if (typeof document === 'undefined') return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [showOutsideModal]);

    useEffect(() => {
        if (!map) return;

        if (showOutsideModal) {
            map.scrollWheelZoom.disable();
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
        } else {
            map.scrollWheelZoom.enable();
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
        }

        return () => {
            map.scrollWheelZoom.enable();
            map.dragging.enable();
            map.touchZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
        };
    }, [map, showOutsideModal]);

    useEffect(() => {
        if (!map) return;

        const locateControl = new LocateControl({
            position: 'topleft',
            strings: { title: t('show-my-location') },
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

        const ensureMapIsReady = async () => {
            await new Promise((resolve) => {
                if (map._loaded) resolve();
                else map.once('load', () => resolve());
            });

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

                setTimeout(resolve, 500);
            });

            map.invalidateSize();
            await new Promise((r) => setTimeout(r, 150));
        };

        const startLocateSafely = async () => {
            await ensureMapIsReady();

            const onFound = (e) => {
                if (e?.latlng) {
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
            const timer = setTimeout(() => {
                if (typeof window === 'undefined' || !('geolocation' in navigator)) {
                    startLocateSafely();
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        // ИГНОРИРУЕМ РЕАЛЬНУЮ ГЕО-ЛОКАЦИЮ КИРГЫЗСТАНА
                        // const latitude = 55.75;
                        // const longitude = 37.61;
                        const { latitude, longitude } = pos.coords;

                        const inKyrgyzstan =
                            latitude >= KG_BOUNDS.minLat &&
                            latitude <= KG_BOUNDS.maxLat &&
                            longitude >= KG_BOUNDS.minLng &&
                            longitude <= KG_BOUNDS.maxLng;

                        if (inKyrgyzstan) {
                            startLocateSafely();
                        } else {
                            setShowOutsideModal(true);
                        }
                    },
                    (err) => {
                        console.warn('Geolocation error:', err);
                        startLocateSafely();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000,
                    }
                );
            }, 600);

            return () => {
                clearTimeout(timer);
                map.removeControl(locateControl);
            };
        }

        return () => {
            map.removeControl(locateControl);
        };
    }, [map, shouldLocate, t]);

    if (!showOutsideModal) return null;

    // Простая модалка поверх карты
    return (
        <div
            className={styles.modalOverlay}
            onClick={() => setShowOutsideModal(false)}
        >
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={styles.modalTitle}>
                    {tLoc('title')}
                </h3>
                <p className={styles.modalText}>
                    {tLoc('description')}
                </p>
                <button
                    type="button"
                    onClick={() => setShowOutsideModal(false)}
                    className={styles.modalButton}
                >
                    {tLoc('button')}
                </button>
            </div>
        </div>
    );
};

export default LocationControl;