import { User as NextAuthUser, Session as NextAuthSession } from "next-auth";

declare module "next-auth" {
  interface User extends NextAuthUser {
    id: string;
    role: string;
  }

  interface Session extends NextAuthSession {
    user?: {
      id?: string;
      role?: string;
    } & typeof NextAuthSession.user;
  }
}