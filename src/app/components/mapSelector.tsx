'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapSelector } from '../hooks/useMapSelector';
import Image from 'next/image';
import L, { Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import React, { useEffect, useState, useCallback } from 'react';

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

const MapReady = ({ onMapLoad }: { onMapLoad: () => void }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as typeof window & { map?: Map }).map = map;
      
      // S'assurer que la carte est interactive
      map.whenReady(() => {
        map.invalidateSize();
        onMapLoad();
      });
    }
  }, [map, onMapLoad]);
  
  return null;
};

const MapSelectorComponent = ({ terrains, onSelectPosition, focusedTerrain }: MapSelectorProps) => {
  const { marker, MapClickHandler, createNewMarkerIcon, createTerrainIcon } = 
    useMapSelector({ onSelectPosition, focusedTerrain });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Position par défaut (Bordeaux)
  const defaultPosition: [number, number] = React.useMemo(() => [44.837789, -0.57918], []);

  // Optimisation de la géolocalisation avec useCallback
  const getUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationError(null);
      
      const options = {
        enableHighAccuracy: true, // Réactivé pour une meilleure précision
        timeout: 10000, // Augmenté à 10 secondes
        maximumAge: 600000 // 10 minutes de cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
          setLocationError(null);
          
          // Utiliser la référence de carte correcte
          const map = (window as typeof window & { map?: Map }).map;
          if (map) {
            map.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.warn("Erreur de géolocalisation:", error);
          setIsLocating(false);
          // En cas d'erreur, on utilise la position par défaut
          setUserLocation(defaultPosition);
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Géolocalisation refusée - Utilisation de Bordeaux par défaut");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Position non disponible - Utilisation de Bordeaux par défaut");
              break;
            case error.TIMEOUT:
              setLocationError("Géolocalisation expirée - Utilisation de Bordeaux par défaut");
              break;
            default:
              setLocationError("Erreur de géolocalisation - Utilisation de Bordeaux par défaut");
          }
        },
        options
      );
    } else {
      setLocationError("Géolocalisation non supportée - Utilisation de Bordeaux par défaut");
      setUserLocation(defaultPosition);
    }
  }, [defaultPosition]);

  useEffect(() => {
    // Délai pour permettre au composant de se monter
    const timer = setTimeout(() => {
      getUserLocation();
    }, 100);

    return () => clearTimeout(timer);
  }, [getUserLocation]);

  // Gestionnaire de chargement de la carte
  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
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

  // Position initiale de la carte
  const initialPosition = userLocation || defaultPosition;

  return (
    <div className="relative h-full w-full">
      {/* Indicateur de chargement */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}

      {/* Carte Leaflet optimisée */}
      <MapContainer
        center={initialPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
        style={{ background: '#f8f9fa' }}
      >
        {/* TileLayer optimisé avec cache */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
          minZoom={10}
          maxNativeZoom={18}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />

        {/* Marqueur de position utilisateur */}
        {userLocation && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Votre position</p>
                <p className="text-sm text-gray-600">Cliquez sur la carte pour ajouter un terrain</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des terrains existants */}
        {terrains.map((terrain, index) => (
          <Marker
            key={`${terrain.lat}-${terrain.lng}-${index}`}
            position={[terrain.lat, terrain.lng]}
            icon={createTerrainIcon()}
          >
            <Popup>
              <div className="text-center min-w-[200px]">
                {terrain.imageUrl && (
                  <div className="relative w-full h-24 mb-2 rounded overflow-hidden">
                    <Image
                      src={terrain.imageUrl}
                      alt={terrain.name || 'Terrain'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-lg mb-1">{terrain.name || 'Terrain'}</h3>
                <p className="text-sm text-gray-600 mb-2">{terrain.description || 'Aucune description'}</p>
                {terrain.address && (
                  <p className="text-xs text-gray-500">📍 {terrain.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueur temporaire pour nouveau terrain */}
        {marker && (
          <Marker
            position={[marker.lat, marker.lng]}
            icon={createNewMarkerIcon()}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">Nouveau terrain</p>
                <p className="text-sm text-gray-600">Cliquez pour confirmer l&apos;emplacement</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Gestionnaire de clic sur la carte */}
        <MapClickHandler />

        {/* Composant pour initialiser la carte */}
        <MapReady onMapLoad={handleMapLoad} />
      </MapContainer>

      {/* Bouton de géolocalisation */}
      <button
        onClick={getUserLocation}
        className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors z-20"
        title="Ma position"
      >
        {isLocating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        ) : (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Messages d'erreur */}
      {locationError && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg text-sm z-20">
          {locationError}
        </div>
      )}
    </div>
  );
};

export default MapSelectorComponent;