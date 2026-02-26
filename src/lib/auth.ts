import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '@/lib/mango'
import { User as UserModel } from '@/models/user'

const DB_REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

const authOptions: NextAuthOptions = {
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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase();
          const existingUser = await UserModel.findOne({ email: user.email });

          if (!existingUser) {
            const created = await UserModel.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'user'
            });
            user.id = created._id.toString();
            user.role = 'user';
          } else {
            user.id = existingUser._id.toString();
            user.role = existingUser.role || 'user';
            user.username = existingUser.username;
            user.image = existingUser.image;
            user.name = existingUser.name;
          }
        } catch (error) {
          console.error('Erreur DB lors du signIn (non bloquant):', error);
          // Don't block login if DB is slow -- JWT callback will sync later
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.dbId = user.id;
        token.role = user.role || (account?.provider === 'guest' ? 'guest' : 'user');
        token.username = user.username;
        token.image = user.image;
        token.name = user.name;
        token.lastDbSync = Date.now();
      }

      if (trigger === 'update') {
        token.lastDbSync = 0;
      }

      const needsRefresh = !token.lastDbSync || (Date.now() - (token.lastDbSync as number)) > DB_REFRESH_INTERVAL_MS;

      if (needsRefresh && token.email && token.role !== 'guest') {
        try {
          await connectToDatabase();
          const dbUser = await UserModel.findOne({ email: token.email });
          if (dbUser) {
            token.dbId = dbUser._id.toString();
            token.name = dbUser.name;
            token.image = dbUser.image;
            token.username = dbUser.username;
            token.role = dbUser.role || 'user';
          }
          token.lastDbSync = Date.now();
        } catch {
          // Keep stale data on error, retry next time
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = (token.dbId as string) || token.sub!;
        session.user.role = (token.role as string) || 'user';
        session.user.username = token.username as string | undefined;
        if (token.image) session.user.image = token.image as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

export default authOptions
