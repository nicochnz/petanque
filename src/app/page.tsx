'use client';

import { useHomePage } from './hooks/useHomePage';
import dynamic from 'next/dynamic';
import StarRating from './components/starRating';
import FilterPanel from './components/filterPanel';
import Image from 'next/image';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const MapSelectorComponent = dynamic(
  () => import('./components/mapSelector'),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-primary">Chargement de la carte...</div>
  }
);

export default function HomePage() {
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
    isGuest,
    isLoading,
    session
  } = useHomePage();

  const [focusedTerrain, setFocusedTerrain] = useState<{ lat: number; lng: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  if (isLoading) {
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
      <header className="bg-primary text-light px-4 py-3 flex justify-between items-center" role="banner">
        <div className="flex items-center gap-3">
          <figure className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-light">
            <Image
              src={session?.user?.image || '/default-avatar.jpg'}
              alt={`Photo de profil de ${session?.user?.name || 'l\'utilisateur'}`}
              fill
              className="object-cover"
            />
          </figure>
          <span className="text-sm hidden sm:block">
            {session?.user?.name || 'Invité'}
            {isGuest && <span className="text-light/80 ml-2">(Mode consultation)</span>}
          </span>
        </div>
        
        <div className="text-center flex-1 sm:flex-none">
          <h1 className="text-lg font-serif font-bold sm:hidden">LE PÉTANQUE CLUB</h1>
        </div>
        
        <nav className="flex items-center gap-2" role="navigation" aria-label="Navigation principale">
          {!isGuest && (
            <button
              onClick={() => router.push('/profile')}
              className="bg-primary-light hover:bg-primary-dark px-3 py-1 rounded text-sm transition-colors cursor-pointer hidden sm:block"
              aria-label="Accéder à mon profil"
            >
              Mon Profil
            </button>
          )}
          <button
            onClick={() => signOut()}
            className="bg-primary-light hover:bg-primary-dark px-3 py-1 rounded text-sm transition-colors cursor-pointer hidden sm:block"
            aria-label="Se déconnecter de l'application"
          >
            Se déconnecter
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2"
            aria-label="Ouvrir le menu mobile"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </header>

      {isMobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="bg-primary border-t border-primary-light sm:hidden"
          role="navigation"
          aria-label="Menu mobile"
        >
          <div className="px-4 py-3 space-y-3">
            {!isGuest && (
              <button
                onClick={() => {
                  router.push('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left text-light hover:text-light/80 transition-colors"
                aria-label="Accéder à mon profil"
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
              aria-label="Se déconnecter de l'application"
            >
              Se déconnecter
            </button>
          </div>
        </nav>
      )}

      <section className="bg-primary text-light" aria-labelledby="hero-title">
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 px-4 py-8">
            <figure className="lg:w-2/5 w-full">
              <div className="relative h-80 sm:h-96 lg:h-[500px] w-full overflow-hidden">
                <Image
                  src="/ball_player.svg"
                  alt="Illustration d'un joueur de pétanque en action, représentant l'esprit sportif et convivial du jeu"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </figure>
            
            <div className="lg:w-1/2 w-full text-center lg:text-left">
              <h1 id="hero-title" className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold mb-4 sm:mb-6">
                Bienvenue sur le <span className="uppercase">PÉTANQUE CLUB</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 italic text-light/90">
                &ldquo;Tu tires ou tu pointes ?&rdquo;
              </p>
              <p className="text-base sm:text-lg text-light/80 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                L&apos;application collaborative de la pétanque ! Découvrez et partagez les meilleurs terrains de pétanque près de chez vous. <span className="font-bold">Créez un compte</span> pour ajouter de nouveaux terrains.
              </p>
              
              <aside className="flex justify-center lg:justify-start mb-8" aria-label="Statistiques">
                <div className="text-center lg:text-left">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary block" aria-label={`${allTerrains.length} terrains`}>{allTerrains.length}</span>
                  <span className="text-base sm:text-lg text-light/90">Terrains référencés</span>
                </div>
              </aside>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => {
                    const mapSection = document.querySelector('[data-map-section]');
                    if (mapSection) {
                      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="btn-secondary w-full sm:w-auto"
                  aria-label="Aller à la section carte interactive pour trouver un terrain"
                >
                  Trouver un terrain
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light py-12 sm:py-16" data-map-section aria-labelledby="map-title">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-8 sm:mb-12">
            <h2 id="map-title" className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-4 uppercase">
              La carte interactive.
            </h2>
            <div className="space-y-2 text-primary">
              <p className="text-base sm:text-lg">Explorez les terrains existants, ajoutez les vôtres.</p>
              {isGuest && (
                <p className="text-sm sm:text-base bg-red-300">
                  <span className="font-bold">MODE CONSULTATION :</span> Vous pouvez explorer les terrains mais pas en ajouter de nouveaux ni mettre de note.
                </p>
              )}
              <p className="text-sm sm:text-base">Connectez-vous avec Google pour contribuer à la communauté !</p>
            </div>
          </header>

          <article className="bg-surface rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-light-dark">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                aria-label={`Ouvrir les filtres. ${terrains.length} terrains disponibles`}
              >
                <span aria-hidden="true">🔍</span> Filtres ({terrains.length})
              </button>
            </header>
            
            <div className="h-64 sm:h-80 lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 border-light-dark" role="img" aria-label="Carte interactive des terrains de pétanque">
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
          </article>
        </div>
      </section>

      <section className="bg-light py-12 sm:py-16" aria-labelledby="terrains-title">
        <div className="max-w-7xl mx-auto px-4">
          <h2 id="terrains-title" className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-8 sm:mb-12 text-center uppercase">
            Tous les terrains.
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Liste des terrains de pétanque">
            {displayedTerrains.map(terrain => (
              <article 
                key={terrain._id} 
                className="bg-white rounded-xl shadow-md border-2 border-primary/20 group cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 overflow-hidden"
                onClick={() => handleTerrainClick(terrain)}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTerrainClick(terrain);
                  }
                }}
                aria-label={`Terrain ${terrain.name}. ${terrain.description}. Note moyenne: ${terrain.rating?.average || 0} sur 5. Cliquer pour voir sur la carte.`}
              >
                {terrain.imageUrl && (
                  <figure className="relative h-40 sm:h-44 overflow-hidden">
                    <Image 
                      src={terrain.imageUrl} 
                      alt={`Photo du terrain de pétanque ${terrain.name}`} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </figure>
                )}
                <div className="p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-primary group-hover:text-primary-dark transition-colors line-clamp-1">
                    {terrain.name}
                  </h3>
                  <p className="mb-3 text-dark/70 leading-relaxed text-xs sm:text-sm line-clamp-2">{terrain.description}</p>
                  
                  <div className="mb-2" onClick={(e) => e.stopPropagation()}>
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
                aria-label="Charger plus de terrains"
              >
                <span>Voir plus de terrains</span>
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
        <aside 
          className="fixed inset-0 bg-dark/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="bg-surface rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-light-dark max-h-[90vh] overflow-y-auto">
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold mb-6 text-primary">Nouveau terrain</h2>
            <p id="modal-description" className="sr-only">Formulaire pour ajouter un nouveau terrain de pétanque</p>
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
                  aria-describedby="name-help"
                />
                <p id="name-help" className="sr-only">Entrez un nom descriptif pour le terrain</p>
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
                  aria-describedby="description-help"
                />
                <p id="description-help" className="sr-only">Décrivez l&apos;état du terrain et ses équipements</p>
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
                  aria-describedby="image-help"
                />
                <p id="image-help" className="sr-only">Ajoutez une photo du terrain si disponible</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="submit" 
                  className="btn-secondary flex-1"
                  aria-label="Ajouter le terrain à la base de données"
                >
                  Ajouter le terrain
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn-outline-primary flex-1"
                  aria-label="Annuler l'ajout du terrain"
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

      <footer className="bg-primary text-light mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xl font-bold mb-4 uppercase">TERRAINS DE PÉTANQUE</h3>
              <p className="text-light/90 leading-relaxed">
                La communauté collaborative pour découvrir et partager les meilleurs terrains de pétanque.
              </p>
            </section>
            
            <section>
              <h4 className="text-lg font-semibold mb-4 uppercase">À PROPOS</h4>
              <ul className="space-y-2 text-light/90" role="list">
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Qui sommes-nous ?
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Contact
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-secondary" aria-hidden="true">★</span>
                  Mentions légales
                </li>
              </ul>
            </section>
          </div>
          
          <div className="border-t border-primary-light mt-8 pt-8 text-center text-light/70">
            <p>&copy; 2025 Terrains de Pétanque - Fait avec <span aria-label="amour">❤️</span> pour la communauté</p>
          </div>
        </div>
      </footer>
    </main>
  );
}