import { connectToDatabase } from '../../../../lib/mango';
import Terrain from '../../../../models/terrain';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { rateLimiters, getRateLimitIdentifier } from '../../../../lib/rateLimit';

export async function GET(req: Request) {
  const identifier = getRateLimitIdentifier(req);
  const { success } = await rateLimiters.general.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez patienter.' },
      { status: 429 }
    );
  }

  await connectToDatabase();
  const terrains = await Terrain.find({}).lean();
  return NextResponse.json(terrains);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
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

  const identifier = getRateLimitIdentifier(req, session.user.id);
  const { success, limit, reset, remaining } = await rateLimiters.addTerrain.limit(identifier);
  
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
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const address = formData.get('address') as string;

    if (!name || !description || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' }, 
        { status: 400 }
      );
    }

    let imageUrl = null;
    const file = formData.get('image') as File | null;

    if (file && file.size > 0) {
      const maxSize = 5 * 1024 * 1024; 
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'Fichier trop volumineux (max 5MB)' }, 
          { status: 400 }
        );
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Type de fichier non autorisé' }, 
          { status: 400 }
        );
      }

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    const newTerrain = await Terrain.create({
      name,
      description,
      location: { lat, lng, address },
      imageUrl,
      rating: { average: 0, count: 0, total: 0 },
      createdBy: session.user.id, 
      createdAt: new Date()
    });

    return NextResponse.json(newTerrain);
  } else {
    const data = await req.json();
    
    if (!data.name || !data.description || !data.location?.lat || !data.location?.lng) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' }, 
        { status: 400 }
      );
    }

    const newTerrain = await Terrain.create({
      ...data,
      createdBy: session.user.id,
      createdAt: new Date()
    });
    
    return NextResponse.json(newTerrain);
  }
}
