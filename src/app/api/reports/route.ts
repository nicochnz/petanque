import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { Report } from '@/models/report';
import Terrain from '@/models/terrain';
import { Comment } from '@/models/comment';
import { User } from '@/models/user';
import type { Session } from 'next-auth';

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
    const { type, targetId, reason, description } = await request.json();

    if (!type || !targetId || !reason) {
      return NextResponse.json(
        { error: 'Type, ID cible et raison requis' },
        { status: 400 }
      );
    }

    if (!['terrain', 'comment'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide' },
        { status: 400 }
      );
    }

    if (!['spam', 'inappropriate', 'offensive', 'fake', 'duplicate', 'other'].includes(reason)) {
      return NextResponse.json(
        { error: 'Raison invalide' },
        { status: 400 }
      );
    }

    let actualTargetId = targetId;
    if (type === 'terrain' && targetId.includes('--')) {
      const [lat, lng] = targetId.split('--');
      const terrain = await Terrain.findOne({ 
        $and: [
          { 'location.lat': { $gte: parseFloat(lat) - 0.000001, $lte: parseFloat(lat) + 0.000001 } },
          { 'location.lng': { $gte: parseFloat(lng) - 0.000001, $lte: parseFloat(lng) + 0.000001 } }
        ]
      });
      if (terrain) {
        actualTargetId = terrain._id.toString();
      }
    }

    const existingReport = await Report.findOne({
      type,
      targetId: actualTargetId,
      reporterId: session.user.email
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'Vous avez déjà signalé ce contenu' },
        { status: 400 }
      );
    }

    const report = new Report({
      type,
      targetId: actualTargetId,
      reporterId: session.user.email,
      reason,
      description: description?.trim()
    });

    await report.save();

    if (type === 'terrain') {
      let terrainId = targetId;
      if (targetId.includes('--')) {
        const [lat, lng] = targetId.split('--');
        const terrain = await Terrain.findOne({ 
          'location.lat': parseFloat(lat), 
          'location.lng': parseFloat(lng) 
        });
        if (!terrain) {
          return NextResponse.json(
            { error: 'Terrain non trouvé' },
            { status: 404 }
          );
        }
        terrainId = terrain._id.toString();
      }

      await Terrain.findByIdAndUpdate(terrainId, {
        $push: {
          reports: {
            userId: session.user.email,
            reason,
            description: description?.trim(),
            createdAt: new Date()
          }
        }
      });

      const terrainReports = await Terrain.findById(terrainId).select('reports');
      if (terrainReports && terrainReports.reports.length >= 2) {
        await Terrain.findByIdAndUpdate(terrainId, { isDeleted: true });
      }
    } else if (type === 'comment') {
      await Comment.findByIdAndUpdate(targetId, {
        $push: {
          reports: {
            userId: session.user.email,
            reason,
            description: description?.trim(),
            createdAt: new Date()
          }
        }
      });

      const commentReports = await Comment.findById(targetId).select('reports');
      if (commentReports && commentReports.reports.length >= 2) {
        await Comment.findByIdAndUpdate(targetId, { isDeleted: true });
      }
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $inc: { 'stats.reportsSubmitted': 1, points: 2 } }
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du signalement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du signalement' },
      { status: 500 }
    );
  }
}
