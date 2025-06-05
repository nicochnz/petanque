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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Bouton de retour */}
        <Link 
          href="/"
          className="inline-flex items-center mb-6 text-amber-600 hover:text-amber-700 transition-colors"
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
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête du profil */}
          <div className="relative h-48 bg-gradient-to-r from-amber-500 to-orange-500">
            <div className="absolute -bottom-16 left-8">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Photo de profil'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-amber-100 flex items-center justify-center">
                    <span className="text-4xl text-amber-600">
                      {session.user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations du profil */}
          <div className="pt-20 pb-8 px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {session.user.name}
            </h1>
            <p className="text-gray-600 mb-6">
              {session.user.email}
            </p>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.terrainsAdded}
                </div>
                <div className="text-sm text-gray-600">Terrains ajoutés</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.totalRatings}
                </div>
                <div className="text-sm text-gray-600">Notes données</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {stats.lastActivity}
                </div>
                <div className="text-sm text-gray-600">Dernière activité</div>
              </div>
            </div>

            {/* Section des terrains récents */}
            <div className="bg-amber-50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Terrains récemment ajoutés
              </h2>
              <div className="space-y-4">
                {recentTerrains.length > 0 ? (
                  recentTerrains.map(terrain => (
                    <div 
                      key={terrain._id}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {terrain.imageUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={terrain.imageUrl}
                              alt={terrain.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{terrain.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{terrain.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Ajouté le {new Date(terrain.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">
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