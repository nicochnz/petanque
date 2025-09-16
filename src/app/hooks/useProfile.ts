import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

export function useProfile() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    terrainsAdded: 0,
    totalRatings: 0,
    averageRating: 0,
    lastActivity: ''
  });
  const [recentTerrains, setRecentTerrains] = useState<Terrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const [statsRes, terrainsRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/user/terrains')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (terrainsRes.ok) {
          const terrainsData = await terrainsRes.json();
          setRecentTerrains(terrainsData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  return {
    stats,
    recentTerrains,
    isLoading,
    user: session?.user
  };
}
