import { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';

interface StockLocation {
  location: string;
  quantity: number;
}

interface Product {
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
  stockLocations: StockLocation[];
  imageUrl?: string;
}

interface CartProduct extends Product {
  quantity: number;
}

const PointOfSale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingProduct = prevCart.find(item => item._id === product._id);
      if (existingProduct) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (product: CartProduct) => {
    setCart(prevCart => prevCart.filter(item => item._id !== product._id));
  };

  const handleQuantityChange = (product: CartProduct, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === product._id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const getApplicablePrice = (product: CartProduct) => {
    if (product.quantity >= product.price3MinQty) return { price: product.price3, type: "Precio caja" };
    if (product.quantity >= product.price2MinQty) return { price: product.price2, type: "Precio mayoreo" };
    return { price: product.price1, type: "Precio menudeo" };
  };

  const getTotalPieces = () => {
    return cart.reduce((total, product) => total + product.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, product) => {
      const { price } = getApplicablePrice(product);
      return total + price * product.quantity;
    }, 0);
  };

  return (
    <Layout>
      <div className="p-4 bg-gray-800 text-white rounded-lg h-[99%] flex flex-col">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar producto"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border border-gray-300 rounded text-black"
          />
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          <div className="flex-1 bg-gray-700 p-4 rounded shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Productos</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {products
                  .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(product => (
                    <div key={product._id} className="bg-gray-800 p-4 rounded flex flex-row items-center">
                      {product.imageUrl && (
                        <div className="relative w-24 h-24 mr-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                        <p className="text-gray-300 mb-1">Precio menudeo: ${product.price1.toFixed(2)} a partir de {product.price1MinQty} piezas</p>
                        <p className="text-gray-300 mb-1">Precio mayoreo: ${product.price2.toFixed(2)} a partir de {product.price2MinQty} piezas</p>
                        <p className="text-gray-300 mb-1">Precio caja: ${product.price3.toFixed(2)} a partir de {product.price3MinQty} piezas</p>
                        <div className="text-gray-300 mb-1">
                          <p className="font-bold">Existencia por ubicación:</p>
                          {product.stockLocations.map((location, index) => (
                            <p key={index}>
                              {location.location}: {location.quantity}
                            </p>
                          ))}
                        </div>
                      </div>
                      <button
                        className="bg-green-500 text-white p-4 rounded ml-4 text-lg font-bold"
                        onClick={() => handleAddToCart(product)}
                      >
                        Agregar a la nota
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gray-700 p-4 rounded shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Carrito</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {cart.map(product => {
                  const { price, type } = getApplicablePrice(product);
                  return (
                    <div key={product._id} className="bg-gray-800 p-4 rounded flex flex-row items-center">
                      {product.imageUrl && (
                        <div className="relative w-24 h-24 mr-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                        <p className="text-gray-300 mb-1">Precio: ${price.toFixed(2)} ({type})</p>
                        <div className="flex items-center">
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() => handleQuantityChange(product, product.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(product, parseInt(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            className="w-16 p-2 text-black rounded text-center"
                          />
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                            onClick={() => handleQuantityChange(product, product.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="bg-red-500 text-white p-2 rounded ml-4"
                        onClick={() => handleRemoveFromCart(product)}
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 sticky bottom-0 bg-gray-900 p-4 rounded shadow-lg">
              <div className="flex justify-between mb-4 bg-gray-700 p-2 rounded">
                <p className="text-lg font-bold">Total piezas:</p>
                <p className="text-2xl">{getTotalPieces()}</p>
              </div>
              <div className="flex justify-between mb-4 bg-gray-700 p-2 rounded">
                <p className="text-lg font-bold">Total a pagar:</p>
                <p className="text-2xl">${getTotalPrice().toFixed(2)}</p>
              </div>
              <button className="bg-blue-500 text-white p-2 rounded w-full text-lg font-bold">Pagar</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PointOfSale;