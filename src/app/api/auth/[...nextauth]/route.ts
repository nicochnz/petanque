import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

// Étendre les types de session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    sub?: string;
  }
}

const handler = NextAuth({
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
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role || 'user'
      }
      return session
    },
    async jwt({ token, user, account }: { 
      token: JWT, 
      user: { role?: string } | null, 
      account: { provider?: string } | null 
    }) {
      if (user) {
        token.role = user.role || (account?.provider === 'guest' ? 'guest' : 'user')
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }