import NextAuth, { type NextAuthOptions } from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { connectToDatabase } from '@/lib/mango'
import { User } from '@/models/user'

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    }
  }

  interface User {
    role?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    sub?: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'guest',
      name: 'Invité',
      credentials: {},
      async authorize() {
        return {
          id: 'guest-' + Date.now(),
          name: 'Invité',
          email: 'guest@localhost',
          image: '/guest-avatar.png',
          role: 'guest'
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: User, account: { provider?: string } | null }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'user'
            });
          }
        } catch (error) {
          console.error('Erreur lors de la création/mise à jour de l\'utilisateur:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.role = token.role || 'user';
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user, account }: { 
      token: JWT, 
      user: User | null, 
      account: { provider?: string } | null 
    }) {
      if (user) {
        token.role = user.role || (account?.provider === 'guest' ? 'guest' : 'user');
        token.username = user.username;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }