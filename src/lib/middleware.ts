import authOptions from './auth';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';

export async function requireAuth(req: Request): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Non autorisé - Connexion requise' }, 
      { status: 401 }
    );
  }
  
  return session;
}

export async function requireNonGuest(req: Request): Promise<Session | NextResponse> {
  const session = await requireAuth(req);
  
  if (session instanceof NextResponse) return session;
  
  if (session.user.role === 'guest') {
    return NextResponse.json(
      { error: 'Non autorisé - Fonctionnalité non disponible pour les invités' }, 
      { status: 403 }
    );
  }
  
  return session;
} 