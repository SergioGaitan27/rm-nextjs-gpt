import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Modal from 'react-modal';
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
  image?: File;
  createdAt: string;
  updatedAt: string;
}

const EditProduct = () => {
  const [productData, setProductData] = useState<Partial<IProduct>>({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errors, setErrors] = useState({
    price1: '',
    price2: '',
    price3: '',
    price4: '',
    price5: '',
  });
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [imageContainerSize, setImageContainerSize] = useState(200); // Tamaño del contenedor de la imagen
  const router = useRouter();
  const { id } = router.query;

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (typeof index === 'number') {
      const stockLocations = [...(productData.stockLocations || [])];
      stockLocations[index] = { ...stockLocations[index], [name]: value };
      setProductData({ ...productData, stockLocations });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      if (typeof index === 'number') {
        const stockLocations = [...(productData.stockLocations || [])];
        stockLocations[index] = { ...stockLocations[index], [name]: parseFloat(value) };
        setProductData({ ...productData, stockLocations });
      } else {
        setProductData(prev => ({ ...prev, [name]: parseFloat(value) }));
        if (['price1', 'price2', 'price3', 'price4', 'price5'].includes(name)) {
          validatePrice(name, parseFloat(value));
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const validatePrice = (name: string, value: number) => {
    const cost = productData.cost ?? 0;
    if (value < cost) {
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        {!selectedProductId && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar producto"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded text-black"
            />
          </div>
        )}
        <ul className="mb-4">
          {!selectedProductId &&
            filteredProducts.map((product) => (
              <li
                key={product._id}
                className={`p-2 cursor-pointer ${selectedProductId === product._id ? 'bg-yellow-400 text-black' : ''}`}
                onClick={() => handleProductSelect(product._id)}
              >
                {product.name}
              </li>
            ))}
        </ul>
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">Código de producto:</label>
                  <input
                    type="text"
                    name="productCode"
                    value={productData.productCode ?? ''}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">Nombre del producto:</label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name ?? ''}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-2">Número de piezas por caja:</label>
                  <input
                    type="text"
                    name="piecesPerBox"
                    value={productData.piecesPerBox?.toString() ?? ''}
                    onChange={handleNumericChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div className="col-span-1 md:col-span-1">
                  <label className="block mb-2">Precio menudeo:</label>
                  <input
                    type="text"
                    name="price1"
                    value={productData.price1?.toString() || ''}
                    onChange={handleNumericChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div className="col-span-1 md:col-span-1">
                  <label className="block mb-2">Precio mayoreo:</label>
                  <input
                    type="text"
                    name="price2"
                    value={productData.price2?.toString() || ''}
                    onChange={handleNumericChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div className="col-span-1 md:col-span-1">
                  <label className="block mb-2">Precio caja:</label>
                  <input
                    type="text"
                    name="price3"
                    value={productData.price3?.toString() || ''}
                    onChange={handleNumericChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
                  />
                </div>
                <div className="col-span-1 md:col-span-1">
                  <label className="block mb-2">Precio 4:</label>
                  <input
                    type="text"
                    name="price4"
                    value={productData.price4?.toString() || ''}
                    onChange={handleNumericChange}
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
                    className="w-full p-2 bg-black border border-gray-700 rounded"
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
          </form>
        )}
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
      </div>
    </Layout>
  );
};

export default EditProduct;