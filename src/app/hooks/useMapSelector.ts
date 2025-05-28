import { useEffect, useState } from 'react';
import L from 'leaflet';

type UseMapSelectorProps = {
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

export function useMapSelector({ terrains, onSelectPosition, focusedTerrain }: UseMapSelectorProps) {
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
    if (focusedTerrain && (window as any).map) {
      const map = (window as any).map;
      map.flyTo([focusedTerrain.lat, focusedTerrain.lng], 15, {
        duration: 1.5
      });
    }
  }, [focusedTerrain]);

  const MapClickHandler = () => {
    useEffect(() => {
      const map = (window as any).map;
      if (!map) return;

      const handleClick = async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || '';
          
          onSelectPosition({ lat, lng, address });
        } catch (error) {
          console.error('Erreur géocodage:', error);
          onSelectPosition({ lat, lng });
        }
      };

      map.on('click', handleClick);

      return () => {
        map.off('click', handleClick);
      };
    }, []);

    return null;
  };

  return {
    marker,
    MapClickHandler,
    createNewMarkerIcon,
    createTerrainIcon,
  };
}
