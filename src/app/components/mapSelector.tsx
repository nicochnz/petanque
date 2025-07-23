'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapSelector } from '../hooks/useMapSelector';
import Image from 'next/image';
import L, { Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import React, { useEffect, useState } from 'react';

type MapSelectorProps = {
  terrains: Array<{
    name?: string;
    description?: string;
    imageUrl?: string;
    lat: number;
    lng: number;
    address?: string;
  }>;
  onSelectPosition: (pos: { lat: number; lng: number; address?: string }) => void;
  focusedTerrain?: { lat: number; lng: number } | null;
};

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = React.useRef<Map | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
          
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setIsLocating(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("L'accès à votre position a été refusé. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Votre position n'a pas pu être déterminée.");
              break;
            case error.TIMEOUT:
              setLocationError("La demande de géolocalisation a expiré.");
              break;
            default:
              setLocationError("Une erreur inconnue s'est produite lors de la géolocalisation.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  }, []);

  const createUserLocationIcon = () => {
    return L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="relative">
          <svg viewBox="0 0 24 24" class="w-6 h-6 text-amber-500">
            <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-amber-500 rounded-full"></div>
        </div>
      `,
    });
  };

  return (
    <div className="relative h-full w-full">
      {isLocating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-900 font-medium">Localisation en cours...</p>
          </div>
        </div>
      )}

      {locationError && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm z-50">
          <p className="font-medium mb-1">⚠️ Impossible d'obtenir votre position</p>
          <p>{locationError}</p>
        </div>
      )}
      
      <MapContainer
        center={userLocation || [44.8378, -0.5792]}
        zoom={userLocation ? 15 : 13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler />
        <MapReady />
        
        {/* Marqueur de position de l'utilisateur */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
          >
            <Popup>
              Votre position
            </Popup>
          </Marker>
        )}
        
        {marker && (
          <Marker position={[marker.lat, marker.lng]} icon={createNewMarkerIcon()} />
        )}
        
        {terrains.map((terrain, index) => {
          // Vérifier si les coordonnées sont valides
          if (typeof terrain.lat !== 'number' || typeof terrain.lng !== 'number' || 
              isNaN(terrain.lat) || isNaN(terrain.lng)) {
            console.warn('Coordonnées invalides pour le terrain:', terrain);
            return null;
          }
          
          return (
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
          );
        })}
      </MapContainer>

      {/* Bouton de retour à la position */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current && userLocation) {
              mapRef.current.setView(userLocation, 15);
            }
          }}
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-[1000] border border-amber-200 cursor-pointer"
          title="Retour à ma position"
        >
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6 text-amber-600"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MapSelectorComponent;