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
    loading: () => <div className="h-full w-full flex items-center justify-center text-primary">Chargement de la carte...</div>
  }
);

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    terrains, 
    allTerrains,
    displayedTerrains,
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
    loadMoreTerrains,
    hasMoreTerrains,
  } = useHomePage();

  const [focusedTerrain, setFocusedTerrain] = useState<{ lat: number; lng: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const isGuest = session?.user && 'role' in session.user ? session.user.role === 'guest' : false;

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
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-xl text-primary">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-xl text-primary">Redirection...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light">
      <div className="bg-primary text-light px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-light">
            <Image
              src={session?.user?.image || '/default-avatar.jpg'}
              alt="Photo de profil"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm hidden sm:block">
            {session?.user?.name || 'Invité'}
            {isGuest && <span className="text-light/80 ml-2">(Mode consultation)</span>}
          </span>
        </div>
        
        <div className="text-center flex-1 sm:flex-none">
          <h1 className="text-lg font-serif font-bold sm:hidden">LE PÉTANQUE CLUB</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!isGuest && (
            <button
              onClick={() => router.push('/profile')}
              className="bg-primary-light hover:bg-primary-dark px-3 py-1 rounded text-sm transition-colors cursor-pointer hidden sm:block"
            >
              Mon Profil
            </button>
          )}
          <button
            onClick={() => signOut()}
            className="bg-primary-light hover:bg-primary-dark px-3 py-1 rounded text-sm transition-colors cursor-pointer hidden sm:block"
          >
            Se déconnecter
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="bg-primary border-t border-primary-light sm:hidden">
          <div className="px-4 py-3 space-y-3">
            {!isGuest && (
              <button
                onClick={() => {
                  router.push('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-light hover:text-light/80 transition-colors"
              >
                Mon Profil
              </button>
            )}
            <button
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-light hover:text-light/80 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <header className="bg-primary text-light">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 px-4 py-8">
            <div className="lg:w-2/5 w-full">
              <div className="relative h-80 sm:h-96 lg:h-[500px] w-full overflow-hidden">
                <Image
                  src="/ball_player.svg"
                  alt="Joueur de pétanque"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6">
                Bienvenue sur le <span className="uppercase">PÉTANQUE CLUB</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 italic text-light/90">
                &ldquo;Tu tires ou tu pointes ?&rdquo;
              </p>
              <p className="text-base sm:text-lg text-light/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                L&apos;application collaborative de la pétanque ! Découvrez et partagez les meilleurs terrains de pétanque près de chez vous. <span className="font-bold">Créez un compte</span> pour ajouter de nouveaux terrains.
              </p>
              
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="text-center lg:text-left">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary block">{allTerrains.length}</span>
                  <span className="text-base sm:text-lg text-light/90">Terrains référencés</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => {
                    const mapSection = document.querySelector('[data-map-section]');
                    if (mapSection) {
                      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Trouver un terrain
                </button>
                <button className="btn-outline-light w-full sm:w-auto">
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-light py-12 sm:py-16" data-map-section>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-4 uppercase">
              La carte interactive.
            </h2>
            <div className="space-y-2 text-primary">
              <p className="text-base sm:text-lg">Explorez les terrains existants, ajoutez les vôtres.</p>
              {isGuest && (
                <p className="text-sm sm:text-base">
                  <span className="font-bold">MODE CONSULTATION :</span> Vous pouvez explorer les terrains mais pas en ajouter de nouveaux ni mettre de note.
                </p>
              )}
              <p className="text-sm sm:text-base">Connectez-vous avec Google pour contribuer à la communauté !</p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-light-dark">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">Carte interactive</h3>
                <p className="text-dark/70 text-sm sm:text-base">
                  {isGuest 
                    ? "Explorez les terrains existants" 
                    : "Cliquez sur la carte pour ajouter un nouveau terrain"
                  }
                </p>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="btn-secondary w-full sm:w-auto"
              >
                🔍 Filtres ({terrains.length})
              </button>
            </div>
            
            <div className="h-64 sm:h-80 lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 border-light-dark">
              <MapSelectorComponent
                terrains={displayedTerrains.map(t => ({
                  ...t.location,
                  name: t.name,
                  description: t.description,
                  imageUrl: t.imageUrl
                }))}
                onSelectPosition={handleMapClickWithPermission}
                focusedTerrain={focusedTerrain}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-8 sm:mb-12 text-center uppercase">
            Tous les terrains.
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedTerrains.map(terrain => (
              <article 
                key={terrain._id} 
                className="bg-primary rounded-2xl shadow-lg border border-primary-dark group cursor-pointer hover:-translate-y-1 transition-transform duration-300 overflow-hidden"
                onClick={() => handleTerrainClick(terrain)}
              >
                {terrain.imageUrl && (
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image 
                      src={terrain.imageUrl} 
                      alt={terrain.name} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-light group-hover:text-secondary transition-colors">
                    {terrain.name}
                  </h3>
                  <p className="mb-3 sm:mb-4 text-light/90 leading-relaxed text-sm sm:text-base">{terrain.description}</p>
                  
                  <div className="mb-3 sm:mb-4" onClick={(e) => e.stopPropagation()}>
                    <StarRating
                      rating={terrain.rating?.average || 0}
                      count={terrain.rating?.count || 0}
                      onRate={isGuest ? undefined : (rating) => handleRating(terrain._id!, rating)}
                      size="sm"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMoreTerrains && (
            <div className="mt-8 sm:mt-12 text-center">
              <button
                onClick={loadMoreTerrains}
                className="btn-secondary inline-flex items-center w-full sm:w-auto"
              >
                <span>Voir plus de terrains</span>
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {showForm && !isGuest && (
        <aside className="fixed inset-0 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-light-dark max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-primary">Nouveau terrain</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">Nom du terrain</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Ex: Terrain de la place du village"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input-primary"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-dark mb-2">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez le terrain (état, équipements, etc.)"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="input-primary resize-none"
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-dark mb-2">Photo (optionnelle)</label>
                <input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="input-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-light file:text-primary hover:file:bg-light-dark cursor-pointer"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit" 
                  className="btn-secondary flex-1"
                >
                  Ajouter le terrain
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn-outline-primary flex-1"
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

      <footer className="bg-primary text-light mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 uppercase">TERRAINS DE PÉTANQUE</h3>
              <p className="text-light/90 leading-relaxed">
                La communauté collaborative pour découvrir et partager les meilleurs terrains de pétanque.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 uppercase">À PROPOS</h4>
              <ul className="space-y-2 text-light/90">
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Qui sommes-nous ?
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Contact
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary">★</span>
                  Mentions légales
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-light mt-8 pt-8 text-center text-light/70">
            <p>&copy; 2025 Terrains de Pétanque - Fait avec ❤️ pour la communauté</p>
          </div>
        </div>
      </footer>
    </main>
  );
}