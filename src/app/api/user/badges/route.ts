import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { User } from '@/models/user';
import type { Session } from 'next-auth';

interface UserStats {
  terrainsCreated: number;
  commentsPosted: number;
  terrainsRated: number;
  reportsSubmitted: number;
}

const BADGE_DEFINITIONS = {
  'first_terrain': {
    id: 'first_terrain',
    name: 'Premier Terrain',
    description: 'A ajouté son premier terrain',
    icon: '🏟️',
    condition: (stats: UserStats) => stats.terrainsCreated >= 1
  },
  'terrain_master': {
    id: 'terrain_master',
    name: 'Maître des Terrains',
    description: 'A ajouté 10 terrains',
    icon: '🏆',
    condition: (stats: UserStats) => stats.terrainsCreated >= 10
  },
  'social_butterfly': {
    id: 'social_butterfly',
    name: 'Papillon Social',
    description: 'A posté 20 commentaires',
    icon: '🦋',
    condition: (stats: UserStats) => stats.commentsPosted >= 20
  },
  'critic': {
    id: 'critic',
    name: 'Critique',
    description: 'A noté 15 terrains',
    icon: '⭐',
    condition: (stats: UserStats) => stats.terrainsRated >= 15
  },
  'guardian': {
    id: 'guardian',
    name: 'Gardien',
    description: 'A signalé 5 contenus inappropriés',
    icon: '🛡️',
    condition: (stats: UserStats) => stats.reportsSubmitted >= 5
  },
  'points_collector': {
    id: 'points_collector',
    name: 'Collectionneur',
    description: 'A atteint 500 points',
    icon: '💰',
    condition: (_stats: UserStats, points: number) => points >= 500
  },
  'level_5': {
    id: 'level_5',
    name: 'Niveau 5',
    description: 'A atteint le niveau 5',
    icon: '🎖️',
    condition: (_stats: UserStats, _points: number, level: number) => level >= 5
  },
  'level_10': {
    id: 'level_10',
    name: 'Niveau 10',
    description: 'A atteint le niveau 10',
    icon: '👑',
    condition: (_stats: UserStats, _points: number, level: number) => level >= 10
  }
};

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

    const stats = user.stats || {};
    const points = user.points || 0;
    const level = user.level || 1;
    const currentBadges = user.badges || [];

    const availableBadges = Object.values(BADGE_DEFINITIONS).map(badge => ({
      ...badge,
      unlocked: currentBadges.some((b: { id: string }) => b.id === badge.id),
      canUnlock: badge.condition(stats, points, level) && !currentBadges.some((b: { id: string }) => b.id === badge.id)
    }));

    return NextResponse.json({
      currentBadges,
      availableBadges,
      stats,
      points,
      level
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des badges' },
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
    const { badgeId } = await request.json();

    if (!badgeId) {
      return NextResponse.json(
        { error: 'ID du badge requis' },
        { status: 400 }
      );
    }

    const badgeDef = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS];
    if (!badgeDef) {
      return NextResponse.json(
        { error: 'Badge non trouvé' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const stats = user.stats || {};
    const points = user.points || 0;
    const level = user.level || 1;
    const currentBadges = user.badges || [];

    if (currentBadges.some((b: { id: string }) => b.id === badgeId)) {
      return NextResponse.json(
        { error: 'Badge déjà débloqué' },
        { status: 400 }
      );
    }

    if (!badgeDef.condition(stats, points, level)) {
      return NextResponse.json(
        { error: 'Conditions non remplies pour ce badge' },
        { status: 400 }
      );
    }

    const newBadge = {
      id: badgeDef.id,
      name: badgeDef.name,
      description: badgeDef.description,
      icon: badgeDef.icon,
      unlockedAt: new Date()
    };

    await User.findByIdAndUpdate(user._id, {
      $push: { badges: newBadge }
    });

    return NextResponse.json({
      badge: newBadge,
      message: 'Badge débloqué avec succès !'
    });
  } catch (error) {
    console.error('Erreur lors du déblocage du badge:', error);
    return NextResponse.json(
      { error: 'Erreur lors du déblocage du badge' },
      { status: 500 }
    );
  }
}
