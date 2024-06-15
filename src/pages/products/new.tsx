import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Modal from 'react-modal';

const NewProduct = () => {
  const [productData, setProductData] = useState({
    boxCode: '',
    productCode: '',
    piecesPerBox: '',
    cost: '',
    price1: '',
    price2: '',
    price3: '',
    price4: '',
    price5: '',
    stockLocations: [{ location: '', quantity: '' }]
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errors, setErrors] = useState({
    price1: '',
    price2: '',
    price3: '',
    price4: '',
    price5: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    const upperValue = value.toUpperCase();
    if (typeof index === 'number') {
      const stockLocations = [...productData.stockLocations];
      stockLocations[index] = { ...stockLocations[index], [name]: upperValue };
      setProductData({ ...productData, stockLocations });
    } else {
      setProductData({ ...productData, [name]: upperValue });
    }
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) { // Permite solo números positivos y puntos (para decimales)
      if (typeof index === 'number') {
        const stockLocations = [...productData.stockLocations];
        stockLocations[index] = { ...stockLocations[index], [name]: value };
        setProductData({ ...productData, stockLocations });
      } else {
        setProductData(prev => ({ ...prev, [name]: value }));
        validatePrice(name, value);
      }
    }
  };

  const validatePrice = (name: string, value: string) => {
    const cost = parseFloat(productData.cost);
    const price = parseFloat(value);
    if (price < cost) {
      setErrors(prev => ({ ...prev, [name]: `El precio no puede ser menor que el costo $${cost}` }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddLocation = () => {
    setProductData({
      ...productData,
      stockLocations: [...productData.stockLocations, { location: '', quantity: '' }]
    });
  };

  const handleRemoveLocation = (index: number) => {
    const stockLocations = [...productData.stockLocations];
    stockLocations.splice(index, 1);
    setProductData({ ...productData, stockLocations });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (response.ok) {
        console.log('Producto registrado exitosamente');
        setModalIsOpen(true);
      } else {
        console.error('Error registrando el producto');
      }
    } catch (error) {
      console.error('Error registrando el producto:', error);
    }
  };

  const checkFormValidity = useCallback(() => {
    const {
      boxCode, productCode, piecesPerBox, cost, price1, price2, price3, price4, price5, stockLocations
    } = productData;

    const isStockLocationsValid = stockLocations.every(location => location.location !== '' && location.quantity !== '');
    const isPricesValid = !Object.values(errors).some(error => error !== '');
    const isFormFilled = boxCode !== '' && productCode !== '' && piecesPerBox !== '' && cost !== '' && price1 !== '' && price2 !== '' && price3 !== '' && price4 !== '' && price5 !== '';

    setIsFormValid(isFormFilled && isStockLocationsValid && isPricesValid);
  }, [productData, errors]);

  useEffect(() => {
    checkFormValidity();
  }, [productData, errors, checkFormValidity]);

  return (
    <Layout>
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="border border-yellow-400 p-4 rounded">
            <legend className="text-xl font-bold text-yellow-400">Información del Producto</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Código de caja</label>
                <input
                  type="text"
                  name="boxCode"
                  value={productData.boxCode}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Código de producto</label>
                <input
                  type="text"
                  name="productCode"
                  value={productData.productCode}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Número de piezas por caja</label>
                <input
                  type="text"
                  name="piecesPerBox"
                  value={productData.piecesPerBox}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
            </div>
          </fieldset>
          <fieldset className="border border-yellow-400 p-4 rounded">
            <legend className="text-xl font-bold text-yellow-400">Precios y Costo</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Costo</label>
                <input
                  type="text"
                  name="cost"
                  value={productData.cost}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Precio 1</label>
                <input
                  type="text"
                  name="price1"
                  value={productData.price1}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
                {errors.price1 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price1}</p>}
              </div>
              <div>
                <label className="block mb-2">Precio 2</label>
                <input
                  type="text"
                  name="price2"
                  value={productData.price2}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
                {errors.price2 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price2}</p>}
              </div>
              <div>
                <label className="block mb-2">Precio 3</label>
                <input
                  type="text"
                  name="price3"
                  value={productData.price3}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
                {errors.price3 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price3}</p>}
              </div>
              <div>
                <label className="block mb-2">Precio 4</label>
                <input
                  type="text"
                  name="price4"
                  value={productData.price4}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
                {errors.price4 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price4}</p>}
              </div>
              <div>
                <label className="block mb-2">Precio 5</label>
                <input
                  type="text"
                  name="price5"
                  value={productData.price5}
                  onChange={handleNumericChange}
                  className="w-full p-2 bg-black border border-gray-700 rounded"
                  required
                />
                {errors.price5 && <p className="text-red-500 text-xs mt-1 mb-1.5">{errors.price5}</p>}
              </div>
            </div>
            </fieldset>
<fieldset className="border border-yellow-400 p-4 rounded">
  <legend className="text-xl font-bold text-yellow-400">Existencias y Ubicaciones</legend>
  {productData.stockLocations.map((stock, index) => (
    <div key={index} className="mb-4 flex space-x-4 items-end">
      <div className="flex-1">
        <label className="block mb-2">Ubicación</label>
        <input
          type="text"
          name="location"
          value={stock.location}
          onChange={(e) => handleInputChange(e, index)}
          className="w-full p-2 bg-black border border-gray-700 rounded"
          required
        />
      </div>
      <div className="flex-1">
        <label className="block mb-2">Existencia</label>
        <input
          type="text"
          name="quantity"
          value={stock.quantity}
          onChange={(e) => handleNumericChange(e, index)}
          className="w-full p-2 bg-black border border-gray-700 rounded"
          required
        />
      </div>
      <button
        type="button"
        onClick={() => handleRemoveLocation(index)}
        className="bg-red-500 text-white p-2 rounded"
      >
        Eliminar
      </button>
    </div>
  ))}
  <button
    type="button"
    onClick={handleAddLocation}
    className="bg-green-500 text-white p-2 rounded"
  >
    Añadir Ubicación
  </button>
</fieldset>
<button
  type="submit"
  className={`bg-blue-500 text-white p-2 rounded w-full ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
  disabled={!isFormValid}
>
  Registrar Producto
</button>
</form>
<Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
  className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-75"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50"
>
  <div className="bg-black rounded-lg shadow-xl p-6 max-w-sm w-full text-center border border-yellow-300">
    <h2 className="text-2xl font-bold text-white mb-4">Registro exitoso</h2>
    <p className="text-gray-400 mb-4">El producto ha sido registrado exitosamente.</p>
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

export default NewProduct;