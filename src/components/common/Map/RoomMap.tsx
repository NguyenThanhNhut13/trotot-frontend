import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RoomMapProps {
  latitude: number;
  longitude: number;
  roomTitle?: string;
  roomAddress?: string;
  onPositionChange?: (coords: { lat: number; lng: number }) => void;
}

const RoomMap: React.FC<RoomMapProps> = ({
  latitude,
  longitude,
  roomTitle = 'Phòng trọ',
  roomAddress = '',
  onPositionChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 16);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${roomTitle}</b><br>${roomAddress}`).openPopup();
  }, [latitude, longitude]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    />
  );
};

export default RoomMap;
