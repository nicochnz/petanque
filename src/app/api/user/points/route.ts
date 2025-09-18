import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { User } from '@/models/user';
import type { Session } from 'next-auth';

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

    return NextResponse.json({
      points: user.points || 0,
      level: user.level || 1,
      badges: user.badges || [],
      stats: user.stats || {
        terrainsCreated: 0,
        commentsPosted: 0,
        terrainsRated: 0,
        reportsSubmitted: 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des points:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des points' },
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
    const { action, amount } = await request.json();

    if (!action || !amount) {
      return NextResponse.json(
        { error: 'Action et montant requis' },
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

    const newPoints = (user.points || 0) + amount;
    const newLevel = Math.floor(newPoints / 100) + 1;

    await User.findByIdAndUpdate(user._id, {
      points: newPoints,
      level: newLevel
    });

    return NextResponse.json({
      points: newPoints,
      level: newLevel,
      pointsAdded: amount,
      action
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de points:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de points' },
      { status: 500 }
    );
  }
}
