import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await connectToDatabase();

    // Récupérer les terrains ajoutés par l'utilisateur, triés par date de création
    const terrains = await Terrain.find({ createdBy: session.user.email })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json(terrains);
  } catch (error) {
    console.error('Erreur lors de la récupération des terrains:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des terrains' },
      { status: 500 }
    );
  }
} 