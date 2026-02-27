import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { User } from '@/models/user';
import Terrain from '@/models/terrain';
import type { Session } from 'next-auth';

export const dynamic = 'force-dynamic';

interface Rating {
  userId: string;
  rating: number;
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectToDatabase();

    const [user, terrainsAdded, ratedTerrains, recentTerrains] = await Promise.all([
      User.findOne({ email: session.user.email }),
      Terrain.countDocuments({ createdBy: session.user.email, isDeleted: { $ne: true } }),
      Terrain.find({ 'ratings.userId': session.user.email }),
      Terrain.find({ createdBy: session.user.email, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const allUserRatings = ratedTerrains.flatMap(terrain =>
      terrain.ratings.filter((r: Rating) => r.userId === session.user.email)
    );
    const totalRatings = allUserRatings.length;
    const averageRating = totalRatings > 0
      ? allUserRatings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / totalRatings
      : 0;

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        image: user.image,
        username: user.username,
      },
      points: user.points || 0,
      level: user.level || 1,
      badges: user.badges || [],
      stats: {
        terrainsCreated: user.stats?.terrainsCreated || 0,
        commentsPosted: user.stats?.commentsPosted || 0,
        terrainsRated: user.stats?.terrainsRated || 0,
        reportsSubmitted: user.stats?.reportsSubmitted || 0,
        terrainsAdded,
        totalRatings,
        averageRating,
      },
      recentTerrains,
    });
  } catch (error) {
    console.error('Erreur /api/user/me:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
