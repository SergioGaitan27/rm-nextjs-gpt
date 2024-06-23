import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import axios from 'axios';
import Image from 'next/image';
import Modal from 'react-modal';

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

const Transfers = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<Partial<IProduct>>({});
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [transferQuantity, setTransferQuantity] = useState<number | ''>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number | ''>('');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();

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

  useEffect(() => {
    if (selectedProductId) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`/api/products/${selectedProductId}`);
          setProductData(response.data);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [selectedProductId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleTransferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert('Por favor seleccione un producto.');
      return;
    }

    if (fromLocation && toLocation && typeof transferQuantity === 'number' && transferQuantity > 0) {
      // Transferencia de existencias entre ubicaciones
      try {
        const response = await axios.put(`/api/products/transfer?id=${selectedProductId}`, {
          fromLocation,
          toLocation,
          transferQuantity,
        });

        if (response.status === 200) {
          setSuccessMessage('Transferencia realizada exitosamente');
          setSuccessModalIsOpen(true);
          setFromLocation('');
          setToLocation('');
          setTransferQuantity('');
          setProductData(response.data);
        } else {
          console.error('Error transferring stock');
        }
      } catch (error) {
        console.error('Error transferring stock:', error);
      }
    } else if (newLocation && typeof newQuantity === 'number' && newQuantity > 0) {
      // Agregar nueva ubicación con existencias
      try {
        const response = await axios.put(`/api/products/add-location?id=${selectedProductId}`, {
          newLocation,
          newQuantity,
        });

        if (response.status === 200) {
          setSuccessMessage('Nueva ubicación agregada exitosamente');
          setSuccessModalIsOpen(true);
          setNewLocation('');
          setNewQuantity('');
          setProductData(response.data);
        } else {
          console.error('Error adding new location');
        }
      } catch (error) {
        console.error('Error adding new location:', error);
      }
    } else {
      alert('Por favor complete todos los campos necesarios.');
    }
  };

  const handleCancel = () => {
    setSelectedProductId(null);
    setShowAddLocation(false);
    setFromLocation('');
    setToLocation('');
    setTransferQuantity('');
    setNewLocation('');
    setNewQuantity('');
    router.reload();
  };

  const handleCloseModal = () => {
    setSuccessModalIsOpen(false);
    router.reload();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, setState: React.Dispatch<React.SetStateAction<string>>) => {
    setState(event.target.value.toUpperCase());
  };

  const filteredProducts = products.filter((product) =>
    product.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="max-w-full mb-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Buscar productos por código de caja, código de producto o nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="max-w-full overflow-x-auto">
          <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!selectedProductId &&
              filteredProducts.map((product) => (
                <li
                  key={product._id}
                  className={`p-4 border border-yellow-400 rounded cursor-pointer ${selectedProductId === product._id ? 'bg-yellow-400 text-black' : ''}`}
                  onClick={() => handleProductSelect(product._id)}
                >
                  {product.imageUrl && (
                    <div className="mb-2">
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        width={100} 
                        height={100} 
                        className="object-cover rounded"
                        style={{ width: '100px', height: '100px' }} // Asegurando tamaño uniforme
                      />
                    </div>
                  )}
                  <div className="text-sm">
                    <p><strong style={{ color: 'yellow' }}>Código de caja:</strong > {product.boxCode}</p>
                    <p><strong style={{ color: 'yellow' }}>Código de producto:</strong> {product.productCode}</p>
                    <p><strong style={{ color: 'yellow' }}>Nombre:</strong> {product.name}</p>
                    <p><strong style={{ color: 'yellow' }}>Piezas por Caja:</strong> {product.piecesPerBox}</p>
                    <p><strong style={{ color: 'yellow' }}>Costo:</strong> ${product.cost}</p>
                    <p><strong style={{ color: 'yellow' }}>Precio menudeo:</strong> ${product.price1}<strong> | A partir de:</strong> {product.price1MinQty}</p>
                    <p><strong style={{ color: 'yellow' }}>Precio mayoreo:</strong> ${product.price2}<strong> | A partir de:</strong> {product.price2MinQty}</p>
                    <p><strong style={{ color: 'yellow' }}>Precio caja:</strong> ${product.price3}<strong> | A partir de:</strong> {product.price3MinQty}</p>
                    <p><strong style={{ color: 'yellow' }}>Precio 4:</strong> ${product.price4}</p>
                    <p><strong style={{ color: 'yellow' }}>Precio 5:</strong> ${product.price5}</p>
                    <p><strong style={{ color: 'yellow' }}>Ubicación:</strong></p>
                    {product.stockLocations.map((location, index) => (
                      <div key={index}>
                        {location.location}: {location.quantity}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
          {selectedProductId && productData && (
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <fieldset className="border border-yellow-400 p-4 rounded">
                <legend className="text-xl font-bold text-yellow-400">Transferencia de Existencias</legend>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Cantidad actual en cada ubicación:</h3>
                  <ul>
                    {productData.stockLocations?.map((location, index) => (
                      <li key={index} className="text-white">
                        <strong style={{ color: 'yellow' }}>{location.location}</strong>: {location.quantity} piezas
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Desde Ubicación:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                    >
                      <option value="">Seleccione Ubicación</option>
                      {productData.stockLocations?.map((location, index) => (
                        <option key={index} value={location.location}>{location.location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Hacia Ubicación:</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                    >
                      <option value="">Seleccione Ubicación</option>
                      {productData.stockLocations?.map((location, index) => (
                        <option key={index} value={location.location}>{location.location}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2">Cantidad a Transferir:</label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value={transferQuantity}
                      onChange={(e) => setTransferQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      min="1"
                    />
                  </div>
                </div>
              </fieldset>
              {showAddLocation && (
                <fieldset className="border border-yellow-400 p-4 rounded">
                  <legend className="text-xl font-bold text-yellow-400">Agregar Nueva Ubicación</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2">Nueva Ubicación:</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        value={newLocation}
                        onChange={(e) => handleInputChange(e, setNewLocation)}
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Cantidad Inicial:</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                </fieldset>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  className="bg-green-500 text-white p-2 rounded"
                  onClick={() => setShowAddLocation(!showAddLocation)}
                >
                  {showAddLocation ? 'Cancelar' : 'Añadir Ubicación'}
                </button>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded w-full"
                >
                  Confirmar
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="bg-red-500 text-white p-2 rounded w-full"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal
        isOpen={successModalIsOpen}
        onRequestClose={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
          <h2 className="text-2xl font-bold text-white mb-4">Éxito</h2>
          <p className="text-gray-400 mb-4">{successMessage}</p>
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Transfers;
