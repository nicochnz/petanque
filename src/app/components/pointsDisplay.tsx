'use client';

import { usePoints } from '../hooks/usePoints';
import { useState } from 'react';
import Image from 'next/image';

interface PointsDisplayProps {
  onDataChange?: () => void;
}

export default function PointsDisplay({ onDataChange }: PointsDisplayProps = {}) {
  const { pointsData, badgeData, customizationData, isLoading, unlockBadge, purchaseItem } = usePoints();
  const [activeTab, setActiveTab] = useState<'points' | 'badges' | 'shop'>('points');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!pointsData || !badgeData || !customizationData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <p className="text-gray-500">Erreur lors du chargement des données</p>
      </div>
    );
  }

  const { points, level, stats } = pointsData;
  const { currentBadges, availableBadges } = badgeData;
  const { avatars, banners } = customizationData;

  const handlePurchaseAvatar = async (avatarId: string, avatarName: string, cost: number) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (points < cost) {
      setErrorMessage(`Vous devez avoir ${cost} points pour acheter "${avatarName}". Vous avez actuellement ${points} points.`);
      return;
    }

    const result = await purchaseItem('avatar', avatarId);
    if (result.success) {
      setSuccessMessage(result.message || `Avatar "${avatarName}" acheté et équipé avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);
      onDataChange?.();
    } else {
      setErrorMessage(result.error || 'Erreur lors de l\'achat de l\'avatar. Veuillez réessayer.');
    }
  };

  const handleEquipAvatar = async (avatarId: string, avatarName: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    const result = await purchaseItem('avatar', avatarId);
    if (result.success) {
      setSuccessMessage(result.message || `Avatar "${avatarName}" équipé avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);
      onDataChange?.();
    } else {
      setErrorMessage(result.error || 'Erreur lors de l\'équipement de l\'avatar. Veuillez réessayer.');
    }
  };

  const handlePurchaseBanner = async (bannerId: string, bannerName: string, cost: number) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    if (points < cost) {
      setErrorMessage(`Vous devez avoir ${cost} points pour acheter "${bannerName}". Vous avez actuellement ${points} points.`);
      return;
    }

    const result = await purchaseItem('banner', bannerId);
    if (result.success) {
      setSuccessMessage(result.message || `Bannière "${bannerName}" achetée et équipée avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);
      onDataChange?.();
    } else {
      setErrorMessage(result.error || 'Erreur lors de l\'achat de la bannière. Veuillez réessayer.');
    }
  };

  const handleEquipBanner = async (bannerId: string, bannerName: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    
    const result = await purchaseItem('banner', bannerId);
    if (result.success) {
      setSuccessMessage(result.message || `Bannière "${bannerName}" équipée avec succès !`);
      setTimeout(() => setSuccessMessage(''), 3000);
      onDataChange?.();
    } else {
      setErrorMessage(result.error || 'Erreur lors de l\'équipement de la bannière. Veuillez réessayer.');
    }
  };

  const pointsToNextLevel = (level * 100) - points;
  const progressPercentage = ((points % 100) / 100) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Système de Points</h2>
            <p className="text-white/80">Progressez et débloquez des récompenses</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{points}</div>
            <div className="text-white/80">points</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Niveau {level}</span>
            <span>{pointsToNextLevel} points jusqu&apos;au niveau {level + 1}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {(errorMessage || successMessage) && (
          <div className={`mb-4 p-3 rounded-lg ${
            errorMessage ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {errorMessage || successMessage}
          </div>
        )}


        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'points' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Statistiques
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'badges' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏆 Badges ({currentBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'shop' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🛍️ Boutique
          </button>
        </div>

        {activeTab === 'points' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.terrainsCreated}</div>
              <div className="text-sm text-gray-600">Terrains créés</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.commentsPosted}</div>
              <div className="text-sm text-gray-600">Commentaires</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.terrainsRated}</div>
              <div className="text-sm text-gray-600">Terrains notés</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.reportsSubmitted}</div>
              <div className="text-sm text-gray-600">Signalements</div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Badges débloqués ({currentBadges.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentBadges.map((badge) => (
                  <div key={badge.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{badge.icon}</span>
                      <div>
                        <div className="font-medium text-green-800">{badge.name}</div>
                        <div className="text-xs text-green-600">{badge.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Badges disponibles</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableBadges.filter(badge => !badge.unlocked).map((badge) => (
                  <div key={badge.id} className={`border rounded-lg p-3 ${
                    badge.canUnlock ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg opacity-50">{badge.icon}</span>
                      <div>
                        <div className={`font-medium ${badge.canUnlock ? 'text-blue-800' : 'text-gray-600'}`}>
                          {badge.name}
                        </div>
                        <div className={`text-xs ${badge.canUnlock ? 'text-blue-600' : 'text-gray-500'}`}>
                          {badge.description}
                        </div>
                      </div>
                    </div>
                    {badge.canUnlock && (
                      <button
                        onClick={() => unlockBadge(badge.id)}
                        className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-700 cursor-pointer"
                      >
                        Débloquer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Avatars</h3>
              <div className="grid grid-cols-2 gap-3">
                {avatars.map((avatar) => (
                  <div key={avatar.id} className={`border rounded-lg p-3 ${
                    avatar.isCurrent ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <Image
                          src={avatar.imageUrl}
                          alt={avatar.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default-avatar.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{avatar.name}</div>
                        <div className="text-xs text-gray-600">{avatar.cost} points</div>
                      </div>
                    </div>
                    {avatar.unlocked ? (
                      <button
                        onClick={() => handleEquipAvatar(avatar.id, avatar.name)}
                        className={`w-full py-1 px-3 rounded text-xs cursor-pointer ${
                          avatar.isCurrent 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {avatar.isCurrent ? 'Équipé' : 'Équiper'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseAvatar(avatar.id, avatar.name, avatar.cost)}
                        disabled={!avatar.canAfford}
                        className={`w-full py-1 px-3 rounded text-xs cursor-pointer ${
                          avatar.canAfford 
                            ? 'bg-secondary text-white hover:bg-secondary-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {avatar.canAfford ? 'Acheter' : 'Points insuffisants'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Bannières</h3>
              <div className="grid grid-cols-2 gap-3">
                {banners.map((banner) => (
                  <div key={banner.id} className={`border rounded-lg p-3 ${
                    banner.isCurrent ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-12 h-6 rounded ${
                        banner.id === 'default' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        banner.id === 'sunset' ? 'bg-gradient-to-r from-orange-400 to-pink-500' :
                        banner.id === 'mountains' ? 'bg-gradient-to-r from-green-400 to-blue-500' :
                        banner.id === 'ocean' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                        banner.id === 'golden' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        'bg-gray-200'
                      }`}></div>
                      <div>
                        <div className="font-medium">{banner.name}</div>
                        <div className="text-xs text-gray-600">{banner.cost} points</div>
                      </div>
                    </div>
                    {banner.unlocked ? (
                      <button
                        onClick={() => handleEquipBanner(banner.id, banner.name)}
                        className={`w-full py-1 px-3 rounded text-xs cursor-pointer ${
                          banner.isCurrent 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {banner.isCurrent ? 'Équipée' : 'Équiper'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseBanner(banner.id, banner.name, banner.cost)}
                        disabled={!banner.canAfford}
                        className={`w-full py-1 px-3 rounded text-xs cursor-pointer ${
                          banner.canAfford 
                            ? 'bg-secondary text-white hover:bg-secondary-dark' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {banner.canAfford ? 'Acheter' : 'Points insuffisants'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
