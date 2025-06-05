import 'next-auth';
import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id?: string;
    username?: string;
    role?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      role?: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    username?: string;
  }
} 