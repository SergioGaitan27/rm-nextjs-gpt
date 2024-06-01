import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from "@/app/libs/mongodb";
import User from '@/models/User';  // Asegúrate de que la ruta del import es correcta

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        // Verificar si credentials es undefined
        if (!credentials) {
          return null;  // O podrías lanzar un error dependiendo de tu caso de uso
        }

        await connectDB();

        const user = await User.findOne({
          username: credentials.username,
          password: credentials.password,  // Deberías usar hashing para las contraseñas
        });

        if (user) {
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } else {
          return null;
        }
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