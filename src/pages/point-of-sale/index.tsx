import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Modal from 'react-modal';

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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [paymentModalIsOpen, setPaymentModalIsOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Efectivo');
  const [cashAmount, setCashAmount] = useState<number | null>(null);
  const [cardAmount, setCardAmount] = useState<number | null>(null);
  const [reference, setReference] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);
  const mixedCashInputRef = useRef<HTMLInputElement>(null);
  const mixedCardInputRef = useRef<HTMLInputElement>(null);
  const imageSize = 200; // Variable para modificar el tamaño del contenedor de la imagen

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

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (paymentModalIsOpen) {
      setSelectedPaymentMethod('Efectivo');
      setCashAmount(null);
      setCardAmount(null);
      setReference('');
      setTimeout(() => {
        if (cashInputRef.current) {
          cashInputRef.current.focus();
        }
      }, 0);
    }
  }, [paymentModalIsOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toUpperCase());
  };

  const handleAddToCart = (product: Product) => {
    const totalStock = product.stockLocations.reduce((total, loc) => total + loc.quantity, 0);
    const existingProduct = cart.find(item => item._id === product._id);
    const existingQuantity = existingProduct ? existingProduct.quantity : 0;
    if (existingQuantity + 1 > totalStock) {
      setModalMessage('No hay suficiente existencia para agregar más piezas de este producto.');
      setModalIsOpen(true);
      return;
    }

    setCart(prevCart => {
      if (existingProduct) {
        return [
          { ...existingProduct, quantity: existingProduct.quantity + 1 },
          ...prevCart.filter(item => item._id !== product._id)
        ];
      } else {
        return [{ ...product, quantity: 1 }, ...prevCart];
      }
    });

    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRemoveFromCart = (product: CartProduct) => {
    setCart(prevCart => prevCart.filter(item => item._id !== product._id));
  };

  const handleQuantityChange = (product: CartProduct, quantity: number) => {
    const totalStock = product.stockLocations.reduce((total, loc) => total + loc.quantity, 0);
    if (quantity > totalStock) {
      setModalMessage('No hay suficiente existencia para agregar más piezas de este producto.');
      setModalIsOpen(true);
      return;
    }

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const product = products.find(
        p => p.boxCode.toLowerCase() === searchTerm.toLowerCase() || p.productCode.toLowerCase() === searchTerm.toLowerCase()
      );
      if (product) {
        handleAddToCart(product);
      }
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setCashAmount(null);
    setCardAmount(null);
    setReference('');
    setTimeout(() => {
      if (method === 'Efectivo' && cashInputRef.current) {
        cashInputRef.current.focus();
      } else if (method === 'Tarjeta' && cardInputRef.current) {
        cardInputRef.current.focus();
      } else if (method === 'Mixto' && mixedCashInputRef.current) {
        mixedCashInputRef.current.focus();
      }
    }, 0);
  };

  const filteredProducts = products.filter((product) =>
    product.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateFontSize = (baseSize: number, imageSize: number) => {
    const factor = imageSize / 180;
    return `${baseSize / factor}px`;
  };

  const calculateChange = () => {
    return (cashAmount ?? 0) - getTotalPrice();
  };

  const isPaymentButtonDisabled = () => {
    const totalPrice = getTotalPrice();
    if (selectedPaymentMethod === 'Efectivo') {
      return (cashAmount ?? 0) < totalPrice;
    }
    if (selectedPaymentMethod === 'Tarjeta') {
      return !reference;
    }
    if (selectedPaymentMethod === 'Mixto') {
      return ((cashAmount ?? 0) + (cardAmount ?? 0)) < totalPrice;
    }
    return true;
  };

  return (
    <Layout>
      <div className="p-4 text-white rounded-lg h-[99%] flex flex-col bg-black">
        <div className="max-w-full mb-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Buscar productos por código de caja, código de producto o nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            ref={searchInputRef}
          />
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          <div className="flex-1 border border-yellow-400 bg-black p-4 rounded shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Productos</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {filteredProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="border border-yellow-400 p-4 rounded flex flex-row items-center bg-black cursor-pointer"
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.imageUrl && (
                      <div className="relative mr-4" style={{ width: `${imageSize-50}px`, height: `${imageSize}px` }}>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          layout="fill"
                          objectFit="contain"
                          className="rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold mb-2 text-white" style={{ fontSize: calculateFontSize(20, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>{product.name}</strong>
                      </h3>
                      <p className="text-gray-300 mb-1" style={{ fontSize: calculateFontSize(16, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>Código: </strong>{product.productCode}
                      </p>
                      <p className="text-gray-300 mb-1" style={{ fontSize: calculateFontSize(16, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>Precio menudeo: </strong>${product.price1.toFixed(2)} <strong style={{ color: 'yellow' }}> a partir de </strong>{product.price1MinQty} pieza
                      </p>
                      <p className="text-gray-300 mb-1" style={{ fontSize: calculateFontSize(16, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>Precio mayoreo: </strong>${product.price2.toFixed(2)} <strong style={{ color: 'yellow' }}> a partir de </strong>{product.price2MinQty} piezas
                      </p>
                      <p className="text-gray-300 mb-1" style={{ fontSize: calculateFontSize(16, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>Precio caja: </strong>${product.price3.toFixed(2)} <strong style={{ color: 'yellow' }}> a partir de </strong>{product.price3MinQty} piezas
                      </p>
                      <div className="text-gray-300 mb-1" style={{ fontSize: calculateFontSize(16, imageSize) }}>
                        <strong style={{ color: 'yellow' }}>Existencia por ubicación:</strong>
                        {product.stockLocations.map((location, index) => (
                          <p key={index}>
                            <strong style={{ color: 'yellow' }}>{location.location}: </strong>{location.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 border border-yellow-400 bg-black p-4 rounded shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Carrito</h2>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {cart.map(product => {
                  const { price, type } = getApplicablePrice(product);
                  return (
                    <div key={product._id} className="border border-yellow-400 p-4 rounded flex flex-row items-center bg-black">
                      {product.imageUrl && (
                        <div className="relative mr-4" style={{ width: `${imageSize}px`, height: `${imageSize}px` }}>
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            layout="fill"
                            objectFit="contain"
                            className="rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold mb-2 text-white">{product.name}</h3>
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
            <div className="mt-4 bg-black p-4 rounded shadow-lg">
              <div className="flex justify-between mb-4 bg-gray-700 p-2 rounded">
                <p className="font-bold text-xl">Total piezas:</p>
                <p className="text-2xl">{getTotalPieces()}</p>
              </div>
              <div className="flex justify-between mb-4 bg-gray-700 p-2 rounded">
                <p className="font-bold text-xl">Total a pagar:</p>
                <p className="text-3xl text-yellow-400">${getTotalPrice().toFixed(2)}</p>
              </div>
              <button 
                className="bg-blue-500 text-white p-2 rounded w-full font-bold"
                onClick={() => setPaymentModalIsOpen(true)}
              >
                Pagar
              </button>
              <button
                type="button"
                className="bg-red-500 text-white p-2 rounded w-full mt-2"
                onClick={() => setCart([])}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400 mb-4">{modalMessage}</p>
          <button
            onClick={() => setModalIsOpen(false)}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
          >
            Cerrar
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={paymentModalIsOpen}
        onRequestClose={() => setPaymentModalIsOpen(false)}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-black rounded-lg shadow-xl p-6 max-w-md w-full text-center border border-yellow-300">
          <h2 className="text-2xl font-bold text-white mb-4">Selecciona el método de pago</h2>
          <div className="flex justify-around mb-4">
            <button 
              className={`px-4 py-2 rounded ${selectedPaymentMethod === 'Efectivo' ? 'bg-yellow-400' : 'bg-gray-700'} text-white`}
              onClick={() => handlePaymentMethodChange('Efectivo')}
            >
              Efectivo
            </button>
            <button 
              className={`px-4 py-2 rounded ${selectedPaymentMethod === 'Tarjeta' ? 'bg-yellow-400' : 'bg-gray-700'} text-white`}
              onClick={() => handlePaymentMethodChange('Tarjeta')}
            >
              Tarjeta
            </button>
            <button 
              className={`px-4 py-2 rounded ${selectedPaymentMethod === 'Mixto' ? 'bg-yellow-400' : 'bg-gray-700'} text-white`}
              onClick={() => handlePaymentMethodChange('Mixto')}
            >
              Mixto
            </button>
          </div>
          <div className="text-yellow-400 text-3xl mb-4">
            Total a pagar: ${getTotalPrice().toFixed(2)}
          </div>
          {selectedPaymentMethod === 'Efectivo' && (
            <div className="text-white">
              <p>Ingresa el monto en efectivo:</p>
              <input 
                type="number" 
                className="w-full p-2 rounded text-black mt-2" 
                placeholder="Monto en efectivo" 
                value={cashAmount !== null ? cashAmount : ''}
                onChange={(e) => setCashAmount(parseFloat(e.target.value) || null)}
                ref={cashInputRef}
              />
              <p className="mt-4 text-3xl text-yellow-400">Cambio: ${calculateChange() >= 0 ? calculateChange().toFixed(2) : '0.00'}</p>
            </div>
          )}
          {selectedPaymentMethod === 'Tarjeta' && (
            <div className="text-white">
              <p>Referencia:</p>
              <input 
                type="text" 
                className="w-full p-2 rounded text-black mt-2 uppercase" 
                placeholder="Referencia" 
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                ref={cardInputRef}
              />
            </div>
          )}
          {selectedPaymentMethod === 'Mixto' && (
            <div className="text-white">
              <p>Ingresa el monto en efectivo:</p>
              <input 
                type="number" 
                className="w-full p-2 rounded text-black mt-2" 
                placeholder="Monto en efectivo" 
                value={cashAmount !== null ? cashAmount : ''}
                onChange={(e) => setCashAmount(parseFloat(e.target.value) || null)}
                ref={mixedCashInputRef}
              />
              <p>Ingresa el monto en tarjeta:</p>
              <input 
                type="number" 
                className="w-full p-2 rounded text-black mt-2" 
                placeholder="Monto en tarjeta" 
                value={cardAmount !== null ? cardAmount : ''}
                onChange={(e) => setCardAmount(parseFloat(e.target.value) || null)}
                ref={mixedCardInputRef}
              />
              <p>Referencia:</p>
              <input 
                type="text" 
                className="w-full p-2 rounded text-black mt-2 uppercase" 
                placeholder="Referencia" 
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
              />
            </div>
          )}
          <button
            onClick={() => setPaymentModalIsOpen(false)}
            className={`px-4 py-2 mt-4 w-full rounded-md ${isPaymentButtonDisabled() ? 'bg-gray-500 text-gray-300' : 'bg-yellow-400 text-black hover:bg-yellow-500'}`}
            disabled={isPaymentButtonDisabled()}
          >
            Confirmar Pago
          </button>
          <button
            onClick={() => setPaymentModalIsOpen(false)}
            className="px-4 py-2 mt-2 w-full bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Cancelar
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default PointOfSale;
