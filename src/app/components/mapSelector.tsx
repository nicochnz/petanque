'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapSelector } from '../hooks/useMapSelector';

type MapSelectorProps = {
  terrains: Array<{
    lat: number;
    lng: number;
    name?: string;
    description?: string;
  }>;
  onSelectPosition: (pos: { lat: number; lng: number; address?: string }) => void;
};

const MapSelector = ({ terrains, onSelectPosition }: MapSelectorProps) => {
  const { marker, MapClickHandler, createNewMarkerIcon, createTerrainIcon } = 
    useMapSelector({ terrains, onSelectPosition });

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
