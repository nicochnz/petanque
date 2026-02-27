import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserStats {
  terrainsAdded: number;
  totalRatings: number;
  averageRating: number;
}

interface Terrain {
  _id: string;
  name: string;
  description: string;
  location: { lat: number; lng: number; address?: string };
  imageUrl?: string;
  createdAt: string;
}

export function useProfile() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    terrainsAdded: 0,
    totalRatings: 0,
    averageRating: 0,
  });
  const [recentTerrains, setRecentTerrains] = useState<Terrain[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const data = await res.json();
          setStats({
            terrainsAdded: data.stats.terrainsAdded,
            totalRatings: data.stats.totalRatings,
            averageRating: data.stats.averageRating,
          });
          setRecentTerrains(data.recentTerrains);
          setUserName(data.profile.name || session.user.name || 'Utilisateur');
        } else {
          setUserName(session.user.name || 'Utilisateur');
        }
      } catch {
        setUserName(session.user.name || 'Utilisateur');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, refreshTrigger]);

  return {
    stats,
    recentTerrains,
    isLoading,
    user: session?.user,
    userName,
    refetch: () => setRefreshTrigger(prev => prev + 1),
  };
}
