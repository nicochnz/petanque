import { useEffect, useState } from 'react';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';

type UseMapSelectorProps = {
  onSelectPosition: (pos: { lat: number; lng: number; address?: string }) => void;
  focusedTerrain?: { lat: number; lng: number } | null;
};

interface NominatimAddress {
  road?: string;
  city?: string;
  postcode?: string;
  [key: string]: string | undefined;
}

interface NominatimResponse {
  address?: NominatimAddress;
}

export function useMapSelector({ onSelectPosition, focusedTerrain }: UseMapSelectorProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const createNewMarkerIcon = () => {
    return L.divIcon({
      html: '<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: 'custom-div-icon'
    });
  };

  const createTerrainIcon = () => {
    return L.divIcon({
      html: '<div style="background-color: #d97706; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: 'custom-div-icon'
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && focusedTerrain && (window as typeof window & { map?: L.Map }).map) {
      const map = (window as typeof window & { map?: L.Map }).map;
      map?.flyTo([focusedTerrain.lat, focusedTerrain.lng], 15, {
        duration: 1.5
      });
    }
  }, [focusedTerrain]);

  const MapClickHandler = () => {
    useMapEvents({
      async click(e: L.LeafletMouseEvent) {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });
        
        try {
          // Ajouter un délai pour éviter les requêtes trop rapides
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'PetanqueApp/1.0'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: NominatimResponse = await response.json();
          
          const addressParts: string[] = [];
          if (data.address) {
            if (data.address.road) {
              addressParts.push(data.address.road);
            }
            if (data.address.city) {
              addressParts.push(data.address.city);
            }
            if (data.address.postcode) {
              addressParts.push(data.address.postcode);
            }
          }
          
          const address = addressParts.join(', ');
          onSelectPosition({ lat, lng, address });
        } catch (error) {
          console.warn('Erreur géocodage:', error);
          // Continuer sans adresse en cas d'erreur
          onSelectPosition({ lat, lng });
        }
      }
    });

    return null;
  };

  return {
    marker,
    MapClickHandler,
    createNewMarkerIcon,
    createTerrainIcon,
  };
}
