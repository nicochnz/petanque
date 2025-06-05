'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const MapSelector = dynamic(() => import('./mapSelector'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  )
});

type MapSelectorWrapperProps = ComponentProps<typeof MapSelector>;

export default function MapSelectorWrapper(props: MapSelectorWrapperProps) {
  return <MapSelector {...props} />;
} 