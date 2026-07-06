import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ALMATY_FALLBACK } from '../lib/useGeo';
import styles from './MapView.module.scss';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  variant?: 'price' | 'me' | 'specialist';
  onClick?: () => void;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const PIN_BG: Record<NonNullable<MapMarker['variant']>, string> = {
  price: '#4C6FFF',
  me: '#16A34A',
  specialist: '#141824',
};

// Пин на брендовых цветах: скруглённая пилюля + указатель. Инлайн-стили —
// divIcon рендерит сырой HTML вне scope CSS-модулей.
function pinIcon(m: MapMarker): L.DivIcon {
  const bg = PIN_BG[m.variant ?? 'price'];
  const html = `
    <div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;">
      <div style="background:${bg};color:#fff;padding:5px 10px;border-radius:999px;font:600 12px/1 -apple-system,BlinkMacSystemFont,Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 10px rgba(20,24,36,.28);">${m.label}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${bg};"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [0, 0], iconAnchor: [0, 0] });
}

/** Карта OSM (Leaflet). Маркеры-пилюли с ценой/именем; клик → onClick. */
export function MapView({ markers, center, zoom = 12, className }: MapViewProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Инициализация карты один раз.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const start = center ?? markers[0] ?? ALMATY_FALLBACK;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true }).setView(
      [start.lat, start.lng],
      zoom,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Leaflet иногда считает размер до layout — принудительный refresh.
    setTimeout(() => map.invalidateSize(), 60);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Синхронизация маркеров.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const pts: L.LatLngExpression[] = [];
    for (const m of markers) {
      const marker = L.marker([m.lat, m.lng], { icon: pinIcon(m) });
      if (m.onClick) marker.on('click', m.onClick);
      marker.addTo(layer);
      pts.push([m.lat, m.lng]);
    }

    if (center) {
      map.setView([center.lat, center.lng], zoom);
    } else if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [48, 48], maxZoom: 15 });
    } else if (pts.length === 1) {
      map.setView(pts[0], zoom);
    }
  }, [markers, center, zoom]);

  return <div ref={elRef} className={[styles.map, className].filter(Boolean).join(' ')} />;
}
