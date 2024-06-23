import Layout from '@/components/Layout';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import Modal from 'react-modal';
import { useRouter } from 'next/router';

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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productData, setProductData] = useState<Partial<IProduct>>({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    price1: '',
    price2: '',
    price3: '',
    price4: '',
    price5: '',
  });
  const [imageContainerSize, setImageContainerSize] = useState(200);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const router = useRouter();

  const linkVariants = {
    hover: {
      scale: 1.1,
      backgroundColor: '#fbbf24', // color amarillo
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
      backgroundColor: '#fbbf24', // color amarillo
      transition: { duration: 0.3 },
    },
  };

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

  useEffect(() => {
    if (selectedProductId && inputRefs.current['boxCode']) {
      inputRefs.current['boxCode']?.focus();
      inputRefs.current['boxCode']?.select();
    }
  }, [selectedProductId]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = (productId: string) => {
    setProductIdToDelete(productId);
    setConfirmationModalIsOpen(true);
  };

  const confirmDelete = async () => {
    if (!productIdToDelete) return;
    try {
      const response = await axios.delete(`/api/products/${productIdToDelete}`);
      if (response.status === 200) {
        setSuccessMessage('Producto eliminado exitosamente');
        setSuccessModalIsOpen(true);
        setProducts(products.filter(product => product._id !== productIdToDelete));
      } else {
        console.error('Error deleting product');
      }
    } catch (error) {
      setErrorMessage('Error eliminando el producto');
      setErrorModalIsOpen(true);
      console.error('Error deleting product:', error);
    } finally {
      setConfirmationModalIsOpen(false);
      setProductIdToDelete(null);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();
    if (typeof index === 'number') {
      const stockLocations = [...(productData.stockLocations || [])];
      stockLocations[index] = { ...stockLocations[index], [name]: upperValue };
      setProductData({ ...productData, stockLocations });
    } else {
      setProductData({ ...productData, [name]: upperValue });
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      const numericValue: number | "" = value === '' ? '' : parseFloat(value);
      if (typeof index === 'number') {
        const stockLocations = [...(productData.stockLocations || [])];
        stockLocations[index] = { ...stockLocations[index], [name]: numericValue };
        setProductData({ ...productData, stockLocations });
      } else {
        setProductData(prev => ({ ...prev, [name]: numericValue }));
        if (['price1', 'price2', 'price3', 'price4', 'price5'].includes(name)) {
          validatePrice(name, numericValue);
        }
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductData((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const validatePrice = (name: string, value: number | "") => {
    const cost = productData.cost ?? 0;
    if (typeof value === 'number' && typeof cost === 'number' && value < cost) {
      setErrors((prev) => ({
        ...prev,
        [name]: `El precio no puede ser menor que el costo $${cost}`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      const value = productData[key as keyof IProduct];
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'stockLocations') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    try {
      const response = await axios.put(`/api/products/${selectedProductId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200) {
        setModalIsOpen(true);
      } else {
        console.error('Error updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleCancel = () => {
    setSelectedProductId(null);
    setProductData({});
  };

  const filteredProducts = products.filter((product) =>
    product.boxCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <Layout>
      <div>
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
          {!selectedProductId && (
            <div className="max-w-full overflow-x-auto">
              <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <li
                  className="p-4 border border-yellow-400 rounded cursor-pointer flex flex-col items-center justify-center"
                  onClick={() => router.push('/products/new')}
                >
                  <span className="text-4xl text-yellow-400 mb-2">+</span>
                  <p className="text-sm text-yellow-400">Crear nuevo producto</p>
                </li>
                {filteredProducts.map((product) => (
                  <li key={product._id} className="p-4 border border-yellow-400 rounded relative">
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
                      <p><strong style={{ color: 'yellow' }}>Código de caja:</strong> {product.boxCode}</p>
                      <p><strong style={{ color: 'yellow' }}>Código de producto:</strong> {product.productCode}</p>
                      <p><strong style={{ color: 'yellow' }}>Nombre:</strong> {product.name}</p>
                      <p><strong style={{ color: 'yellow' }}>Piezas por Caja:</strong> {product.piecesPerBox}</p>
                      <p><strong style={{ color: 'yellow' }}>Costo:</strong> ${product.cost}</p>
                      <p><strong style={{ color: 'yellow' }}>Precio menudeo:</strong> ${product.price1}<strong style={{ color: 'yellow' }}> | A partir de:</strong> {product.price1MinQty}</p>
                      <p><strong style={{ color: 'yellow' }}>Precio mayoreo:</strong> ${product.price2}<strong style={{ color: 'yellow' }}> | A partir de:</strong> {product.price2MinQty}</p>
                      <p><strong style={{ color: 'yellow' }}>Precio caja:</strong> ${product.price3}<strong style={{ color: 'yellow' }}> | A partir de:</strong> {product.price3MinQty}</p>
                      <p><strong style={{ color: 'yellow' }}>Precio 4:</strong> ${product.price4}</p>
                      <p><strong style={{ color: 'yellow' }}>Precio 5:</strong> ${product.price5}</p>
                      <p><strong style={{ color: 'yellow' }}>Ubicación:</strong></p>
                      {product.stockLocations.map((location, index) => (
                        <div key={index}>
                          {location.location}: {location.quantity}
                        </div>
                      ))}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Menu menuButton={<MenuButton>⋮</MenuButton>}>
                        <MenuItem>
                          <button onClick={() => handleProductSelect(product._id)}>Modificar</button>
                        </MenuItem>
                        <MenuItem>
                          <button onClick={() => handleDelete(product._id)}>Eliminar</button>
                        </MenuItem>
                      </Menu>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedProductId && productData && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos del formulario */}
              <fieldset className="border border-yellow-400 p-4 rounded">
                <legend className="text-xl font-bold text-yellow-400">Información del Producto</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Código de caja:</label>
                    <input
                      type="text"
                      name="boxCode"
                      value={productData.boxCode ?? ''}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['boxCode'] = el; }}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Código de producto:</label>
                    <input
                      type="text"
                      name="productCode"
                      value={productData.productCode ?? ''}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['productCode'] = el; }}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Nombre del producto:</label>
                    <input
                      type="text"
                      name="name"
                      value={productData.name ?? ''}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['name'] = el; }}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Número de piezas por caja:</label>
                    <input
                      type="text"
                      name="piecesPerBox"
                      value={productData.piecesPerBox?.toString() ?? ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['piecesPerBox'] = el; }}
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Imagen del producto:</label>
                    {productData.imageUrl ? (
                      <div className="flex flex-col items-center">
                        <div
                          style={{
                            width: `${imageContainerSize}px`,
                            height: `${imageContainerSize}px`,
                            position: 'relative',
                          }}
                        >
                          <Image
                            src={productData.imageUrl}
                            alt="Product"
                            layout="fill"
                            objectFit="cover"
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setProductData(prev => ({ ...prev, imageUrl: undefined, image: undefined }))}
                          className="mt-2 bg-red-500 text-white p-2 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 bg-black border border-gray-700 rounded"
                      />
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Campos de precios y costos */}
              <fieldset className="border border-yellow-400 p-4 rounded">
                <legend className="text-xl font-bold text-yellow-400">Precios y Costo</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block mb-2">Costo:</label>
                    <input
                      type="text"
                      name="cost"
                      value={productData.cost?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['cost'] = el; }}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">Precio menudeo:</label>
                    <input
                      type="text"
                      name="price1"
                      value={productData.price1?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price1'] = el; }}
                    />
                    {errors.price1 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price1}</p>}
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">A partir de:</label>
                    <input
                      type="text"
                      name="price1MinQty"
                      value={productData.price1MinQty?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price1MinQty'] = el; }}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">Precio mayoreo:</label>
                    <input
                      type="text"
                      name="price2"
                      value={productData.price2?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price2'] = el; }}
                    />
                    {errors.price2 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price2}</p>}
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">A partir de:</label>
                    <input
                      type="text"
                      name="price2MinQty"
                      value={productData.price2MinQty?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price2MinQty'] = el; }}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">Precio caja:</label>
                    <input
                      type="text"
                      name="price3"
                      value={productData.price3?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price3'] = el; }}
                    />
                    {errors.price3 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price3}</p>}
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">A partir de:</label>
                    <input
                      type="text"
                      name="price3MinQty"
                      value={productData.price3MinQty?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price3MinQty'] = el; }}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">Precio 4:</label>
                    <input
                      type="text"
                      name="price4"
                      value={productData.price4?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price4'] = el; }}
                    />
                    {errors.price4 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price4}</p>}
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <label className="block mb-2">Precio 5:</label>
                    <input
                      type="text"
                      name="price5"
                      value={productData.price5?.toString() || ''}
                      onChange={handleNumericChange}
                      onFocus={handleFocus}
                      className="w-full p-2 bg-black border border-gray-700 rounded"
                      ref={el => { inputRefs.current['price5'] = el; }}
                    />
                    {errors.price5 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price5}</p>}
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded w-full"
              >
                Actualizar Producto
              </button>
              <button
                type="button"
                className="bg-red-500 text-white p-2 rounded w-full"
                onClick={handleCancel}
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
            <h2 className="text-2xl font-bold text-white mb-4">Actualización exitosa</h2>
            <p className="text-gray-400 mb-4">El producto ha sido actualizado exitosamente.</p>
            <button
              onClick={() => {
                setModalIsOpen(false);
                window.location.href = '/products';
              }}
              className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
            >
              Ver Productos
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={errorModalIsOpen}
          onRequestClose={() => setErrorModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-red-300">
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-gray-400 mb-4">{errorMessage}</p>
            <button
              onClick={() => setErrorModalIsOpen(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={successModalIsOpen}
          onRequestClose={() => setSuccessModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
            <h2 className="text-2xl font-bold text-white mb-4">Eliminación exitosa</h2>
            <p className="text-gray-400 mb-4">{successMessage}</p>
            <button
              onClick={() => setSuccessModalIsOpen(false)}
              className="px-4 py-2 bg-yellow-400 text-black rounded-md hover:bg-yellow-500"
            >
              Ver Productos
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={confirmationModalIsOpen}
          onRequestClose={() => setConfirmationModalIsOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50"
        >
          <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
            <h2 className="text-2xl font-bold text-white mb-4">Confirmación</h2>
            <p className="text-gray-400 mb-4">¿Está seguro que desea eliminar este producto?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirmationModalIsOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Products;
