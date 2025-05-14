import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

type Position = {
  lat: number;
  lng: number;
  address?: string;
};

type UseMapSelectorProps = {
  onSelectPosition: (pos: Position) => void;
  terrains: Array<{
    lat: number;
    lng: number;
    name?: string;
    description?: string;
  }>;
};

export const useMapSelector = ({ onSelectPosition, terrains }: UseMapSelectorProps) => {
  const [marker, setMarker] = useState<Position | null>(null);

  const createNewMarkerIcon = () => {
    return L.divIcon({
      html: '📌',
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const createTerrainIcon = () => {
    return L.divIcon({
      html: '<div style="font-size: 18px;">📍</div>',
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const MapClickHandler = () => {
    useMapEvents({
      async click(e: { latlng: { lat: number; lng: number } }) {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
          );
          const data = await response.json();
          const address = data.display_name || "Adresse inconnue";
          
          onSelectPosition({ lat, lng, address });
        } catch (error) {
          console.error("Erreur lors de la récupération de l'adresse:", error);
          onSelectPosition({ lat, lng });
        }
      },
    });
    return null;
  };

  return {
    marker,
    MapClickHandler,
    createNewMarkerIcon,
    createTerrainIcon,
    terrains
  };
};
