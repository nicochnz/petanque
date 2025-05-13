'use client';

import { useEffect, useState } from 'react';
import MapSelector from './components/mapSelector';

type Terrain = {
  _id?: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
};

export default function HomePage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    fetch('/api/terrains')
      .then(res => res.json())
      .then(data => setTerrains(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newTerrain: Terrain = {
      name: form.name,
      description: form.description,
      location: {
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      },
    };
  
    const res = await fetch('/api/terrains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTerrain),
    });
  
    const savedTerrain = await res.json();
  
    setTerrains((prev) => [...prev, savedTerrain]);
  
    setForm({ name: '', description: '', lat: '', lng: '' });
    setShowForm(false);
  };

  const handleMapClick = (pos: { lat: number, lng: number }) => {
    setForm({ ...form, lat: pos.lat.toString(), lng: pos.lng.toString() });
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Terrains de Pétanque
        </h1>

        <div className="h-[600px] mb-8 rounded-xl overflow-hidden shadow-lg relative">
          <MapSelector
            terrains={terrains.map(t => ({
              ...t.location,
              name: t.name,
              description: t.description
            }))}
            onSelectPosition={handleMapClick}
          />
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-black">Ajouter un terrain</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nom du terrain"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 text-black"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 text-black"
                />
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Ajouter
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terrains.map(terrain => (
            <div key={terrain._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2 text-black">{terrain.name}</h2>
              <p className=" mb-4 text-black">{terrain.description}</p>
              <p className="text-sm text-gray-500">📍 {terrain.location.lat}, {terrain.location.lng}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
