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
    address?: string;
  };
};

export default function HomePage() {
  const [terrains, setTerrains] = useState<Terrain[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    lat: '',
    lng: '',
    address: ''
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
        address: form.address
      },
    };
  
    const res = await fetch('/api/terrains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTerrain),
    });
  
    const savedTerrain = await res.json();
  
    setTerrains((prev) => [...prev, savedTerrain]);
  
    setForm({ name: '', description: '', lat: '', lng: '', address: '' });
    setShowForm(false);
  };

  const handleMapClick = (pos: { lat: number; lng: number; address?: string }) => {
    setForm({
      ...form,
      lat: pos.lat.toString(),
      lng: pos.lng.toString(),
      address: pos.address || '',
    });
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-[#FDF6E3]">
      <header className="relative bg-gradient-to-b from-amber-900/90 to-amber-800/90 py-12 mb-8">
        <div 
          className="absolute inset-0 opacity-60 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/pastis-pattern.png')",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-5xl font-bold text-center text-amber-100 mb-4">
            Terrains de Pétanque
          </h1>
          <p className="text-center text-amber-200 text-xl italic">
            &quot;Tu tires ou tu pointes ?&quot;
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="h-[600px] mb-8 rounded-xl overflow-hidden shadow-2xl relative">
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
          <aside className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-amber-900">Ajouter un terrain</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nom du terrain"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500 text-black"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500 text-black"
                />
                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Ajouter
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </aside>
        )}

        <article className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terrains.map(terrain => (
            <div key={terrain._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500">
              <h2 className="text-xl font-semibold mb-2 text-amber-900">{terrain.name}</h2>
              <p className="mb-4 text-gray-700">{terrain.description}</p>
              <p className="text-sm text-amber-600">
                📍 {terrain.location.address || `${terrain.location.lat}, ${terrain.location.lng}`}
              </p>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
