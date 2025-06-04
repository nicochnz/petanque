'use client';

import { useHomePage } from './hooks/useHomePage';
import dynamic from 'next/dynamic';
import StarRating from './components/starRating';
import FilterPanel from './components/filterPanel';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const MapSelectorComponent = dynamic(
  () => import('./components/mapSelector'),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center">Chargement de la carte...</div>
  }
);

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    terrains, 
    allTerrains,
    showForm, 
    showFilters,
    filters,
    form,
    setShowForm, 
    setShowFilters,
    setFilters,
    handleChange, 
    handleSubmit, 
    handleMapClick,
    handleRating,
    getUserLocation,
  } = useHomePage();

  const [focusedTerrain, setFocusedTerrain] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const isGuest = session?.user?.role === 'guest';

  const handleTerrainClick = (terrain: { location: { lat: number; lng: number } }) => {
    setFocusedTerrain({
      lat: terrain.location.lat,
      lng: terrain.location.lng
    });
    
    const mapSection = document.querySelector('[data-map-section]');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMapClickWithPermission = (pos: { lat: number; lng: number; address?: string }) => {
    if (!isGuest) {
      handleMapClick(pos);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-xl text-amber-900">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-xl text-amber-900">Redirection...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="bg-amber-900 text-white px-4 py-2 flex justify-between items-center">
        <span className="text-sm">
          Connecté en tant que: {session?.user?.name || 'Invité'}
          {isGuest && <span className="text-amber-200 ml-2">(Mode consultation)</span>}
        </span>
        <button
          onClick={() => signOut()}
          className="bg-amber-800 hover:bg-amber-700 px-3 py-1 rounded text-sm transition-colors cursor-pointer"
        >
          Se déconnecter
        </button>
      </div>

      <header className="relative h-96 overflow-hidden">
        <Image
          src="/pastis-pattern.png"
          alt="Terrain de pétanque"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/70 via-orange-800/60 to-amber-900/70"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4">
              Terrains de Pétanque
            </h1>
            <p className="text-xl sm:text-2xl mb-4 italic text-amber-100">
              &quot;Tu tires ou tu pointes ?&quot;
            </p>
            <p className="text-lg text-amber-50 max-w-2xl mx-auto leading-relaxed">
              L&apos;application collaborative de la pétanque ! 
              Découvrez et partagez les meilleurs terrains de pétanque près de chez vous.
            </p>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center border border-amber-200 shadow-lg">
            <div className="text-4xl font-bold text-amber-700 mb-3">{allTerrains.length}</div>
            <div className="text-gray-700 text-lg">Terrains référencés</div>
          </div>
        </div>
      </section>

      {isGuest && (
        <section className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 text-center">
            <p className="text-yellow-800">
              <span className="font-semibold">Mode consultation :</span> Vous pouvez explorer les terrains mais pas en ajouter de nouveaux ni mettre de note. 
              Connectez-vous avec Google pour contribuer à la communauté !
            </p>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-8" data-map-section>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Carte interactive</h2>
              <p className="text-gray-600">
                {isGuest 
                  ? "Explorez les terrains existants" 
                  : "Cliquez sur la carte pour ajouter un nouveau terrain"
                }
              </p>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              🔍 Filtrer ({terrains.length})
            </button>
          </div>
          
          <div className="h-[500px] rounded-2xl overflow-hidden shadow-xl border-2 border-amber-100">
            <MapSelectorComponent
              terrains={terrains.map(t => ({
                ...t.location,
                name: t.name,
                description: t.description,
                imageUrl: t.imageUrl,
              }))}
              onSelectPosition={handleMapClickWithPermission}
              focusedTerrain={focusedTerrain}
            />
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center">
            {terrains.length === allTerrains.length 
              ? 'Tous les terrains' 
              : `${terrains.length} terrain${terrains.length > 1 ? 's' : ''} trouvé${terrains.length > 1 ? 's' : ''}`
            }
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {terrains.map(terrain => (
              <article 
                key={terrain._id} 
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => handleTerrainClick(terrain)}
              >
                {terrain.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={terrain.imageUrl} 
                      alt={terrain.name} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-amber-900 group-hover:text-orange-600 transition-colors">
                    {terrain.name}
                  </h3>
                  <p className="mb-4 text-gray-600 leading-relaxed">{terrain.description}</p>
                  
                  <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                    <StarRating
                      rating={terrain.rating?.average || 0}
                      count={terrain.rating?.count || 0}
                      onRate={isGuest ? undefined : (rating) => handleRating(terrain._id!, rating)}
                      size="sm"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-amber-700 font-medium">
                      <span className="mr-2">📍</span>
                      {terrain.location.address || `${terrain.location.lat}, ${terrain.location.lng}`}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {showForm && !isGuest && (
        <aside className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-amber-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-amber-900">Nouveau terrain</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nom du terrain</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Ex: Terrain de la place du village"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-black"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez le terrain (état, équipements, etc.)"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none text-black"
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Photo (optionnelle)</label>
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  Ajouter le terrain
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </aside>
      )}

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onGetLocation={getUserLocation}
          onClose={() => setShowFilters(false)}
          totalResults={terrains.length}
        />
      )}

      <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Terrains de Pétanque</h3>
              <p className="text-amber-100 leading-relaxed">
                La communauté collaborative pour découvrir et partager les meilleurs terrains de pétanque.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Participez</h4>
              <ul className="space-y-2 text-amber-100">
                <li>🎯 Ajoutez vos terrains favoris</li>
                <li>📸 Partagez vos photos</li>
                <li>🌟 Découvrez de nouveaux spots</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-200">
            <p>&copy; 2025 Terrains de Pétanque - Fait avec ❤️ pour la communauté</p>
          </div>
        </div>
      </footer>
    </main>
  );
}