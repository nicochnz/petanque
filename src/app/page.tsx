'use client';

import { useHomePage } from './hooks/useHomePage';
import dynamic from 'next/dynamic';
import StarRating from './components/starRating';
import FilterPanel from './components/filterPanel';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const MapSelectorComponent = dynamic(
  () => import('./components/mapSelector'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-light-dark/50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-dark-muted">Chargement de la carte...</span>
        </div>
      </div>
    )
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
    handleDeleteTerrain,
    isGuest,
    isLoading,
    session
  } = useHomePage();

  const [focusedTerrain, setFocusedTerrain] = useState<{ lat: number; lng: number } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTerrainClick = (terrain: { location: { lat: number; lng: number } }) => {
    setFocusedTerrain({ lat: terrain.location.lat, lng: terrain.location.lng });
    document.querySelector('[data-map-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-light-dark">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-dark tracking-tight">Petanque Club</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="text-xs text-dark-muted hover:text-dark px-3 py-1.5 rounded-lg hover:bg-light-dark transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline">Filtres</span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-1 hover:bg-light-dark transition-colors"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-light-dark bg-light-dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session?.user?.image || '/default-avatar.jpg'}
                    alt="Avatar"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.jpg'; }}
                  />
                </div>
                <svg className={`w-3 h-3 text-dark-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-xl border border-light-dark overflow-hidden fade-in">
                  <div className="px-3 py-2.5 border-b border-light-dark">
                    <p className="text-xs font-semibold text-dark truncate">{session?.user?.name || 'Invite'}</p>
                    {isGuest && <p className="text-[10px] text-dark-muted">Mode consultation</p>}
                  </div>
                  {!isGuest && (
                    <button
                      onClick={() => { router.push('/profile'); setShowDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-dark hover:bg-light transition-colors cursor-pointer"
                    >
                      Mon profil
                    </button>
                  )}
                  <button
                    onClick={() => { signOut(); setShowDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Deconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero bar */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold leading-tight">
                Trouvez votre terrain
              </h2>
              <p className="text-sm text-white/60 mt-1">
                {allTerrains.length} terrain{allTerrains.length !== 1 ? 's' : ''} partage{allTerrains.length !== 1 ? 's' : ''} par la communaute
              </p>
            </div>
            {!isGuest && (
              <button
                onClick={() => {
                  document.querySelector('[data-map-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="btn-secondary text-xs whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un terrain
              </button>
            )}
          </div>
          {isGuest && (
            <div className="mt-3 bg-white/8 rounded-lg px-3 py-2 text-xs text-white/60 inline-block">
              Mode consultation — connectez-vous pour contribuer.
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <section data-map-section>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="rounded-xl overflow-hidden shadow-sm border border-light-dark">
            <div className="h-[45vh] sm:h-[50vh] lg:h-[55vh]">
              <MapSelectorComponent
                terrains={displayedTerrains
                  .filter(t => t.location?.lat != null && t.location?.lng != null)
                  .map(t => ({
                    ...t.location,
                    _id: t._id,
                    name: t.name,
                    description: t.description,
                    imageUrl: t.imageUrl
                  }))}
                onSelectPosition={(pos) => { if (!isGuest) handleMapClick(pos); }}
                focusedTerrain={focusedTerrain}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Terrains */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-lg font-bold text-dark">Terrains</h2>
            <span className="text-[11px] text-dark-muted">
              {displayedTerrains.length} sur {allTerrains.length}
            </span>
          </div>

          {displayedTerrains.length === 0 ? (
            <div className="text-center py-16 text-dark-muted text-sm">
              Aucun terrain disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {displayedTerrains.map(terrain => (
                <article
                  key={terrain._id}
                  className="bg-white rounded-xl border border-light-dark group cursor-pointer hover:shadow-md hover:-translate-y-px transition-all duration-150 overflow-hidden"
                  onClick={() => handleTerrainClick(terrain)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTerrainClick(terrain); } }}
                >
                  <div className="relative aspect-[16/10] bg-light-dark overflow-hidden">
                    {terrain.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={terrain.imageUrl}
                        alt={terrain.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-light-dark">
                        <svg className="w-8 h-8 text-dark/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5">
                    <h3 className="text-[13px] font-semibold text-dark mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                      {terrain.name}
                    </h3>
                    <p className="text-[11px] text-dark-muted leading-relaxed line-clamp-2 mb-2.5">{terrain.description}</p>

                    <div className="flex items-center justify-between">
                      <div onClick={(e) => e.stopPropagation()}>
                        <StarRating
                          rating={terrain.rating?.average || 0}
                          count={terrain.rating?.count || 0}
                          onRate={isGuest ? undefined : (rating) => handleRating(terrain._id!, rating)}
                          size="sm"
                        />
                      </div>
                      {!isGuest && terrain.createdBy === session?.user?.email && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer ce terrain ?')) handleDeleteTerrain(terrain._id!);
                          }}
                          className="text-[10px] text-dark-muted hover:text-red-500 transition-colors cursor-pointer"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasMoreTerrains && (
            <div className="mt-8 text-center">
              <button onClick={loadMoreTerrains} className="btn-outline-primary text-xs">
                Voir plus
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Add terrain modal */}
      {showForm && !isGuest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-dark">Nouveau terrain</h2>
              <button onClick={() => setShowForm(false)} className="text-dark-muted hover:text-dark cursor-pointer p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="name" className="block text-[11px] font-medium text-dark-muted mb-1">Nom</label>
                <input id="name" type="text" name="name" placeholder="Ex: Place du village" value={form.name} onChange={handleChange} required className="input-primary" />
              </div>
              <div>
                <label htmlFor="description" className="block text-[11px] font-medium text-dark-muted mb-1">Description</label>
                <textarea id="description" name="description" placeholder="Etat, equipements..." value={form.description} onChange={handleChange} required rows={3} className="input-primary resize-none" />
              </div>
              <div>
                <label htmlFor="image" className="block text-[11px] font-medium text-dark-muted mb-1">Photo</label>
                <input id="image" type="file" name="image" accept="image/*" onChange={handleChange} className="input-primary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-light file:text-primary hover:file:bg-light-dark cursor-pointer text-xs" />
              </div>
              <div className="flex gap-2.5 pt-1">
                <button type="submit" className="btn-secondary flex-1">Ajouter</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline-primary flex-1">Annuler</button>
              </div>
            </form>
          </div>
        </div>
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

      {/* Footer */}
      <footer className="border-t border-light-dark">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-[11px] text-dark-muted">
          <span>&copy; 2025 Petanque Club</span>
        </div>
      </footer>
    </main>
  );
}
