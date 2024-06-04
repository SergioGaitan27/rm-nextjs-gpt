import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold text-yellow-400">Bienvenido a la Aplicación</h1>
      <p className="mt-4 text-lg">Esta es la página de inicio accesible solo para usuarios autenticados.</p>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Redirigir según el rol del usuario
  const roleRedirects = {
    'Super Administrador': '/admin',
    'Administrador': '/admin',
    'Sistemas': '/sistemas',
    'Vendedor': '/vendedor',
    'Comprador': '/comprador',
  };

  const userRole = session.user.role as keyof typeof roleRedirects;

  if (roleRedirects[userRole]) {
    return {
      redirect: {
        destination: roleRedirects[userRole],
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Home;