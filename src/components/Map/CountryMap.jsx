'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './CountryMap.scss';
import { BoundaryCanvasTileLayer } from './BoundaryCanvasTileLayer';
import { Link } from '@/i18n/navigation';

export default function CountryMap() {
    const [places, setPlaces] = useState([]);
    const mapRef = useRef();

    const markerIcon = L.divIcon({
        html: `<div>1</div>`,
        className: 'custom-marker-icon',
        iconSize: [32, 32],
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            const query = `
                [out:json][timeout:25];
                relation["ISO3166-1"="KG"];
                map_to_area->.searchArea;
                (
                node["natural"="peak"](area.searchArea);
                );
                out body 10;
            `;
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.elements) {
                const features = data.elements.filter((el) => el.lat && el.lon);
                setPlaces(features);
            } else {
                console.error("Ошибка получения данных", data);
            }
        };

        // const fetchById = async (id) => {
        //     const query = `
        //         [out:json][timeout:25];
        //         node(${id});
        //         out body;
        //     `;
        //     try {
        //         const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        //         const data = await response.json();
    
        //         if (data.elements && data.elements.length > 0) {
        //             const geoJSON = osmtogeojson(data); // Преобразуем в GeoJSON
        //             console.log("GeoJSON элемента:", geoJSON);
        //             return geoJSON; // Возвращаем GeoJSON для дальнейшего использования
        //         } else {
        //             console.error("Элемент с указанным ID не найден");
        //         }
        //     } catch (error) {
        //         console.error("Ошибка загрузки элемента по ID:", error);
        //     }
        // };

        fetchInitialData();
        // fetchById(274275911)
    }, []);


    const clusterIconCreateFunction = (cluster) => {
        const count = cluster.getChildCount(); // Количество маркеров в кластере

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

                <MarkerClusterGroup
                    spiderfyOnMaxZoom={false}
                    showCoverageOnHover={true}
                    zoomToBoundsOnClick={false}
                    maxClusterRadius={50}
                    iconCreateFunction={clusterIconCreateFunction} 
                >
                    {places.map((place, index) => (
                        <Marker
                            key={index}
                            position={[place.lat, place.lon]}
                            icon={markerIcon}
                        >
                            <Popup>
                                {place.tags?.name || 'Неизвестное место'}<br />
                                Тип: {place.tags?.natural ? 'Гора' : 'Неизвестно'}
                                <br/>
                                <Link href={`/toponym/${place.id}`}>Подробнее</Link>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
}