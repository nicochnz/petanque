'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface UserStats {
  terrainsAdded: number;
  totalRatings: number;
  averageRating: number;
  lastActivity: string;
}

interface Terrain {
  _id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  imageUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    terrainsAdded: 0,
    totalRatings: 0,
    averageRating: 0,
    lastActivity: ''
  });
  const [recentTerrains, setRecentTerrains] = useState<Terrain[]>([]);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer les statistiques
        const statsRes = await fetch('/api/user/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Récupérer les terrains récents
        const terrainsRes = await fetch('/api/user/terrains');
        if (terrainsRes.ok) {
          const terrainsData = await terrainsRes.json();
          setRecentTerrains(terrainsData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center mb-6 text-primary hover:text-primary-dark transition-colors"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
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

        <div className="card overflow-hidden">
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary to-secondary">
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-surface overflow-hidden bg-surface">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Photo de profil'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-light flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl text-primary">
                      {session.user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
              {session.user.name}
            </h1>
            <p className="text-dark/70 text-sm sm:text-base mb-6">
              {session.user.email}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                  {stats.terrainsAdded}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Terrains ajoutés</div>
              </div>
              <div className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                  {stats.totalRatings}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Notes données</div>
              </div>
              <div className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Note moyenne</div>
              </div>
              <div className="bg-light rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                  {stats.lastActivity}
                </div>
                <div className="text-xs sm:text-sm text-dark/70">Dernière activité</div>
              </div>
            </div>

            <div className="bg-light rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-dark mb-4">
                Terrains récemment ajoutés
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {recentTerrains.length > 0 ? (
                  recentTerrains.map(terrain => (
                    <div 
                      key={terrain._id}
                      className="bg-surface rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {terrain.imageUrl && (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={terrain.imageUrl}
                              alt={terrain.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-dark text-sm sm:text-base truncate">{terrain.name}</h3>
                          <p className="text-xs sm:text-sm text-dark/70 mt-1 line-clamp-2">{terrain.description}</p>
                          <p className="text-xs text-dark/50 mt-2">
                            Ajouté le {new Date(terrain.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-dark/70 text-center py-4 text-sm sm:text-base">
                    Aucun terrain ajouté pour le moment
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 