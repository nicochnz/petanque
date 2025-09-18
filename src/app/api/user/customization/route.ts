import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { User } from '@/models/user';
import type { Session } from 'next-auth';

const AVATAR_SHOP = [
  { id: 'default', name: 'Avatar par défaut', imageUrl: '/default-avatar.jpg', cost: 0, unlocked: true },
  { id: 'petanque_ball', name: 'Boule de Pétanque', imageUrl: '/avatars/avatar-2.jpg', cost: 50 },
  { id: 'champion', name: 'Champion', imageUrl: '/avatars/champion.jpg', cost: 100 },
  { id: 'golden_player', name: 'Joueur Doré', imageUrl: '/avatars/golden-player.jpg', cost: 200 },
  { id: 'legend', name: 'Légende', imageUrl: '/avatars/legend.jpg', cost: 500 }
];

const BANNER_SHOP = [
  { id: 'default', name: 'Bannière par défaut', imageUrl: '/banners/default.png', cost: 0, unlocked: true },
  { id: 'sunset', name: 'Coucher de Soleil', imageUrl: '/banners/sunset.png', cost: 75 },
  { id: 'mountains', name: 'Montagnes', imageUrl: '/banners/mountains.png', cost: 150 },
  { id: 'ocean', name: 'Océan', imageUrl: '/banners/ocean.png', cost: 300 },
  { id: 'golden', name: 'Doré', imageUrl: '/banners/golden.png', cost: 750 }
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const unlockedAvatars = (user.unlockedAvatars as Array<{id: string, name: string, imageUrl: string, cost: number, unlockedAt: Date}>) || [];
    const unlockedBanners = (user.unlockedBanners as Array<{id: string, name: string, imageUrl: string, cost: number, unlockedAt: Date}>) || [];
    let currentAvatar = user.currentAvatar || 'default';
    let currentBanner = user.currentBanner || 'default';
    const points = user.points || 0;

    if (!user.currentAvatar || !user.currentBanner) {
      await User.findByIdAndUpdate(user._id, {
        currentAvatar: 'default',
        currentBanner: 'default'
      });
      currentAvatar = 'default';
      currentBanner = 'default';
    }

    const availableAvatars = AVATAR_SHOP.map(avatar => ({
      ...avatar,
      unlocked: avatar.id === 'default' || unlockedAvatars.some((a: {id: string}) => a.id === avatar.id),
      canAfford: points >= avatar.cost,
      isCurrent: currentAvatar === avatar.id
    }));

    const availableBanners = BANNER_SHOP.map(banner => ({
      ...banner,
      unlocked: banner.id === 'default' || unlockedBanners.some((b: {id: string}) => b.id === banner.id),
      canAfford: points >= banner.cost,
      isCurrent: currentBanner === banner.id
    }));

    return NextResponse.json({
      avatars: availableAvatars,
      banners: availableBanners,
      currentAvatar,
      currentBanner,
      points
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la personnalisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la personnalisation' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { type, itemId } = await request.json();

    if (!type || !itemId) {
      return NextResponse.json(
        { error: 'Type et ID de l\'élément requis' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const points = user.points || 0;
    let shopItem, unlockedItems, currentField;

    if (type === 'avatar') {
      shopItem = AVATAR_SHOP.find(item => item.id === itemId);
      unlockedItems = user.unlockedAvatars || [];
      currentField = 'currentAvatar';
    } else if (type === 'banner') {
      shopItem = BANNER_SHOP.find(item => item.id === itemId);
      unlockedItems = user.unlockedBanners || [];
      currentField = 'currentBanner';
    } else {
      return NextResponse.json(
        { error: 'Type invalide' },
        { status: 400 }
      );
    }

    if (!shopItem) {
      return NextResponse.json(
        { error: 'Élément non trouvé' },
        { status: 404 }
      );
    }

    const isUnlocked = shopItem.id === 'default' || unlockedItems.some((item: {id: string}) => item.id === itemId);

    if (!isUnlocked) {
      if (points < shopItem.cost) {
        return NextResponse.json(
          { error: `Vous devez avoir ${shopItem.cost} points pour acheter "${shopItem.name}". Vous avez actuellement ${points} points.` },
          { status: 400 }
        );
      }

      const newItem = {
        id: shopItem.id,
        name: shopItem.name,
        imageUrl: shopItem.imageUrl,
        cost: shopItem.cost,
        unlockedAt: new Date()
      };

      await User.findByIdAndUpdate(user._id, {
        $push: { [type === 'avatar' ? 'unlockedAvatars' : 'unlockedBanners']: newItem },
        $inc: { points: -shopItem.cost },
        [currentField]: itemId
      });

      return NextResponse.json({
        message: `${type === 'avatar' ? 'Avatar' : 'Bannière'} "${shopItem.name}" débloqué et équipé !`,
        pointsSpent: shopItem.cost,
        newPoints: points - shopItem.cost
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        [currentField]: itemId
      });

      return NextResponse.json({
        message: `${type === 'avatar' ? 'Avatar' : 'Bannière'} "${shopItem.name}" équipé !`
      });
    }
  } catch (error) {
    console.error('Erreur lors de la personnalisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la personnalisation' },
      { status: 500 }
    );
  }
}
