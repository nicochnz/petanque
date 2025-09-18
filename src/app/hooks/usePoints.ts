'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface PointsData {
  points: number;
  level: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  stats: {
    terrainsCreated: number;
    commentsPosted: number;
    terrainsRated: number;
    reportsSubmitted: number;
  };
}

interface BadgeData {
  currentBadges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  availableBadges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    canUnlock: boolean;
  }>;
  stats: {
    terrainsCreated: number;
    commentsPosted: number;
    terrainsRated: number;
    reportsSubmitted: number;
  };
  points: number;
  level: number;
}

interface CustomizationData {
  avatars: Array<{
    id: string;
    name: string;
    imageUrl: string;
    cost: number;
    unlocked: boolean;
    canAfford: boolean;
    isCurrent: boolean;
  }>;
  banners: Array<{
    id: string;
    name: string;
    imageUrl: string;
    cost: number;
    unlocked: boolean;
    canAfford: boolean;
    isCurrent: boolean;
  }>;
  currentAvatar: string;
  currentBanner: string;
  points: number;
}

export function usePoints() {
  const { data: session } = useSession();
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/points');
      if (response.ok) {
        const data = await response.json();
        setPointsData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des points:', error);
    }
  }, [session]);

  const fetchBadges = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/badges');
      if (response.ok) {
        const data = await response.json();
        setBadgeData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    }
  }, [session]);

  const fetchCustomization = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/customization');
      if (response.ok) {
        const data = await response.json();
        setCustomizationData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la personnalisation:', error);
    }
  }, [session]);

  const addPoints = useCallback(async (action: string, amount: number) => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, amount })
      });

      if (response.ok) {
        await fetchPoints();
        await fetchBadges();
        await fetchCustomization();
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de points:', error);
    }
    return false;
  }, [session, fetchPoints, fetchBadges, fetchCustomization]);

  const unlockBadge = useCallback(async (badgeId: string) => {
    if (!session) return;

    try {
      const response = await fetch('/api/user/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId })
      });

      if (response.ok) {
        await fetchBadges();
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du déblocage du badge:', error);
    }
    return false;
  }, [session, fetchBadges]);

  const purchaseItem = useCallback(async (type: 'avatar' | 'banner', itemId: string) => {
    if (!session) return { success: false, error: 'Non authentifié' };

    try {
      const response = await fetch('/api/user/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, itemId })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCustomization();
        await fetchPoints();
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Erreur lors de l\'achat' };
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }, [session, fetchCustomization, fetchPoints]);

  useEffect(() => {
    if (session) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
          fetchPoints(),
          fetchBadges(),
          fetchCustomization()
        ]);
        setIsLoading(false);
      };
      loadData();
    }
  }, [session, fetchPoints, fetchBadges, fetchCustomization]);

  return {
    pointsData,
    badgeData,
    customizationData,
    isLoading,
    addPoints,
    unlockBadge,
    purchaseItem,
    refreshData: () => {
      fetchPoints();
      fetchBadges();
      fetchCustomization();
    }
  };
}
