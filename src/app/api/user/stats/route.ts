import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';

interface Rating {
  userId: string;
  rating: number;
  createdAt: Date;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    // Récupérer les terrains ajoutés par l'utilisateur
    const terrainsAdded = await Terrain.countDocuments({ createdBy: session.user.email });

    // Récupérer toutes les notes données par l'utilisateur
    const terrains = await Terrain.find({ 'ratings.userId': session.user.email });
    const totalRatings = terrains.reduce((sum, terrain) => {
      return sum + terrain.ratings.filter((r: Rating) => r.userId === session.user.email).length;
    }, 0);

    // Calculer la moyenne des notes données
    const allRatings = terrains.flatMap(terrain => 
      terrain.ratings.filter((r: Rating) => r.userId === session.user.email)
    );
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    // Trouver la dernière activité
    const lastActivity = await Terrain.findOne(
      { 'ratings.userId': session.user.email },
      { 'ratings.$': 1 }
    ).sort({ 'ratings.createdAt': -1 });

    return NextResponse.json({
      terrainsAdded,
      totalRatings,
      averageRating,
      lastActivity: lastActivity?.ratings[0]?.createdAt 
        ? new Date(lastActivity.ratings[0].createdAt).toLocaleDateString('fr-FR')
        : 'Aucune activité'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 