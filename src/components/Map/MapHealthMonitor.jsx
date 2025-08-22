'use client';

import { useEffect, useState } from 'react';

export function MapHealthMonitor({ onMapError }) {
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [healthCheckInterval, setHealthCheckInterval] = useState(null);

    useEffect(() => {
        const checkMapHealth = () => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivity;
            
            if (timeSinceLastActivity > 30000) {
                console.warn('Map appears to be frozen, triggering recovery');
                onMapError?.(new Error('Map health check failed - no activity detected'));
            }
        };

        const interval = setInterval(checkMapHealth, 10000);
        setHealthCheckInterval(interval);

        const handleMapActivity = () => {
            setLastActivity(Date.now());
        };

        document.addEventListener('leaflet-map-activity', handleMapActivity);
        document.addEventListener('mousemove', handleMapActivity);
        document.addEventListener('click', handleMapActivity);

        return () => {
            if (interval) {
                clearInterval(interval);
            }
            document.removeEventListener('leaflet-map-activity', handleMapActivity);
            document.removeEventListener('mousemove', handleMapActivity);
            document.removeEventListener('click', handleMapActivity);
        };
    }, [lastActivity, onMapError]);

    return null; // Этот компонент не рендерит UI
}

export default MapHealthMonitor;
