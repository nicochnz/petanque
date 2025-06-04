import { connectToDatabase } from '../../../../../../lib/mango';
import Terrain from '../../../../../../models/terrain';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { rateLimiters, getRateLimitIdentifier } from '../../../../../../lib/rateLimit';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Non autorisé - Connexion requise' }, 
      { status: 401 }
    );
  }

  // Rate limiting pour les notations
  const identifier = getRateLimitIdentifier(req, session.user.id);
  const { success, limit, reset, remaining } = await rateLimiters.rating.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: `Trop de notations (${limit} par minute). Réessayez dans ${Math.round((reset - Date.now()) / 1000)} secondes.`,
      },
      { status: 429 }
    );
  }

  const { rating } = await req.json();
  
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Note invalide (1-5)' },
      { status: 400 }
    );
  }

  await connectToDatabase();
  
  const terrain = await Terrain.findById(params.id);
  if (!terrain) {
    return NextResponse.json(
      { error: 'Terrain non trouvé' },
      { status: 404 }
    );
  }

  // Mettre à jour la note
  terrain.rating.total += rating;
  terrain.rating.count += 1;
  terrain.rating.average = terrain.rating.total / terrain.rating.count;
  
  await terrain.save();
  
  return NextResponse.json({ 
    success: true, 
    newRating: terrain.rating,
    remaining: remaining 
  });
} 