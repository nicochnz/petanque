'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

type MapSelectorProps = {
  terrains: Array<{
    lat: number;
    lng: number;
    name?: string;
    description?: string;
  }>;
  onSelectPosition: (pos: { lat: number; lng: number }) => void;
};

const MapSelector = ({ terrains, onSelectPosition }: MapSelectorProps) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const createNewMarkerIcon = () => {
    return L.divIcon({
      html: '📌',
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  const createTerrainIcon = () => {
    return L.divIcon({
      html: '📍',
      className: 'custom-div-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });
        onSelectPosition({ lat, lng });
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[44.8378, -0.5792]} 
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      
      {marker && (
        <Marker position={[marker.lat, marker.lng]} icon={createNewMarkerIcon()} />
      )}
      
      {terrains.map((terrain, index) => (
        <Marker
          key={index}
          position={[terrain.lat, terrain.lng]}
          icon={createTerrainIcon()}
        >
          {(terrain.name || terrain.description) && (
            <Popup>
              {terrain.name && <h3 className="font-bold">{terrain.name}</h3>}
              {terrain.description && <p>{terrain.description}</p>}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapSelector;
