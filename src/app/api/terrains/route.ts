import { connectToDatabase } from '../../../../lib/mango';
import Terrain from '../../../../models/terrain';
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
      rating: { average: 0, count: 0, total: 0 }
    });

    return NextResponse.json(newTerrain);
  } else {
    const data = await req.json();
    const newTerrain = await Terrain.create(data);
    return NextResponse.json(newTerrain);
  }
}
