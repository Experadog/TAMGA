'use client';

import L from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const FullScreenControl = () => {
    const t = useTranslations('map');
    const map = useMap();

    useEffect(() => {
        if (map) {
            const fullscreenControl = new L.Control.Fullscreen({
                title: {
                    'false': t('fullscreen-on'),
                    'true': t('fullscreen-off')
                },
                position: 'topright',
            });

            map.addControl(fullscreenControl);

            return () => {
                if (map.hasLayer && fullscreenControl) {
                    map.removeControl(fullscreenControl);
                }
            };
        }
    }, [map]);

    return null;
};

export default FullScreenControl;
