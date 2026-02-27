import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';
import { User } from '@/models/user';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { rateLimiters, getRateLimitIdentifier } from '@/lib/rateLimit';
import type { Session } from 'next-auth';

export async function GET(req: Request) {
  const { success } = await rateLimiters.general.limit(getRateLimitIdentifier(req));
  
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter.' },
      { status: 429 }
    );
  }

  await connectToDatabase();
  const terrains = await Terrain.find({ isDeleted: { $ne: true } }).lean();
  return NextResponse.json(terrains);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Non autorisé - Connexion requise' }, 
      { status: 401 }
    );
  }

  if (session.user.role === 'guest') {
    return NextResponse.json(
      { error: 'Non autorisé - Les invités ne peuvent pas ajouter de terrains' }, 
      { status: 403 }
    );
  }

  const { success, limit, reset, remaining } = await rateLimiters.addTerrain.limit(getRateLimitIdentifier(req, session.user.email));
  
  if (!success) {
    return NextResponse.json(
      { 
        error: `Limite d'ajout de terrains atteinte (${limit} par heure). Réessayez dans ${Math.round((reset - Date.now()) / 1000 / 60)} minutes.`,
        retryAfter: reset 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  await connectToDatabase();

  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const lat = formData.get('lat') as string;
    const lng = formData.get('lng') as string;
    const address = formData.get('address') as string;

    if (!name || !description || !lat || !lng) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' }, 
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: 'Coordonnées invalides' }, 
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    const file = formData.get('image') as File | null;

    if (file && file.size > 0) {
      try {
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const pathname = `terrains/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

        if (process.env.BLOB_READ_WRITE_TOKEN) {
          const blob = await put(pathname, file, {
            access: 'public',
            addRandomSuffix: false,
            contentType: file.type || undefined
          });
          imageUrl = blob.url;
        } else {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
          const uploadPath = join(process.cwd(), 'public', 'uploads', filename);
          await writeFile(uploadPath, buffer);
          imageUrl = `/uploads/${filename}`;
        }
      } catch (error) {
        console.error('Upload image ignoré:', error);
      }
    }

    try {
      const newTerrain = await Terrain.create({
        name,
        description,
        location: { 
          lat: latNum, 
          lng: lngNum,
          address: address || ''
        },
        imageUrl,
        rating: { average: 0, count: 0, total: 0 },
        createdBy: session.user.email,
        createdAt: new Date()
      });

      // Récupérer le terrain créé avec toutes ses données
      const createdTerrain = await Terrain.findById(newTerrain._id).lean();
      
      if (!createdTerrain) {
        return NextResponse.json(
          { error: 'Erreur lors de la création du terrain' },
          { status: 500 }
        );
      }

      // Convertir l'ID en string pour la sérialisation JSON
      const terrainResponse = {
        ...createdTerrain,
        _id: (createdTerrain as { _id: { toString(): string } })._id?.toString() || newTerrain._id.toString()
      };

      // Attribuer des points pour la création du terrain
      await User.findOneAndUpdate(
        { email: session.user.email },
        { 
          $inc: { 
            'stats.terrainsCreated': 1,
            points: 10
          }
        }
      );

      return NextResponse.json(terrainResponse);
    } catch (error) {
      console.error('Erreur lors de la création du terrain:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du terrain' },
        { status: 500 }
      );
    }
  } else {
    const data = await req.json();
    
    if (!data.name || !data.description || !data.location?.lat || !data.location?.lng) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' }, 
        { status: 400 }
      );
    }

    const latNum = parseFloat(data.location.lat);
    const lngNum = parseFloat(data.location.lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { error: 'Coordonnées invalides' }, 
        { status: 400 }
      );
    }

    const newTerrain = await Terrain.create({
      name: String(data.name).slice(0, 200),
      description: String(data.description).slice(0, 2000),
      location: {
        lat: latNum,
        lng: lngNum,
        address: data.location.address ? String(data.location.address).slice(0, 500) : ''
      },
      imageUrl: data.imageUrl || null,
      rating: { average: 0, count: 0, total: 0 },
      createdBy: session.user.email,
      createdAt: new Date()
    });

    if (!newTerrain) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du terrain' },
        { status: 500 }
      );
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $inc: { 
          'stats.terrainsCreated': 1,
          points: 10
        }
      }
    );

    return NextResponse.json(newTerrain);
  }
}
