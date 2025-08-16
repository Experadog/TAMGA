'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { LocateControl } from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css';

const LocationControl = () => {
    const map = useMap();

    useEffect(() => {
        if (map) {
            const locateControl = new LocateControl({
                position: 'topleft',
                strings: {
                    title: 'Показать мое местоположение'
                },
                locateOptions: {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
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
                    radius: 16
                }
            });

            map.addControl(locateControl);

            return () => {
                if (map && locateControl) {
                    map.removeControl(locateControl);
                }
            };
        }
    }, [map]);

    return null;
};

export default LocationControl;