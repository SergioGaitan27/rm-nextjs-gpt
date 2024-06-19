import { useState } from 'react';
import { IProduct } from '@/types/interfaces';

interface ProductSearchProps {
  products: IProduct[];
  onAddProduct: (product: IProduct) => void;
}

const ProductSearch = ({ products, onAddProduct }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar producto..."
        className="p-2 border border-gray-300 rounded w-full text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul className="mt-4">
        {filteredProducts.map((product) => (
          <li key={product._id} className="p-2 border-b border-gray-300">
            <span>{product.name}</span>
            <button
              className="ml-4 bg-blue-500 text-white p-2 rounded"
              onClick={() => onAddProduct(product)}
            >
              Agregar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductSearch;