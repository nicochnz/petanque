import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { connectToDatabase } from '@/lib/mango';
import { User } from '@/models/user';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    console.log('Début de la mise à jour du profil');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.email) {
      console.log('Pas de session ou pas d\'email');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Données reçues:', body);
    const { name, username, image } = body;

    if (!name && !username && !image) {
      console.log('Aucune donnée à mettre à jour');
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      console.log('Base de données connectée');
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données' },
        { status: 500 }
      );
    }

    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await User.findOne({ email: session.user.email });
      console.log('Utilisateur existant:', existingUser);

      if (!existingUser) {
        console.log('Création d\'un nouvel utilisateur');
        // Créer un nouvel utilisateur s'il n'existe pas
        const newUser = await User.create({
          email: session.user.email,
          name: name || session.user.name,
          username: username || session.user.username,
          image: image || session.user.image,
          role: 'user'
        });
        console.log('Nouvel utilisateur créé:', newUser);

        return NextResponse.json({
          success: true,
          user: {
            name: newUser.name,
            username: newUser.username,
            image: newUser.image,
            email: newUser.email
          }
        });
      }

      // Mettre à jour l'utilisateur existant
      const updateData: Record<string, string | Date> = {};
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (image) updateData.image = image;
      updateData.updatedAt = new Date();

      console.log('Données de mise à jour:', updateData);

      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: updateData },
        { new: true }
      );
      console.log('Utilisateur mis à jour:', updatedUser);

      if (!updatedUser) {
        console.log('Erreur: Utilisateur non trouvé après mise à jour');
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          name: updatedUser.name,
          username: updatedUser.username,
          image: updatedUser.image,
          email: updatedUser.email
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
} 