import { connectToDatabase } from '../../../../lib/mango';
import Terrain from '../../../../models/Terrain';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  await connectToDatabase();
  const terrains = await Terrain.find({}).lean();
  return NextResponse.json(terrains);
}

export async function POST(req: Request) {
  await connectToDatabase();

  // Vérifie si c'est un formData (multipart)
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);
    const address = formData.get('address') as string;

    let imageUrl = null;
    const file = formData.get('image') as File | null;

    if (file && file.size > 0) {
      // Crée le dossier uploads si besoin
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Génère un nom de fichier unique
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // Lis le buffer du fichier
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Sauvegarde le fichier
      await writeFile(filePath, buffer);

      imageUrl = `/uploads/${fileName}`;
    }

    // Sauvegarde en base
    const newTerrain = await Terrain.create({
      name,
      description,
      location: { lat, lng, address },
      imageUrl,
    });

    return NextResponse.json(newTerrain);
  } else {
    // fallback JSON (pour compatibilité)
    const data = await req.json();
    const newTerrain = await Terrain.create(data);
    return NextResponse.json(newTerrain);
  }
}
