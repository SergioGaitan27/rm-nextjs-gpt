import Layout from '@/components/Layout';
import Link from 'next/link';

const Products = () => {
  return (
    <Layout>
      <div>
        <nav className="mb-8">
          <ul className="flex space-x-4">
            <li>
              <Link href="/products/new" legacyBehavior>
                <a className="text-yellow-400 hover:text-yellow-300">Nuevo producto</a>
              </Link>
            </li>
            <li>
              <Link href="/products/edit" legacyBehavior>
                <a className="text-yellow-400 hover:text-yellow-300">Modificar producto</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Layout>
  );
};

export default Products;