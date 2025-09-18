import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';
import type { Session } from 'next-auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;

    const terrain = await Terrain.findById(id);
    if (!terrain) {
      return NextResponse.json(
        { error: 'Terrain non trouvé' },
        { status: 404 }
      );
    }

    if (terrain.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce terrain' },
        { status: 403 }
      );
    }

    terrain.isDeleted = true;
    await terrain.save();

    return NextResponse.json({ message: 'Terrain supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du terrain:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du terrain' },
      { status: 500 }
    );
  }
}
