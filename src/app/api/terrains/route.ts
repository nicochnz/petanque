import { connectToDatabase } from '@/lib/mango';
import Terrain from '@/models/terrain';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path, { join } from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { rateLimiters, getRateLimitIdentifier } from '@/lib/rateLimit';
import type { Session } from 'next-auth';

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

  const identifier = getRateLimitIdentifier(req, session.user.email);
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

    let imageUrl = null;
    const file = formData.get('image') as File | null;

    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name}`;
        const path = join(process.cwd(), 'public', 'uploads', filename);
        await writeFile(path, buffer);
        imageUrl = `/uploads/${filename}`;
      } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        return NextResponse.json(
          { error: 'Erreur lors de l\'upload de l\'image' },
          { status: 500 }
        );
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
        _id: createdTerrain._id.toString()
      };

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

    const newTerrain = await Terrain.create({
      ...data,
      location: {
        lat: parseFloat(data.location.lat),
        lng: parseFloat(data.location.lng),
        address: data.location.address || ''
      },
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

    return NextResponse.json(newTerrain);
  }
}
