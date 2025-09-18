'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapSelector } from '../hooks/useMapSelector';
import Image from 'next/image';
import L, { Map } from 'leaflet';
import { useMap } from 'react-leaflet';
import React, { useEffect, useState, useCallback } from 'react';
import TerrainComments from './terrainComments';

type MapSelectorProps = {
  terrains: Array<{
    _id?: string;
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
    if (typeof window !== 'undefined' && map) {
      (window as typeof window & { map?: Map }).map = map;
      
      const handleMapReady = () => {
        try {
          map.invalidateSize();
          onMapLoad();
        } catch (error) {
          console.warn('Erreur lors de l\'initialisation de la carte:', error);
          setTimeout(() => {
            try {
              map.invalidateSize();
              onMapLoad();
            } catch (retryError) {
              console.warn('Erreur lors du retry de la carte:', retryError);
            }
          }, 100);
        }
      };

      if (map.whenReady) {
        map.whenReady(handleMapReady);
      } else {
        setTimeout(handleMapReady, 100);
      }
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
  const [showComments, setShowComments] = useState<string | null>(null);

  const defaultPosition: [number, number] = React.useMemo(() => [44.837789, -0.57918], []);

  const getUserLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationError(null);
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
          setLocationError(null);
          
          const map = (window as typeof window & { map?: Map }).map;
          if (map) {
            map.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.warn("Erreur de géolocalisation:", error);
          setIsLocating(false);
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
    const timer = setTimeout(() => {
      getUserLocation();
    }, 100);

    return () => clearTimeout(timer);
  }, [getUserLocation]);

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

  const initialPosition = userLocation || defaultPosition;

  return (
    <div className="relative h-full w-full">
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-primary font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}

      <MapContainer
        center={initialPosition}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={false}
        style={{ background: '#f8f9fa' }}
      >
        <MapReady onMapLoad={handleMapLoad} />
        
        {isMapLoaded && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
              minZoom={10}
              maxNativeZoom={18}
              updateWhenZooming={false}
              updateWhenIdle={true}
            />

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
                      <p className="text-xs text-gray-500 mb-2">📍 {terrain.address}</p>
                    )}
                    <button
                      onClick={() => setShowComments(terrain._id || `${terrain.lat}--${terrain.lng}`)}
                      className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark cursor-pointer"
                    >
                      💬 Commentaires
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

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

            <MapClickHandler />
          </>
        )}
      </MapContainer>

      <button
        onClick={getUserLocation}
        className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-xl hover:bg-gray-50 transition-all duration-200 z-[9999] border border-gray-200 cursor-pointer"
        title="Retour à ma position"
        aria-label="Retourner à ma position actuelle"
        style={{ zIndex: 9999 }}
      >
        {isLocating ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        ) : (
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {locationError && (
        <div className="absolute bottom-4 left-4 right-20 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg text-sm z-[9999]" style={{ zIndex: 9999 }}>
          {locationError}
        </div>
      )}

      {showComments && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Commentaires</h3>
              <button
                onClick={() => setShowComments(null)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <TerrainComments 
              terrainId={showComments} 
              terrainName={terrains.find(t => (t._id || `${t.lat}-${t.lng}`) === showComments)?.name || 'Terrain'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelectorComponent;