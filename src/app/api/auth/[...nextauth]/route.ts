import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
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
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string || 'user'
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || (account?.provider === 'guest' ? 'guest' : 'user')
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }