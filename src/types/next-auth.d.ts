import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      location: string;
      businessId: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    location: string;
    businessId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    location: string;
    businessId: string;
  }
}
