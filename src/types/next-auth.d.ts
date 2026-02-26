import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id?: string
    username?: string
    role?: string
    email?: string
    name?: string
    image?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    username?: string
  }
}
