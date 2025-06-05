import { auth } from './auth';
import { NextResponse } from 'next/server';

export async function requireAuth(req: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Non autorisé - Connexion requise' }, 
      { status: 401 }
    );
  }
  
  return session;
}

export async function requireNonGuest(req: Request) {
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