import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';

interface Rating {
  userId: string;
  rating: number;
  createdAt: Date;
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { rating } = await request.json();
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit être comprise entre 1 et 5' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const terrainId = context.params.id;
    const terrain = await Terrain.findById(terrainId);
    if (!terrain) {
      return NextResponse.json(
        { error: 'Terrain non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour la note
    const userId = session.user.email;
    const existingRating = terrain.ratings.find((r: Rating) => r.userId === userId);

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      terrain.ratings.push({ userId, rating });
    }

    // Calculer la moyenne
    const totalRatings = terrain.ratings.length;
    const sumRatings = terrain.ratings.reduce((sum: number, r: Rating) => sum + r.rating, 0);
    terrain.rating = {
      average: sumRatings / totalRatings,
      count: totalRatings,
      total: sumRatings
    };

    await terrain.save();

    return NextResponse.json({ 
      success: true,
      rating: terrain.rating
    });
  } catch (error) {
    console.error('Erreur lors de la notation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la notation du terrain' },
      { status: 500 }
    );
  }
}