import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const Unauthorized = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Acceso no autorizado</h1>
        <p className="mb-8">No tienes permisos para acceder a esta página.</p>
        <button
          onClick={handleBack}
          className="bg-yellow-500 text-black p-2 rounded"
        >
          Volver al Inicio
        </button>
      </div>
    </Layout>
  );
};

export default Unauthorized;
