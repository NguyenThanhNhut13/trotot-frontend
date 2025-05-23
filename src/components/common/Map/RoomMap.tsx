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
  // Fix the type definition for mapRef
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Clean up previous map instance
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    // Default to Da Nang if coordinates are invalid
    const validLat = !isNaN(Number(latitude)) && latitude !== 0 ? latitude : 16.0544;
    const validLng = !isNaN(Number(longitude)) && longitude !== 0 ? longitude : 108.2022;
    
    const map = L.map(mapContainerRef.current).setView([validLat, validLng], 16);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([validLat, validLng]).addTo(map);
    marker.bindPopup(`<b>${roomTitle}</b><br>${roomAddress}`).openPopup();
    
    // Show error note if using default coordinates
    if (latitude !== validLat || longitude !== validLng) {
      const warningDiv = L.DomUtil.create('div', 'map-warning');
      warningDiv.innerHTML = '<div class="alert alert-warning py-1 px-2" style="position:absolute;top:10px;left:10px;z-index:1000;opacity:0.9;font-size:12px">Đang hiển thị vị trí gần đúng</div>';
      map.getContainer().appendChild(warningDiv);
    }
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, roomTitle, roomAddress]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '400px', width: '100%', borderRadius: '8px', position: 'relative' }}
    />
  );
};

export default RoomMap;