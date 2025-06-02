'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapSelector } from '../hooks/useMapSelector';
import Image from 'next/image';
import { Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import React from 'react';

type MapSelectorProps = {
  terrains: Array<{
    lat: number;
    lng: number;
    name?: string;
    description?: string;
    imageUrl?: string;
  }>;
  onSelectPosition: (pos: { lat: number; lng: number; address?: string }) => void;
  focusedTerrain?: { lat: number; lng: number } | null;
};

// Composant pour accéder à la map
const MapReady = () => {
  const map = useMap();
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { map?: Map }).map = map;
    }
  }, [map]);
  
  return null;
};

const MapSelectorComponent = ({ terrains, onSelectPosition, focusedTerrain }: MapSelectorProps) => {
  const { marker, MapClickHandler, createNewMarkerIcon, createTerrainIcon } = 
    useMapSelector({ onSelectPosition, focusedTerrain });

  return (
    <MapContainer
      center={[44.8378, -0.5792]} 
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      <MapReady />
      
      {marker && (
        <Marker position={[marker.lat, marker.lng]} icon={createNewMarkerIcon()} />
      )}
      
      {terrains.map((terrain, index) => (
        <Marker
          key={index}
          position={[terrain.lat, terrain.lng]}
          icon={createTerrainIcon()}
        >
          {(terrain.name || terrain.description || terrain.imageUrl) && (
            <Popup>
              {terrain.imageUrl && (
                <div style={{ width: '100%', maxWidth: 250, marginBottom: 8 }}>
                  <Image
                    src={terrain.imageUrl}
                    alt={terrain.name || 'Image du terrain'}
                    width={250}
                    height={150}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 150,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                </div>
              )}
              {terrain.name && <h3 className="font-bold">{terrain.name}</h3>}
              {terrain.description && <p>{terrain.description}</p>}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapSelectorComponent;