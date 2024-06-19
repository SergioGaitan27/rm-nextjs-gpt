import Layout from '@/components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface IStockLocation {
  location: string;
  quantity: number;
}

interface IProduct {
  _id: string;
  boxCode: string;
  productCode: string;
  name: string;
  piecesPerBox: number;
  cost: number;
  price1: number;
  price1MinQty: number;
  price2: number;
  price2MinQty: number;
  price3: number;
  price3MinQty: number;
  price4?: number;
  price5?: number;
  stockLocations: IStockLocation[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const Products = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-black"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="table-auto w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-center border border-gray-300">Código de caja</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Código de producto</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Nombre del producto</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Número de piezas por caja</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Costo</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Precio menudeo</th>
                  <th className="py-3 px-6 text-center border border-gray-300">A partir de</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Precio mayoreo</th>
                  <th className="py-3 px-6 text-center border border-gray-300">A partir de</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Precio caja</th>
                  <th className="py-3 px-6 text-center border border-gray-300">A partir de</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Precio 4</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Precio 5</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Ubicación</th>
                  <th className="py-3 px-6 text-center border border-gray-300">Imagen</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.boxCode}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.productCode}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.name}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.piecesPerBox}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.cost}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.price1}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.price1MinQty}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.price2}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.price2MinQty}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.price3}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">{product.price3MinQty}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.price4}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">${product.price5}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">
                      {product.stockLocations.map((location, index) => (
                        <div key={index}>
                          {location.location}: {location.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-6 text-center whitespace-nowrap border border-gray-300">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} width={50} height={50} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;