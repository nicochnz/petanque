import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './mango'
import { User } from '@/models/user'

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
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        await connectToDatabase()
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          // Créer un nouvel utilisateur
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'user',
          })
        }
        
        return true
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          await connectToDatabase()
          const user = await User.findOne({ email: session.user.email })
          
          if (user) {
            session.user = {
              ...session.user,
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              image: user.image,
              username: user.username,
              role: user.role,
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de la session:', error)
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
}

const nextAuth = NextAuth(authOptions)

export const { handlers, auth, signIn, signOut } = nextAuth
export default nextAuth