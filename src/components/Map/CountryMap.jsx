'use client';

import * as L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { Link } from '@/i18n/navigation';
import 'leaflet/dist/leaflet.css';
import './CountryMap.scss';
import { getLocalizedValue, stripHtmlTags } from '@/lib/utils';

export default function CountryMap({ locale }) {
    const [toponyms, setToponyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef();

    const markerIcon = L.divIcon({
        html: `<div style="
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            width: 20px; 
            height: 20px;
            border: 2px solid white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        ">1</div>`,
        className: 'custom-marker-icon',
        iconSize: [24, 24],
    });

    useEffect(() => {
        const fetchToponyms = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/toponyms');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                setToponyms(data);
            } catch (err) {
                console.error('Ошибка получения топонимов:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchToponyms();
    }, []);


    const clusterIconCreateFunction = (cluster) => {
        const count = cluster.getChildCount();
        
        let color = "#00c274";
        if (count > 10 && count < 100) {
            color = "yellow";
        } else if (count >= 100) {
            color = "red";
        }

        return L.divIcon({
            html: `
                <div style="
                    background-color: ${color};
                    color: white;
                    border-radius: 50%;
                    text-align: center;
                    line-height: 30px;
                    width: 30px; 
                    height: 30px;
                    border: 2px solid white;">
                    ${count}
                </div>
            `,
            className: 'custom-cluster-marker',
            iconSize: [35, 35],
        });
    };

    return (
        <div className='country-map'>
            <MapContainer
                center={[41.2, 74.6]}
                zoom={6}
                maxZoom={18}
                style={{ height: '100vh', width: '100%' }}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                <BoundaryCanvasTileLayer
                    tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: '70px',
                        left: '20px',
                        background: 'white',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        Загрузка топонимов...
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'absolute',
                        top: '70px',
                        left: '20px',
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}>
                        Ошибка: {error}
                    </div>
                )}

                <MarkerClusterGroup
                    spiderfyOnMaxZoom={false}
                    showCoverageOnHover={true}
                    zoomToBoundsOnClick={false}
                    maxClusterRadius={50}
                    iconCreateFunction={clusterIconCreateFunction}
                >
                    {toponyms.map((toponym) => (
                        <Marker
                            key={toponym.id}
                            position={[toponym.latitude, toponym.longitude]}
                            icon={markerIcon}
                        >
                            <Popup className="custom-popup">
                                <strong className='popup-title'>{getLocalizedValue(toponym, 'name', locale)}</strong>

                                {toponym.region.length > 0 && (
                                    <div className='popup-region'>{getLocalizedValue(toponym.region[0], 'name', locale)}</div>
                                )}

                                <div className='popup-description'>
                                    {stripHtmlTags(getLocalizedValue(toponym, 'description', locale)).length > 100
                                        ? `${stripHtmlTags(getLocalizedValue(toponym, 'description', locale)).substring(0, 100)}...`
                                        : stripHtmlTags(getLocalizedValue(toponym, 'description', locale))
                                    }
                                </div>

                                <div className='popup-actions'>
                                    {toponym.matching_toponyms_count > 0 && (
                                        <span className='popup-matching'>{toponym.matching_toponyms_count} совпадений</span>
                                    )}
                                    {toponym.slug && (
                                        <Link href={toponym.slug} className='popup-link'>
                                            <span>Подробнее</span>
                                            <svg width="19" height="10" viewBox="0 0 19 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.175 6.00011H1C0.716667 6.00011 0.479167 5.90428 0.2875 5.71261C0.0958333 5.52094 0 5.28344 0 5.00011C0 4.71678 0.0958333 4.47928 0.2875 4.28761C0.479167 4.09594 0.716667 4.00011 1 4.00011H15.175L13.8 2.60011C13.6 2.40011 13.5042 2.16678 13.5125 1.90011C13.5208 1.63344 13.625 1.40011 13.825 1.20011C14.025 1.01678 14.2625 0.920943 14.5375 0.912609C14.8125 0.904276 15.0417 1.00011 15.225 1.20011L18.3 4.30011C18.5 4.50011 18.6 4.73344 18.6 5.00011C18.6 5.26678 18.5 5.50011 18.3 5.70011L15.2 8.80011C15.0167 8.98344 14.7875 9.07511 14.5125 9.07511C14.2375 9.07511 14 8.98344 13.8 8.80011C13.6 8.60011 13.5 8.36261 13.5 8.08761C13.5 7.81261 13.6 7.57511 13.8 7.37511L15.175 6.00011Z" fill="#0094EB" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}