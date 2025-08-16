'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';

const FullScreenControl = () => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            const fullscreenControl = new L.Control.Fullscreen({
                title: {
                    'false': 'Включить полноэкранный режим',
                    'true': 'Выйти из полноэкранного режима'
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
