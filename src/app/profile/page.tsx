'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useProfile } from '../hooks/useProfile';
import { usePoints } from '../hooks/usePoints';
import PointsDisplay from '../components/pointsDisplay';
import EditUsername from '../components/editUsername';

export default function ProfilePage() {
  const router = useRouter();
  const { stats, recentTerrains, isLoading, user, userName, refetch } = useProfile();
  const { customizationData } = usePoints();


  if (isLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }


  return (
    <main className="min-h-screen bg-light py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Navigation de retour">
          <Link 
            href="/"
            className="inline-flex items-center mb-6 text-primary hover:text-primary-dark transition-colors"
            aria-label="Retour à la page d'accueil"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            <span className="hidden sm:inline">Retour à l&apos;accueil</span>
            <span className="sm:hidden">Retour</span>
          </Link>
        </nav>

        <article className="card overflow-hidden">
          <header className={`relative h-32 sm:h-48 ${
            customizationData?.currentBanner === 'sunset' ? 'bg-gradient-to-r from-orange-400 to-pink-500' :
            customizationData?.currentBanner === 'mountains' ? 'bg-gradient-to-r from-green-400 to-blue-500' :
            customizationData?.currentBanner === 'ocean' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
            customizationData?.currentBanner === 'golden' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
            customizationData?.currentBanner === 'default' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
            'bg-gradient-to-r from-primary to-secondary'
          }`}>
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <figure className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-surface overflow-hidden bg-surface">
                {customizationData?.currentAvatar ? (
                  <Image
                    src={customizationData.avatars.find(a => a.id === customizationData.currentAvatar)?.imageUrl || '/default-avatar.jpg'}
                    alt={`Avatar de ${user.name || 'l\'utilisateur'}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-avatar.jpg';
                    }}
                  />
                ) : (
                  <Image
                    src="/default-avatar.jpg"
                    alt={`Avatar par défaut de ${user.name || 'l\'utilisateur'}`}
                    fill
                    className="object-cover"
                  />
                )}
              </figure>
            </div>
          </header>

          <section className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-8">
            <EditUsername
              currentName={userName || 'Utilisateur'}
              currentImage={customizationData?.currentAvatar && customizationData.currentAvatar !== 'default' 
                ? customizationData.avatars.find(a => a.id === customizationData.currentAvatar)?.imageUrl || '/default-avatar.jpg'
                : user.image || '/default-avatar.jpg'
              }
              onUpdate={() => {
                refetch();
              }}
            />
            <p className="text-dark/70 text-sm sm:text-base mb-6">
              {user.email}
            </p>

            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8" aria-label="Statistiques de l'utilisateur">
              <article className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1" aria-label={`${stats.terrainsAdded} terrains ajoutés`}>
                  {stats.terrainsAdded}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Terrains ajoutés</div>
              </article>
              <article className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1" aria-label={`${stats.totalRatings} notes données`}>
                  {stats.totalRatings}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Notes données</div>
              </article>
              <article className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1" aria-label={`Note moyenne de ${stats.averageRating.toFixed(1)} sur 5`}>
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Note moyenne</div>
              </article>
              <article className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1" aria-label={`Dernière activité: ${stats.lastActivity}`}>
                  {stats.lastActivity}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Dernière activité</div>
              </article>
            </section>

            <section className="mb-6 sm:mb-8">
              <PointsDisplay onDataChange={() => window.location.reload()} />
            </section>

            <section className="bg-light rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-dark mb-4">
                Terrains récemment ajoutés
              </h2>
              <div className="space-y-3 sm:space-y-4" role="list" aria-label="Liste des terrains ajoutés par l'utilisateur">
                {recentTerrains.length > 0 ? (
                  recentTerrains.map(terrain => (
                    <article 
                      key={terrain._id}
                      className="bg-surface rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                      role="listitem"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {terrain.imageUrl && (
                          <figure className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={terrain.imageUrl}
                              alt={`Photo du terrain de pétanque ${terrain.name}`}
                              fill
                              className="object-cover"
                            />
                          </figure>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-dark text-sm sm:text-base truncate">{terrain.name}</h3>
                          <p className="text-xs sm:text-sm text-dark/70 mt-1 line-clamp-2">{terrain.description}</p>
                          <time className="text-xs text-dark/50 mt-2" dateTime={terrain.createdAt}>
                            Ajouté le {new Date(terrain.createdAt).toLocaleDateString('fr-FR')}
                          </time>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="text-dark/70 text-center py-4 text-sm sm:text-base">
                    Aucun terrain ajouté pour le moment
                  </p>
                )}
              </div>
            </section>
          </section>
        </article>
      </div>
    </main>
  );
} 