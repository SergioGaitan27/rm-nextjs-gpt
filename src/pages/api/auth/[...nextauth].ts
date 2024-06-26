import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/app/libs/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error('Credenciales no proporcionadas');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).lean();

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Contraseña incorrecta');
        }

        return {
          id: user._id.toString(),
          name: user.username || '',
          email: user.email || '',
          role: user.role || '',
          location: user.location || '',
          businessId: user.businessId || '0',
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // Tiempo de vida de la sesión en segundos (30 días)
    updateAge: 24 * 60 * 60,  // Frecuencia con la que se actualiza la sesión en segundos (1 día)
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.location = user.location;
        token.businessId = user.businessId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          email: token.email as string,
          name: token.name as string,
          location: token.location as string,
          businessId: token.businessId as string,
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',  // Redirige a login en caso de error
  },
  secret: process.env.NEXTAUTH_SECRET, // Asegúrate de tener el secret configurado
});
