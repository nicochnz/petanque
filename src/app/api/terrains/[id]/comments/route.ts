import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { Comment } from '@/models/comment';
import Terrain from '@/models/terrain';
import { User } from '@/models/user';
import type { Session } from 'next-auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    let terrainId = id;
    if (id.includes('--')) {
      const [lat, lng] = id.split('--');
      
      const terrain = await Terrain.findOne({ 
        $and: [
          { 'location.lat': { $gte: parseFloat(lat) - 0.000001, $lte: parseFloat(lat) + 0.000001 } },
          { 'location.lng': { $gte: parseFloat(lng) - 0.000001, $lte: parseFloat(lng) + 0.000001 } }
        ]
      });
      
      if (!terrain) {
        const terrainApprox = await Terrain.findOne({
          $and: [
            { 'location.lat': { $gte: parseFloat(lat) - 0.0001, $lte: parseFloat(lat) + 0.0001 } },
            { 'location.lng': { $gte: parseFloat(lng) - 0.0001, $lte: parseFloat(lng) + 0.0001 } }
          ]
        });
        
        if (!terrainApprox) {
          return NextResponse.json([]);
        }
        terrainId = terrainApprox._id.toString();
      } else {
        terrainId = terrain._id.toString();
      }
    }

    const comments = await Comment.find({ 
      terrainId: terrainId, 
      isDeleted: false 
    })
    .sort({ createdAt: -1 })
    .limit(50);

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le commentaire ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Le commentaire ne peut pas dépasser 500 caractères' },
        { status: 400 }
      );
    }

    let terrain;
    if (id.includes('--')) {
      const [lat, lng] = id.split('--');
      
      terrain = await Terrain.findOne({ 
        $and: [
          { 'location.lat': { $gte: parseFloat(lat) - 0.000001, $lte: parseFloat(lat) + 0.000001 } },
          { 'location.lng': { $gte: parseFloat(lng) - 0.000001, $lte: parseFloat(lng) + 0.000001 } }
        ]
      });
      
      if (!terrain) {
        terrain = await Terrain.findOne({
          $and: [
            { 'location.lat': { $gte: parseFloat(lat) - 0.0001, $lte: parseFloat(lat) + 0.0001 } },
            { 'location.lng': { $gte: parseFloat(lng) - 0.0001, $lte: parseFloat(lng) + 0.0001 } }
          ]
        });
      }
    } else {
      terrain = await Terrain.findById(id);
    }
    
    if (!terrain) {
      return NextResponse.json(
        { error: 'Terrain non trouvé' },
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

    const avatarPaths: { [key: string]: string } = {
      'default': '/default-avatar.jpg',
      'petanque_ball': '/avatars/avatar-2.jpg',
      'champion': '/avatars/champion.jpg',
      'golden_player': '/avatars/golden-player.jpg',
      'legend': '/avatars/legend.jpg'
    };

    const userImage = user.currentAvatar && user.currentAvatar !== 'default' 
      ? avatarPaths[user.currentAvatar] || '/default-avatar.jpg'
      : user.image || '/default-avatar.jpg';

    const comment = new Comment({
      terrainId: terrain._id,
      userId: session.user.email,
      userName: user.name,
      userImage: userImage,
      content: content.trim()
    });

    await comment.save();

    await User.findByIdAndUpdate(user._id, {
      $inc: { 
        'stats.commentsPosted': 1,
        points: 5
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du commentaire' },
      { status: 500 }
    );
  }
}
