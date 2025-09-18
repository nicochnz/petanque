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
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;
      
      setIsLoading(true);
      try {
        const [statsRes, terrainsRes, userRes] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/user/terrains'),
          fetch('/api/user/profile')
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (terrainsRes.ok) {
          const terrainsData = await terrainsRes.json();
          setRecentTerrains(terrainsData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.name || session.user.name || 'Utilisateur');
        } else {
          setUserName(session.user.name || 'Utilisateur');
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, refreshTrigger]);

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    stats,
    recentTerrains,
    isLoading,
    user: session?.user,
    userName,
    refetch
  };
}
