import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/app/libs/mongodb';
import User from '@/models/User';  // Asegúrate de que la ruta del import es correcta
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },  // Cambiado de username a email
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials) {
          throw new Error('Credenciales no proporcionadas');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });  // Cambiado para buscar por email

        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('Contraseña incorrecta');
        }

        return { id: user._id, name: user.username, email: user.email, role: user.role };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user = session.user ?? {};
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
});