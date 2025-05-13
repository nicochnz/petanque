import { connectToDatabase } from '../../../../lib/mango';
import Terrain from '../../../../models/terrain';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  const terrains = await Terrain.find({});
  return NextResponse.json(terrains);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const newTerrain = await Terrain.create(data);
  return NextResponse.json(newTerrain);
}
