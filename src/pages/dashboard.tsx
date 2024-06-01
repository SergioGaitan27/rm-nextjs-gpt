import { useSession, signOut } from 'next-auth/react';

const DashboardPage = () => {
  const { data: session } = useSession({
    required: true, // Redirigir al login si no hay sesión
    onUnauthenticated() {
      // Función opcional que se ejecuta si no se autentica
      window.location.href = '/login';
    },
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {session?.user?.email}!</p>
      <button onClick={() => signOut()}>Cerrar sesión</button>
    </div>
  );
};

export default DashboardPage;