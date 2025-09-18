import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { Comment } from '@/models/comment';
import type { Session } from 'next-auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
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
    const { commentId } = await context.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Commentaire non trouvé' },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.email) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce commentaire' },
        { status: 403 }
      );
    }

    comment.isDeleted = true;
    await comment.save();

    return NextResponse.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du commentaire' },
      { status: 500 }
    );
  }
}
