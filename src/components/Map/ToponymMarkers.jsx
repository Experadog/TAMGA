import { Link } from '@/i18n/navigation';
import { getLocalizedValue } from '@/lib/utils';
import * as L from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import 'react-leaflet-markercluster/styles';
import clss from './ToponymMarkers.module.scss';

export default function ToponymMarkers({ toponyms = [], locale }) {
    const map = useMap();
    // Проверяем что toponyms является массивом
    const toponymsArray = Array.isArray(toponyms) ? toponyms : [];

    const clusterStyleIcon = L.divIcon({
        html: '<div><span>1</span></div>',
        className: 'marker-cluster marker-cluster-small',
        iconSize: L.point(40, 40),
    });

    const TOP_PADDING = 400;
    const panWithTopPadding = (latlng) => {
        if (!map) return;
        map.panInside(latlng, {
            paddingTopLeft: [0, TOP_PADDING],
            paddingBottomRight: [0, 20],
            animate: true,
        });
    };

    const focusPoint = (latlng) => {
        if (!map) return;
        const targetZoom = Math.max(map.getZoom(), 10);
        if (map.getZoom() < targetZoom) {
            map.once('zoomend', () => panWithTopPadding(latlng));
            map.setView(latlng, targetZoom, { animate: true });
        } else {
            panWithTopPadding(latlng);
        }
    };

    return (
        <MarkerClusterGroup
            polygonOptions={{
                color: '#0094EB',
            }}
        >
            {toponymsArray.map((toponym) => {
                const latlng = L.latLng(toponym.latitude, toponym.longitude);
                return (
                    <Marker
                        key={toponym.id}
                        position={[toponym.latitude, toponym.longitude]}
                        icon={clusterStyleIcon}
                        eventHandlers={{
                            click: () => focusPoint(latlng),
                            // если попап открывается иным способом (через кластер), всё равно подвинем
                            popupopen: () => panWithTopPadding(latlng),
                        }}
                    >
                        <Popup className={clss.customPopup} autoPan={false}>
                            <strong className={clss.popupTitle}>{getLocalizedValue(toponym, 'name', locale)}</strong>

                            {toponym?.region?.length > 0 && (
                                <div className={clss.popupRegion}>{getLocalizedValue(toponym.region[0], 'name', locale)}</div>
                            )}

                            {toponym?.terms_topomyns && (
                                <div className={clss.popupRegion}>{getLocalizedValue(toponym?.terms_topomyns, 'name', locale)}</div>
                            )}

                            {/* <div className={clss.popupDescription}>
                                {stripHtmlTags(getLocalizedValue(toponym, 'description', locale)).length > 100
                                    ? `${stripHtmlTags(getLocalizedValue(toponym, 'description', locale)).substring(0, 100)}...`
                                    : stripHtmlTags(getLocalizedValue(toponym, 'description', locale))
                                }
                            </div> */}

                            <div className={clss.popupActions}>
                                {toponym.matching_toponyms_count > 0 && (
                                    <span className={clss.popupMatching}>{toponym.matching_toponyms_count} совпадений</span>
                                )}
                                {toponym.slug && (
                                    <Link href={`/${toponym.slug}`} className={clss.popupLink}>
                                        <span>Подробнее</span>
                                        <svg width="19" height="10" viewBox="0 0 19 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15.175 6.00011H1C0.716667 6.00011 0.479167 5.90428 0.2875 5.71261C0.0958333 5.52094 0 5.28344 0 5.00011C0 4.71678 0.0958333 4.47928 0.2875 4.28761C0.479167 4.09594 0.716667 4.00011 1 4.00011H15.175L13.8 2.60011C13.6 2.40011 13.5042 2.16678 13.5125 1.90011C13.5208 1.63344 13.625 1.40011 13.825 1.20011C14.025 1.01678 14.2625 0.920943 14.5375 0.912609C14.8125 0.904276 15.0417 1.00011 15.225 1.20011L18.3 4.30011C18.5 4.50011 18.6 4.73344 18.6 5.00011C18.6 5.26678 18.5 5.50011 18.3 5.70011L15.2 8.80011C15.0167 8.98344 14.7875 9.07511 14.5125 9.07511C14.2375 9.07511 14 8.98344 13.8 8.80011C13.6 8.60011 13.5 8.36261 13.5 8.08761C13.5 7.81261 13.6 7.57511 13.8 7.37511L15.175 6.00011Z" fill="#0094EB" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </Popup>
                    </Marker>)
            })}
        </MarkerClusterGroup>
    );
}
