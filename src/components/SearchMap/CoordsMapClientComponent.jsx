'use client';

import pinInner from '@/assets/icons/pin-inner.svg';
import 'leaflet/dist/leaflet.css';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { MapContainer, useMapEvents } from 'react-leaflet';
import { BoundaryCanvasTileLayer } from '../Map/BoundaryCanvasTileLayer';
import LocationControl from '../Map/LocationControl';
import styles from './SearchableMapComponent.module.scss';


function toDMS(value) {
  const deg = Math.floor(Math.abs(value));
  const minFloat = (Math.abs(value) - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.floor((minFloat - min) * 60);

  const sign = value >= 0 ? '' : '-';
  return `${sign}${deg}°${String(min).padStart(2, '0')}'${String(sec).padStart(2, '0')}"`;
}

function CenterWatcher({ onCenterChange }) {
  useMapEvents({
    move: (map) => {
      const center = map.target.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    },
  });

  return null;
}

export default function SearchableMapComponent({ locale }) {
  const mapRef = useRef(null);
  const router = useRouter();
  const t = useTranslations('mapSearch');

  const [center, setCenter] = useState({ lat: 41.2, lng: 74.6 });

  const radiusMeters = 3000;

  const handleSearchHere = () => {
    const currentCenter =
      mapRef.current?.getCenter?.() || { lat: center.lat, lng: center.lng };

    const latitude = currentCenter.lat;
    const longitude = currentCenter.lng;
    const radius = radiusMeters;

    // для дебага
    // console.log('Search params:', {
    //   latitude,
    //   longitude,
    //   radius,
    // });

    const lat = latitude.toFixed(6);
    const lng = longitude.toFixed(6);

    router.push(
      `/${locale}/search-on-map/results?latitude=${lat}&longitude=${lng}&radius=${radius}`
    );
  };

  const latDms = toDMS(center.lat);
  const lngDms = toDMS(center.lng);

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        minZoom={5}
        maxZoom={18}
        maxBounds={[
          [39.0, 69.0],
          [43.5, 81.0],
        ]}
        maxBoundsViscosity={1.0}
        attributionControl={false}
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: '#d3ecfd',
          borderRadius: '16px',
        }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <BoundaryCanvasTileLayer tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CenterWatcher onCenterChange={setCenter} />
        <LocationControl />
      </MapContainer>

      {/* Центровой пин + карточка */}
      <div className={styles.centerOverlay}>
        <div className={styles.pin}>
          <div className={styles.pinInner}>
            <Image src={pinInner} alt='pin icon' width={24} height={24} />
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardText}>
            {latDms} {t('latitude')} - {lngDms} {t('longitude')}
          </p>
          <button
            type="button"
            onClick={handleSearchHere}
            className={styles.searchButton}
          >
            {t('find-here')}
          </button>
        </div>
      </div>
    </div>
  );
}